from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, timezone, date
import os
import uuid

from motor.motor_asyncio import AsyncIOMotorClient

# -------------------------------------
# App and CORS
# -------------------------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")

FRONTEND_ORIGINS = [
    "https://astroapp-sync.preview.emergentagent.com",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------
# Mongo connection
# -------------------------------------
MONGO_URL = os.environ.get("MONGO_URL")
if not MONGO_URL:
    raise RuntimeError("MONGO_URL not set in environment")

client = AsyncIOMotorClient(MONGO_URL)
# Honor DB from URI (no hardcoded names)
try:
    db = client.get_default_database()
except Exception:
    db = None
if db is None:
    # As a safe fallback, use the database portion of URI if present
    # If not present, this will still create an implicit default DB per Mongo driver behavior
    # Note: We avoid hardcoding a name per platform rules
    db = client.get_database()

# -------------------------------------
# Helpers
# -------------------------------------
COOKIE_NAME = "session_token"
SECURE_COOKIES = True  # HTTPS preview uses secure cookies


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# -------------------------------------
# Models
# -------------------------------------
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[str] = None
    zodiac_sign: Optional[str] = None
    photos: Optional[List[str]] = []
    bio: Optional[str] = None
    profile_completed: bool = False

    # Scores and tracking
    responsiveness_score: float = 100.0  # legacy compatibility; we will store 0..30 too
    response_score: float = 100.0  # legacy sync
    trust_score: float = 70.0
    rolling_reply_avg_seconds_30d: Optional[float] = None
    rolling_reply_count_30d: int = 0

    # Subscores for trust
    match_completion_30d: float = 50.0
    engagement_consistency_30d: float = 50.0
    behavior_quality_30d: float = 80.0
    redemption_score_30d: float = 0.0

    # Penalty state
    penalty_active: bool = False
    penalty_started_at: Optional[str] = None
    penalty_ends_at: Optional[str] = None
    penalty_band: Optional[str] = None  # 'Aligned' | 'TrueMatch' | 'Cosmic'
    penalty_reflect_used: bool = False


class Session(BaseModel):
    token: str
    user_id: str
    expires_at: str


class ReplyEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    conversation_id: str
    delivered_at: str
    replied_at: Optional[str] = None
    reply_seconds: Optional[float] = None
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())


class ResponseBehavior(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action_type: str  # responded_quickly, continued_conversation, expired_match, ghosted, reflect_ritual
    match_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())
    response_time_hours: Optional[float] = None
    compatibility_level: Optional[str] = None
    penalty_applied: float = 0.0
    reward_applied: float = 0.0


# -------------------------------------
# Auth helpers
# -------------------------------------
async def get_current_user(request: Request) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    sess = await db.sessions.find_one({"token": token})
    if not sess:
        raise HTTPException(status_code=401, detail="Invalid session")
    # expiry check
    exp = sess.get("expires_at")
    try:
        exp_dt = datetime.fromisoformat(exp)
    except Exception:
        exp_dt = now_utc() - timedelta(days=1)
    if now_utc() > exp_dt:
        raise HTTPException(status_code=401, detail="Session expired")
    udoc = await db.users.find_one({"id": sess["user_id"]})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**udoc)


# -------------------------------------
# Auth endpoints (minimal for testing)
# -------------------------------------
class LoginBody(BaseModel):
    email: str


@api_router.post("/auth/test-login")
async def auth_test_login(body: LoginBody, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        # create basic user
        new_user = User(email=email, first_name="Test", last_name="User")
        await db.users.insert_one(new_user.dict())
        user = new_user.dict()
    token = str(uuid.uuid4())
    expires_at = (now_utc() + timedelta(days=7)).isoformat()
    await db.sessions.insert_one(Session(token=token, user_id=user["id"], expires_at=expires_at).dict())
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=7 * 24 * 60 * 60,
        httponly=False,
        secure=SECURE_COOKIES,
        samesite="none",
        path="/",
    )
    return {"success": True}


@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user.dict()


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db.sessions.delete_one({"token": token})
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"success": True}


# -------------------------------------
# Reply capture endpoints
# -------------------------------------
class DeliveredBody(BaseModel):
    conversation_id: str


class RepliedBody(BaseModel):
    conversation_id: str


@api_router.post("/replies/delivered")
async def replies_delivered(body: DeliveredBody, user: User = Depends(get_current_user)):
    ev = ReplyEvent(
        user_id=user.id,
        conversation_id=body.conversation_id,
        delivered_at=now_utc().isoformat(),
    )
    await db.reply_events.insert_one(ev.dict())
    return {"success": True}


@api_router.post("/replies/replied")
async def replies_replied(body: RepliedBody, user: User = Depends(get_current_user)):
    ev = await db.reply_events.find_one(
        {"user_id": user.id, "conversation_id": body.conversation_id, "replied_at": None},
        sort=[("delivered_at", -1)],
    )
    if not ev:
        return {"success": True, "message": "No pending delivery found"}
    delivered_dt = datetime.fromisoformat(ev["delivered_at"]) if isinstance(ev["delivered_at"], str) else now_utc()
    delta = (now_utc() - delivered_dt).total_seconds()
    # Cap at 72h
    delta = max(0.0, min(delta, 72 * 3600.0))
    await db.reply_events.update_one(
        {"id": ev["id"]},
        {"$set": {"replied_at": now_utc().isoformat(), "reply_seconds": float(delta)}},
    )
    await update_rolling_reply_average(user.id)
    return {"success": True, "reply_seconds": delta}


# -------------------------------------
# Responsiveness / Trust Score computation
# -------------------------------------
async def update_rolling_reply_average(user_id: str):
    cutoff = (now_utc() - timedelta(days=30)).isoformat()
    pipeline = [
        {"$match": {"user_id": user_id, "replied_at": {"$ne": None}, "delivered_at": {"$gte": cutoff}}},
        {"$group": {"_id": None, "count": {"$sum": 1}, "sum_sec": {"$sum": "$reply_seconds"}}},
    ]
    agg = await db.reply_events.aggregate(pipeline).to_list(length=None)
    if agg:
        count = agg[0].get("count", 0)
        sum_sec = agg[0].get("sum_sec", 0.0)
        avg = float(sum_sec) / float(count) if count > 0 else None
    else:
        count = 0
        avg = None
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"rolling_reply_count_30d": count, "rolling_reply_avg_seconds_30d": avg}},
    )
    await recompute_responsiveness_and_trust(user_id)


def map_avg_reply_to_points(avg_seconds: Optional[float]) -> float:
    # 0..30 points, inverse mapping per spec
    if avg_seconds is None:
        return 15.0
    h = avg_seconds / 3600.0
    if h <= 1.0:
        return 30.0
    if h <= 6.0:
        # 30 -> 20 across 5 hours
        return 30.0 - ((h - 1.0) / 5.0) * 10.0
    if h <= 24.0:
        # 20 -> 5 across 18 hours
        return 20.0 - ((h - 6.0) / 18.0) * 15.0
    return 2.0


async def compute_match_completion_score_30d(user_id: str) -> float:
    cutoff = (now_utc() - timedelta(days=30)).isoformat()
    total = await db.reply_events.count_documents({"user_id": user_id, "delivered_at": {"$gte": cutoff}})
    fast = await db.reply_events.count_documents({
        "user_id": user_id,
        "delivered_at": {"$gte": cutoff},
        "reply_seconds": {"$ne": None, "$lte": 24 * 3600},
    })
    if total == 0:
        return 50.0
    return float(max(0.0, min(100.0, (fast / total) * 100.0)))


async def compute_engagement_consistency_score_30d(user_id: str) -> float:
    cutoff = (now_utc() - timedelta(days=30)).isoformat()
    pipeline = [
        {"$match": {"user_id": user_id, "replied_at": {"$ne": None}, "delivered_at": {"$gte": cutoff}}},
        {"$project": {"day": {"$substr": ["$replied_at", 0, 10]}}},
        {"$group": {"_id": "$day"}},
    ]
    days = await db.reply_events.aggregate(pipeline).to_list(length=None)
    active_days = len(days)
    return float(min(100.0, (active_days / 30.0) * 100.0))


async def compute_behavior_quality_score_30d(user_id: str) -> float:
    cutoff = (now_utc() - timedelta(days=30)).isoformat()
    penalties = await db.response_behaviors.count_documents({
        "user_id": user_id,
        "action_type": {"$in": ["expired_match", "ghosted"]},
        "created_at": {"$gte": cutoff},
    })
    positives = await db.response_behaviors.count_documents({
        "user_id": user_id,
        "action_type": {"$in": ["responded_quickly", "continued_conversation"]},
        "created_at": {"$gte": cutoff},
    })
    base = 80.0 + positives * 2.0 - penalties * 5.0
    return float(max(0.0, min(100.0, base)))


async def compute_redemption_score_30d(user_id: str) -> float:
    cutoff = (now_utc() - timedelta(days=30)).isoformat()
    reflects = await db.response_behaviors.count_documents({
        "user_id": user_id,
        "action_type": "reflect_ritual",
        "created_at": {"$gte": cutoff},
    })
    return float(min(100.0, reflects * 20.0))


async def recompute_responsiveness_and_trust(user_id: str):
    udoc = await db.users.find_one({"id": user_id})
    if not udoc:
        return
    avg = udoc.get("rolling_reply_avg_seconds_30d")
    resp_points = map_avg_reply_to_points(avg)  # 0..30
    resp_component = (resp_points / 30.0) * 100.0

    match_completion = await compute_match_completion_score_30d(user_id)
    engagement = await compute_engagement_consistency_score_30d(user_id)
    behavior_quality = await compute_behavior_quality_score_30d(user_id)
    redemption = await compute_redemption_score_30d(user_id)

    trust = (
        resp_component * 0.30
        + match_completion * 0.25
        + engagement * 0.20
        + behavior_quality * 0.15
        + redemption * 0.10
    )
    trust = float(max(0.0, min(100.0, trust)))

    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "responsiveness_score": float(resp_points),
                "response_score": float(resp_points),  # keep in sync
                "trust_score": trust,
                "match_completion_30d": match_completion,
                "engagement_consistency_30d": engagement,
                "behavior_quality_30d": behavior_quality,
                "redemption_score_30d": redemption,
            }
        },
    )


# -------------------------------------
# Dynamic penalty & notifications
# -------------------------------------
async def offenses_in_last_week(user_id: str) -> int:
    cutoff = (now_utc() - timedelta(days=7)).isoformat()
    return await db.response_behaviors.count_documents({
        "user_id": user_id,
        "action_type": "expired_match",
        "created_at": {"$gte": cutoff},
    })


def band_for_compat(score: float) -> str:
    if 75 <= score <= 84:
        return "Aligned"
    if 85 <= score <= 94:
        return "TrueMatch"
    return "Cosmic"


def base_hours_for_band(band: str) -> int:
    return 6 if band == "Aligned" else 12 if band == "TrueMatch" else 24


async def compute_dynamic_penalty_hours(user_id: str, compatibility_score: float) -> float:
    if compatibility_score < 75:
        return 0.0
    udoc = await db.users.find_one({"id": user_id}) or {}
    trust = float(udoc.get("trust_score", 70.0))
    band = band_for_compat(compatibility_score)
    base = float(base_hours_for_band(band))

    if trust > 80:
        base *= 0.75
    elif trust < 50:
        base *= 1.25

    count = await offenses_in_last_week(user_id)
    if count >= 2:
        base *= 2.0

    recent_reflect = await db.response_behaviors.find_one({
        "user_id": user_id,
        "action_type": "reflect_ritual",
        "created_at": {"$gte": (now_utc() - timedelta(days=3)).isoformat()},
    })
    if recent_reflect:
        base *= 0.9

    return max(1.0, base)


def star_time_str(hours: float) -> str:
    if hours >= 24:
        days = int(hours // 24)
        rem_h = int(hours % 24)
        return f"{days}d {rem_h}h"
    return f"{int(hours)}h"


async def send_penalty_notification(user_id: str, penalty_hours: float):
    msg = f"The stars are realigning… your next match in {star_time_str(penalty_hours)}."
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": "penalty_notice",
        "message": msg,
        "created_at": now_utc().isoformat(),
    })


async def start_penalty_window(user_id: str, compatibility_score: float):
    hours = await compute_dynamic_penalty_hours(user_id, compatibility_score)
    if hours <= 0:
        return {"started": False}
    started = now_utc()
    ends = started + timedelta(hours=hours)
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "penalty_active": True,
                "penalty_started_at": started.isoformat(),
                "penalty_ends_at": ends.isoformat(),
                "penalty_band": band_for_compat(compatibility_score),
                "penalty_reflect_used": False,
            }
        },
    )
    await send_penalty_notification(user_id, hours)
    return {"started": True, "hours": hours}


# -------------------------------------
# Penalty status and reflect endpoints
# -------------------------------------
@api_router.get("/penalty/status")
async def penalty_status(user: User = Depends(get_current_user)):
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    active = bool(udoc.get("penalty_active"))
    started = udoc.get("penalty_started_at")
    ends = udoc.get("penalty_ends_at")
    band = udoc.get("penalty_band")
    reflect_used = bool(udoc.get("penalty_reflect_used", False))

    now = now_utc()
    s_dt = datetime.fromisoformat(started) if isinstance(started, str) else None
    e_dt = datetime.fromisoformat(ends) if isinstance(ends, str) else None

    if active and e_dt and now >= e_dt:
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"penalty_active": False}, "$unset": {"penalty_started_at": "", "penalty_ends_at": "", "penalty_band": ""}},
        )
        return {"active": False, "remaining_seconds": 0}

    remaining = int((e_dt - now).total_seconds()) if (active and e_dt) else 0
    total = int((e_dt - s_dt).total_seconds()) if (active and e_dt and s_dt) else None

    return {
        "active": active,
        "band": band,
        "reflect_used": reflect_used,
        "started_at": started,
        "ends_at": ends,
        "remaining_seconds": max(0, remaining),
        "total_seconds": total,
    }


@api_router.post("/penalty/reflect")
async def penalty_reflect(user: User = Depends(get_current_user)):
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    if not udoc.get("penalty_active"):
        raise HTTPException(status_code=400, detail="No active penalty")
    if udoc.get("penalty_reflect_used"):
        raise HTTPException(status_code=400, detail="Reflect already used")

    ends = udoc.get("penalty_ends_at")
    if not isinstance(ends, str):
        raise HTTPException(status_code=400, detail="Invalid penalty window")
    now = now_utc()
    e_dt = datetime.fromisoformat(ends)
    if now >= e_dt:
        await db.users.update_one({"id": user.id}, {"$set": {"penalty_active": False, "penalty_reflect_used": True}})
        return {"active": False, "remaining_seconds": 0}

    remaining = (e_dt - now).total_seconds()
    reduced = int(remaining * 0.8)  # 20% faster unlock
    new_end = now + timedelta(seconds=reduced)

    await db.users.update_one(
        {"id": user.id},
        {"$set": {"penalty_ends_at": new_end.isoformat(), "penalty_reflect_used": True}},
    )

    # Log redemption behavior and recompute trust
    await db.response_behaviors.insert_one(
        ResponseBehavior(user_id=user.id, action_type="reflect_ritual", reward_applied=2.0).dict()
    )
    await recompute_responsiveness_and_trust(user.id)

    return {"active": True, "remaining_seconds": reduced, "ends_at": new_end.isoformat()}


# -------------------------------------
# Admin test endpoints (optional)
# -------------------------------------
class StartPenaltyBody(BaseModel):
    compatibility_score: float


@api_router.post("/penalty/test-start")
async def penalty_test_start(body: StartPenaltyBody, user: User = Depends(get_current_user)):
    res = await start_penalty_window(user.id, body.compatibility_score)
    # also log behavior for analytics
    if body.compatibility_score >= 75:
        level = "high"
    elif body.compatibility_score >= 50:
        level = "medium"
    else:
        level = "low"
    await db.response_behaviors.insert_one(
        ResponseBehavior(user_id=user.id, action_type="expired_match", compatibility_level=level).dict()
    )
    return res


# -------------------------------------
# Health
# -------------------------------------
@api_router.get("/health")
async def health():
    return {"ok": True, "time": now_utc().isoformat()}


# Mount router
app.include_router(api_router)