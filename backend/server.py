from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, timezone, date
import os
import uuid
from random import choices, random as randf
from dotenv import load_dotenv

from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables from .env file
load_dotenv()

# -------------------------------------
# App and CORS
# -------------------------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Start horoscope scheduler on app startup
@app.on_event("startup")
async def startup_event():
    """Initialize services on app startup"""
    try:
        from horoscope_scheduler import start_scheduler
        start_scheduler()
        print("✅ Horoscope notification scheduler started")
    except Exception as e:
        print(f"⚠️ Could not start horoscope scheduler: {e}")

FRONTEND_ORIGINS = [
    "https://starsign-love.preview.emergentagent.com",
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
DB_NAME = os.environ.get("DB_NAME", "astrology_dating_db")
if not MONGO_URL:
    raise RuntimeError("MONGO_URL not set in environment")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# -------------------------------------
# Helpers
# -------------------------------------
COOKIE_NAME = "session_token"
SECURE_COOKIES = True  # HTTPS preview requires secure cookies


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
    zodiac_sign: Optional[str] = None  # Sun sign
    moon_sign: Optional[str] = None
    rising_sign: Optional[str] = None
    photos: Optional[List[str]] = []
    bio: Optional[str] = None
    interests: Optional[List[str]] = []
    profile_completed: bool = False
    
    # MBTI personality scores (0-100 scale for each dimension)
    mbti_scores: Optional[Dict[str, float]] = None  # {energy, information, decision, planning, interaction}
    personality_type: Optional[str] = None  # 4-letter MBTI type (e.g., "INFJ")
    
    # Lifestyle factors (1-5 scale)
    lifestyle_factors: Optional[Dict[str, int]] = None  # 8 sliders

    # Deal-breakers (critical compatibility factors)
    deal_breakers: Optional[Dict[str, Any]] = None  # {relationship_goals, has_kids, want_kids, smoking}
    
    # Preferences / Nice-to-haves (bonus compatibility factors)
    preferences: Optional[Dict[str, Any]] = None  # {religion, politics, diet, exercise}

    # Horoscope Notification Preferences
    horoscope_preferences: Optional[Dict[str, Any]] = None  # {opt_in, time, timezone, frequency, last_sent, fcm_token}

    # Scores and tracking
    responsiveness_score: float = 100.0  # store 0..30 here for simplicity
    response_score: float = 100.0  # legacy sync
    trust_score: float = 70.0
    rolling_reply_avg_seconds_30d: Optional[float] = None
    rolling_reply_count_30d: int = 0
    match_completion_30d: float = 50.0
    engagement_consistency_30d: float = 50.0
    behavior_quality_30d: float = 80.0
    redemption_score_30d: float = 0.0

    # Daily Rewards & Cosmic Wheel
    last_spin_date: Optional[str] = None
    next_spin_time: Optional[str] = None
    spin_streak: int = 0
    spins_today: int = 0
    spin_reset_date: Optional[str] = None
    daily_spin_available: bool = True
    star_coins: int = 0

    # Inventory / premium
    profile_boosts: int = 0
    super_likes: int = 0
    direct_messages: int = 0
    is_premium: bool = False

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


class CoinFlipEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    user_first_id: str
    user_second_id: str
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())
    note: str = "The cosmos flipped a coin to choose who messages first."


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
async def auth_test_login(response: Response, body: Optional[LoginBody] = None):
    # Allow missing body for dev convenience
    email = ((body.email if body else 'testuser@asign.com') or '').lower().strip()

    # Ensure user exists and has a stable UUID id

async def _ensure_user_and_session(email: str, response: Response) -> Dict[str, Any]:
    email = (email or '').lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        new_user = User(email=email, first_name="Test", last_name="User", zodiac_sign="Gemini")
        await db.users.insert_one(new_user.dict())
        user = new_user.dict()
    else:
        if not user.get("id"):
            new_id = str(uuid.uuid4())
            await db.users.update_one({"_id": user.get("_id")}, {"$set": {"id": new_id}})
            user["id"] = new_id
    token = str(uuid.uuid4())
    expires_at = (now_utc() + timedelta(days=7)).isoformat()
    await db.sessions.insert_one(Session(token=token, user_id=user["id"], expires_at=expires_at).dict())
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="none",
        path="/",

@api_router.get("/auth/test-login")
async def auth_test_login_get(response: Response):
    return await _ensure_user_and_session('testuser@asign.com', response)

    )
    public_user = {
        "id": user["id"],
        "email": user.get("email"),
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "zodiac_sign": user.get("zodiac_sign"),
        "photos": user.get("photos", [])
    }
    return {"success": True, "user": public_user, "needs_onboarding": bool(not user.get("first_name") or not user.get("birth_date"))}


@api_router.get("/auth/health")
async def auth_health():
    return {"ok": True, "time": now_utc().isoformat()}

    user = await db.users.find_one({"email": email})
    if not user:
        new_user = User(email=email, first_name="Test", last_name="User", zodiac_sign="Gemini")
        await db.users.insert_one(new_user.dict())
        user = new_user.dict()
    else:
        if not user.get("id"):
            # Backfill missing id for legacy records
            new_id = str(uuid.uuid4())
            await db.users.update_one({"_id": user.get("_id")}, {"$set": {"id": new_id}})
            user["id"] = new_id

    # Create session
    token = str(uuid.uuid4())
    expires_at = (now_utc() + timedelta(days=7)).isoformat()
    await db.sessions.insert_one(Session(token=token, user_id=user["id"], expires_at=expires_at).dict())

    # Set secure session cookie for preview/prod
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="none",
        path="/",
    )

    # Return user snapshot to allow immediate UI update
    public_user = {
        "id": user["id"],
        "email": user.get("email"),
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "zodiac_sign": user.get("zodiac_sign"),
        "photos": user.get("photos", [])
    }
    return {"success": True, "user": public_user, "needs_onboarding": bool(not user.get("first_name") or not user.get("birth_date"))}


@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user.dict()



class OnboardingData(BaseModel):
    first_name: str
    birth_date: str
    birth_time: Optional[str] = None
    birth_location: Optional[dict] = None
    photos: List[str]
    interests: List[str]
    mbti_scores: dict  # {energy, information, decision, planning, interaction}
    personality_type: Optional[str] = None  # 4-letter MBTI type
    lifestyle_factors: dict  # 8 sliders
    deal_breakers: Optional[dict] = None  # {relationship_goals, has_kids, want_kids, smoking}
    preferences: Optional[dict] = None  # {religion, politics, diet, exercise}

@api_router.post("/onboarding/complete")
async def complete_onboarding(data: OnboardingData, user: User = Depends(get_current_user)):
    """Complete onboarding with MBTI, interests, lifestyle, deal-breakers, and preferences"""
    # Calculate zodiac sign from birth date
    from datetime import datetime
    birth_dt = datetime.fromisoformat(data.birth_date)
    zodiac_sign = calculate_zodiac_sign(birth_dt.month, birth_dt.day)
    
    # Update user with all onboarding data
    update_data = {
        "first_name": data.first_name,
        "birth_date": data.birth_date,
        "zodiac_sign": zodiac_sign,
        "photos": data.photos,
        "interests": data.interests,
        "mbti_scores": data.mbti_scores,
        "lifestyle_factors": data.lifestyle_factors,
        "profile_completed": True
    }
    
    # Add optional fields
    if data.personality_type:
        update_data["personality_type"] = data.personality_type
    
    if data.deal_breakers:
        update_data["deal_breakers"] = data.deal_breakers
    
    if data.preferences:
        update_data["preferences"] = data.preferences
    
    if data.birth_time:
        update_data["birth_time"] = data.birth_time
    
    if data.birth_location:
        update_data["birth_location"] = data.birth_location
        update_data["current_location"] = data.birth_location
    
    await db.users.update_one(
        {"id": user.id},
        {"$set": update_data}
    )
    
    return {"success": True, "message": "Onboarding completed successfully"}

def calculate_zodiac_sign(month: int, day: int) -> str:
    """Calculate zodiac sign from birth month and day"""
    zodiac_dates = [
        ("Capricorn", (12, 22), (1, 19)),
        ("Aquarius", (1, 20), (2, 18)),
        ("Pisces", (2, 19), (3, 20)),
        ("Aries", (3, 21), (4, 19)),
        ("Taurus", (4, 20), (5, 20)),
        ("Gemini", (5, 21), (6, 20)),
        ("Cancer", (6, 21), (7, 22)),
        ("Leo", (7, 23), (8, 22)),
        ("Virgo", (8, 23), (9, 22)),
        ("Libra", (9, 23), (10, 22)),
        ("Scorpio", (10, 23), (11, 21)),
        ("Sagittarius", (11, 22), (12, 21)),
    ]
    
    for sign, (start_month, start_day), (end_month, end_day) in zodiac_dates:
        if month == start_month and day >= start_day:
            return sign
        if month == end_month and day <= end_day:
            return sign
    
    return "Capricorn"  # Default fallback


# =====================================
# HOROSCOPE ENDPOINTS
# =====================================

@api_router.get("/horoscope/today")
async def get_today_horoscope(user: User = Depends(get_current_user)):
    """Get today's horoscope for the current user"""
    from horoscope_service import get_daily_horoscope
    from datetime import date
    
    if not user.zodiac_sign:
        raise HTTPException(status_code=400, detail="User zodiac sign not set")
    
    horoscope = get_daily_horoscope(user.zodiac_sign, date.today().isoformat())
    return horoscope


@api_router.post("/horoscope/preferences")
async def update_horoscope_preferences(
    opt_in: Optional[bool] = None,
    time: Optional[str] = None,
    timezone: Optional[str] = None,
    fcm_token: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Update user's horoscope notification preferences"""
    
    # Get existing preferences or create new
    prefs = user.horoscope_preferences or {
        "opt_in": False,
        "time": "08:00",
        "timezone": "America/New_York",
        "frequency": "daily",
        "last_sent": None,
        "fcm_token": None
    }
    
    # Update fields if provided
    if opt_in is not None:
        prefs["opt_in"] = opt_in
    if time is not None:
        prefs["time"] = time
    if timezone is not None:
        prefs["timezone"] = timezone
    if fcm_token is not None:
        prefs["fcm_token"] = fcm_token
    
    # Save to database
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"horoscope_preferences": prefs}}
    )
    
    return {"success": True, "preferences": prefs}


@api_router.get("/horoscope/preferences")
async def get_horoscope_preferences(user: User = Depends(get_current_user)):
    """Get user's horoscope notification preferences"""
    prefs = user.horoscope_preferences or {
        "opt_in": False,
        "time": "08:00",
        "timezone": "America/New_York",
        "frequency": "daily",
        "last_sent": None,
        "fcm_token": None
    }
    return prefs


@api_router.post("/horoscope/test-send")
async def test_send_horoscope(user: User = Depends(get_current_user)):
    """Test endpoint to send a horoscope notification immediately"""
    from horoscope_service import get_daily_horoscope
    from firebase_service import send_horoscope_notification
    from datetime import date
    
    if not user.zodiac_sign:
        raise HTTPException(status_code=400, detail="User zodiac sign not set")
    
    prefs = user.horoscope_preferences or {}
    fcm_token = prefs.get("fcm_token")
    
    if not fcm_token:
        raise HTTPException(status_code=400, detail="FCM token not set. Please enable notifications in settings.")
    
    # Get horoscope
    horoscope = get_daily_horoscope(user.zodiac_sign, date.today().isoformat())
    
    # Send notification
    success = await send_horoscope_notification(
        fcm_token=fcm_token,
        zodiac_sign=user.zodiac_sign,
        horoscope_message=horoscope["message"],
        date_str=date.today().isoformat()
    )
    
    if success:
        return {"success": True, "message": "Test notification sent!", "horoscope": horoscope}
    else:
        raise HTTPException(status_code=500, detail="Failed to send notification")


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        await db.sessions.delete_one({"token": token})
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"success": True}


# -------------------------------------
# Reply capture & Trust
# -------------------------------------
class DeliveredBody(BaseModel):
    conversation_id: str


class RepliedBody(BaseModel):
    conversation_id: str


@api_router.post("/replies/delivered")
async def replies_delivered(body: DeliveredBody, user: User = Depends(get_current_user)):
    ev = ReplyEvent(user_id=user.id, conversation_id=body.conversation_id, delivered_at=now_utc().isoformat())
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
    await db.reply_events.update_one({"id": ev["id"]}, {"$set": {"replied_at": now_utc().isoformat(), "reply_seconds": float(delta)}})
    await update_rolling_reply_average(user.id)
    return {"success": True, "reply_seconds": delta}


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
    await db.users.update_one({"id": user_id}, {"$set": {"rolling_reply_count_30d": count, "rolling_reply_avg_seconds_30d": avg}})
    await recompute_responsiveness_and_trust(user_id)


def map_avg_reply_to_points(avg_seconds: Optional[float]) -> float:
    if avg_seconds is None:
        return 15.0
    h = avg_seconds / 3600.0
    if h <= 1.0:
        return 30.0
    if h <= 6.0:
        return 30.0 - ((h - 1.0) / 5.0) * 10.0
    if h <= 24.0:
        return 20.0 - ((h - 6.0) / 18.0) * 15.0
    return 2.0


async def compute_match_completion_score_30d(user_id: str) -> float:
    cutoff = (now_utc() - timedelta(days=30)).isoformat()
    total = await db.reply_events.count_documents({"user_id": user_id, "delivered_at": {"$gte": cutoff}})
    fast = await db.reply_events.count_documents({"user_id": user_id, "delivered_at": {"$gte": cutoff}, "reply_seconds": {"$ne": None, "$lte": 24 * 3600}})
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
    penalties = await db.response_behaviors.count_documents({"user_id": user_id, "action_type": {"$in": ["expired_match", "ghosted"]}, "created_at": {"$gte": cutoff}})
    positives = await db.response_behaviors.count_documents({"user_id": user_id, "action_type": {"$in": ["responded_quickly", "continued_conversation"]}, "created_at": {"$gte": cutoff}})
    base = 80.0 + positives * 2.0 - penalties * 5.0
    return float(max(0.0, min(100.0, base)))


async def compute_redemption_score_30d(user_id: str) -> float:
    cutoff = (now_utc() - timedelta(days=30)).isoformat()
    reflects = await db.response_behaviors.count_documents({"user_id": user_id, "action_type": "reflect_ritual", "created_at": {"$gte": cutoff}})
    return float(min(100.0, reflects * 20.0))


async def recompute_responsiveness_and_trust(user_id: str):
    udoc = await db.users.find_one({"id": user_id})
    if not udoc:
        return
    avg = udoc.get("rolling_reply_avg_seconds_30d")
    resp_points = map_avg_reply_to_points(avg)
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

    await db.users.update_one({"id": user_id}, {"$set": {
        "responsiveness_score": float(resp_points),
        "response_score": float(resp_points),
        "trust_score": trust,
        "match_completion_30d": match_completion,
        "engagement_consistency_30d": engagement,
        "behavior_quality_30d": behavior_quality,
        "redemption_score_30d": redemption,
    }})


# -------------------------------------
# Dynamic penalty & notifications
# -------------------------------------
async def offenses_in_last_week(user_id: str) -> int:
    cutoff = (now_utc() - timedelta(days=7)).isoformat()
    return await db.response_behaviors.count_documents({"user_id": user_id, "action_type": "expired_match", "created_at": {"$gte": cutoff}})


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
    await db.users.update_one({"id": user_id}, {"$set": {
        "penalty_active": True,
        "penalty_started_at": started.isoformat(),
        "penalty_ends_at": ends.isoformat(),
        "penalty_band": band_for_compat(compatibility_score),
        "penalty_reflect_used": False,
    }})
    await send_penalty_notification(user_id, hours)
    return {"started": True, "hours": hours}


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
        await db.users.update_one({"id": user.id}, {"$set": {"penalty_active": False}, "$unset": {"penalty_started_at": "", "penalty_ends_at": "", "penalty_band": ""}})
        return {"active": False, "remaining_seconds": 0}

    remaining = int((e_dt - now).total_seconds()) if (active and e_dt) else 0
    total = int((e_dt - s_dt).total_seconds()) if (active and e_dt and s_dt) else None

    return {"active": active, "band": band, "reflect_used": reflect_used, "started_at": started, "ends_at": ends, "remaining_seconds": max(0, remaining), "total_seconds": total}


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

    await db.users.update_one({"id": user.id}, {"$set": {"penalty_ends_at": new_end.isoformat(), "penalty_reflect_used": True}})

    # Log redemption behavior and recompute trust
    await db.response_behaviors.insert_one(ResponseBehavior(user_id=user.id, action_type="reflect_ritual", reward_applied=2.0).dict())
    await recompute_responsiveness_and_trust(user.id)

    return {"active": True, "remaining_seconds": reduced, "ends_at": new_end.isoformat()}


@api_router.post("/penalty/test-start")
async def penalty_test_start(compatibility_score: float, user: User = Depends(get_current_user)):
    res = await start_penalty_window(user.id, compatibility_score)
    level = "high" if compatibility_score >= 75 else "medium" if compatibility_score >= 50 else "low"
    await db.response_behaviors.insert_one(ResponseBehavior(user_id=user.id, action_type="expired_match", compatibility_level=level).dict())
    return res


@api_router.post("/penalty/clear")
async def penalty_clear(user: User = Depends(get_current_user)):
    await db.users.update_one({"id": user.id}, {"$set": {"penalty_active": False}, "$unset": {"penalty_started_at": "", "penalty_ends_at": "", "penalty_band": "", "penalty_reflect_used": ""}})
    return {"success": True}


# -------------------------------------
# Cosmic Wheel
# -------------------------------------
REWARD_TABLE = [
    {"type": "boost", "name": "Profile Boost", "amount": 1, "tier": "common", "weight": 25},
    {"type": "super_like", "name": "Super Like", "amount": 1, "tier": "common", "weight": 25},
    {"type": "dm", "name": "Direct Message", "amount": 1, "tier": "common", "weight": 25},
    {"type": "star_coins", "name": "Star Coins", "amount": 25, "tier": "common", "weight": 15},
    {"type": "extra_spin", "name": "Extra Spin", "amount": 1, "tier": "rare", "weight": 6},
    {"type": "cooldown_skip", "name": "Cooldown Skip", "amount": 1, "tier": "rare", "weight": 3},
    {"type": "spotlight", "name": "Spotlight", "amount": 1, "tier": "rare", "weight": 1},
]


def normalize_dt(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except Exception:
        return None


@api_router.get("/rewards/cosmic-wheel-status")
async def cosmic_wheel_status(user: User = Depends(get_current_user)):
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    now = now_utc()

    spin_reset_str = udoc.get("spin_reset_date")
    today_str = date.fromtimestamp(now.timestamp()).isoformat()
    if spin_reset_str != today_str:
        await db.users.update_one({"id": user.id}, {"$set": {"spins_today": 0, "spin_reset_date": today_str}})
        udoc = await db.users.find_one({"id": user.id})

    max_spins = 1 + (1 if udoc.get("is_premium") else 0)
    spins_today = int(udoc.get("spins_today", 0))

    next_spin_time = normalize_dt(udoc.get("next_spin_time"))
    can_spin = False
    cooldown_hours = 0.0
    if spins_today < max_spins:
        if (not next_spin_time) or (now >= next_spin_time):
            can_spin = True
        else:
            cooldown_hours = max(0.0, (next_spin_time - now).total_seconds() / 3600.0)
    else:
        if next_spin_time and now < next_spin_time:
            cooldown_hours = max(0.0, (next_spin_time - now).total_seconds() / 3600.0)

    return {"can_spin": can_spin, "cooldown_hours": round(cooldown_hours, 2), "spin_streak": int(udoc.get("spin_streak", 0)), "spins_today": spins_today, "max_spins": max_spins, "is_premium": bool(udoc.get("is_premium", False))}


class SpinResult(BaseModel):
    reward: Dict[str, Any]
    tier: str


@api_router.post("/rewards/spin-cosmic-wheel", response_model=SpinResult)
async def spin_cosmic_wheel(user: User = Depends(get_current_user)):
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    now = now_utc()

    spin_reset_str = udoc.get("spin_reset_date")
    today_str = date.fromtimestamp(now.timestamp()).isoformat()
    if spin_reset_str != today_str:
        await db.users.update_one({"id": user.id}, {"$set": {"spins_today": 0, "spin_reset_date": today_str}})
        udoc = await db.users.find_one({"id": user.id})

    max_spins = 1 + (1 if udoc.get("is_premium") else 0)
    spins_today = int(udoc.get("spins_today", 0))
    next_spin_time = normalize_dt(udoc.get("next_spin_time"))
    if spins_today >= max_spins:
        raise HTTPException(status_code=400, detail="No spins remaining today")
    if next_spin_time and now < next_spin_time:
        raise HTTPException(status_code=400, detail="Cooldown active")

    chosen = choices(REWARD_TABLE, weights=[r["weight"] for r in REWARD_TABLE], k=1)[0]

    inc = {}
    if chosen["type"] == "boost":
        inc["profile_boosts"] = 1
    elif chosen["type"] == "super_like":
        inc["super_likes"] = 1
    elif chosen["type"] == "dm":
        inc["direct_messages"] = 1
    elif chosen["type"] == "star_coins":
        inc["star_coins"] = int(chosen["amount"]) or 10
    elif chosen["type"] == "cooldown_skip":
        await db.users.update_one({"id": user.id}, {"$unset": {"next_spin_time": ""}})

    spins_today += 1
    update_doc = {"spins_today": spins_today}
    if chosen["type"] != "extra_spin":
        cooldown_hours = 24 if not udoc.get("is_premium") else 12
        update_doc["next_spin_time"] = (now + timedelta(hours=cooldown_hours)).isoformat()
    else:
        update_doc["next_spin_time"] = None

    last_spin_date = udoc.get("last_spin_date")
    last = datetime.fromisoformat(last_spin_date).date() if last_spin_date else None
    today = now.date()
    streak = int(udoc.get("spin_streak", 0))
    if last and (today - last).days == 1:
        streak += 1
    elif not last or (today - last).days > 1:
        streak = 1
    update_doc["spin_streak"] = streak
    update_doc["last_spin_date"] = now.isoformat()

    if inc:
        await db.users.update_one({"id": user.id}, {"$inc": inc})
    await db.users.update_one({"id": user.id}, {"$set": update_doc})

    return {"reward": {"type": chosen["type"], "name": chosen["name"], "amount": chosen["amount"]}, "tier": chosen["tier"]}


class ClaimBody(BaseModel):
    reward_type: str
    amount: int


@api_router.post("/rewards/claim-reward")
async def claim_reward(body: ClaimBody, user: User = Depends(get_current_user)):
    if body.amount <= 0:
        raise HTTPException(status_code=422, detail="Invalid amount")
    inc = {}
    if body.reward_type == "boost":
        inc["profile_boosts"] = body.amount
    elif body.reward_type == "super_like":
        inc["super_likes"] = body.amount
    elif body.reward_type == "dm":
        inc["direct_messages"] = body.amount
    elif body.reward_type == "star_coins":
        inc["star_coins"] = body.amount
    else:
        return {"success": True}
    await db.users.update_one({"id": user.id}, {"$inc": inc})
    return {"success": True}


@api_router.post("/rewards/reset-cosmic-wheel")
async def reset_cosmic_wheel(user: User = Depends(get_current_user)):
    today_str = date.fromtimestamp(now_utc().timestamp()).isoformat()
    await db.users.update_one({"id": user.id}, {"$set": {"spins_today": 0, "spin_reset_date": today_str}, "$unset": {"next_spin_time": ""}})
    return {"success": True}


# -------------------------------------
# Matches & coinflip & messages
# -------------------------------------

def pick_partner_fields(u: dict) -> dict:
    return {
        "id": u.get("id"),
        "first_name": (u.get("first_name") or (u.get("name") or "Partner")).split(" ")[0],
        "last_name": u.get("last_name") or "",
        "zodiac_sign": u.get("zodiac_sign") or "Gemini",
        "birth_date": u.get("birth_date") or "1995-01-01",
        "photos": u.get("photos") or [],
        "current_location": u.get("current_location") or {"city": "Unknown"},
        "compatibility_score": u.get("compatibility_score") or 82,
    }


@api_router.get("/matches")
async def list_matches(user: User = Depends(get_current_user)):
    cur = db.matches.find({"$or": [{"user1_id": user.id}, {"user2_id": user.id}]})
    docs = await cur.to_list(length=None)
    out = []
    for m in docs:
        u1 = await db.users.find_one({"id": m.get("user1_id")})
        u2 = await db.users.find_one({"id": m.get("user2_id")})
        m["user1"] = pick_partner_fields(u1 or {})
        m["user2"] = pick_partner_fields(u2 or {})
        out.append(m)
    return out


class CreateTestMatchBody(BaseModel):
    partner_email: Optional[str] = None
    compatibility_score: Optional[float] = 85.0


@api_router.post("/matches/test-create")
async def create_test_match(body: CreateTestMatchBody, user: User = Depends(get_current_user)):
    email = (body.partner_email or "partner@asign.com").lower()
    partner = await db.users.find_one({"email": email})
    if not partner:
        partner_model = User(email=email, first_name="Partner", last_name="User", zodiac_sign="Libra")
        await db.users.insert_one(partner_model.dict())
        partner = partner_model.dict()
    mid = str(uuid.uuid4())
    match_doc = {"id": mid, "user1_id": user.id, "user2_id": partner.get("id"), "matched_at": now_utc().isoformat(), "compatibility_score": float(body.compatibility_score or 85.0)}
    await db.matches.insert_one(match_doc)
    return {"success": True, "match_id": mid}


@api_router.get("/matches/{match_id}/messages")
async def get_match_messages(match_id: str, user: User = Depends(get_current_user)):
    msgs = await db.messages.find({"match_id": match_id}).to_list(length=None)
    return msgs or []


@api_router.post("/matches/{match_id}/coinflip")
async def matches_coinflip(match_id: str, user: User = Depends(get_current_user)):
    match_doc = await db.matches.find_one({"id": match_id})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")
    uid1 = match_doc.get("user1_id")
    uid2 = match_doc.get("user2_id")
    if not uid1 or not uid2:
        raise HTTPException(status_code=422, detail="Invalid match data")
    first, second = (uid1, uid2) if randf() < 0.5 else (uid2, uid1)
    ev = CoinFlipEvent(match_id=match_id, user_first_id=first, user_second_id=second)
    await db.coinflip_events.insert_one(ev.dict())
    await db.notifications.insert_one({"id": str(uuid.uuid4()), "user_id": first, "type": "cosmic_coin", "message": "The stars chose you to begin this connection.", "created_at": now_utc().isoformat()})
    await db.notifications.insert_one({"id": str(uuid.uuid4()), "user_id": second, "type": "cosmic_coin", "message": "Your match will open the conversation first — the cosmos has spoken.", "created_at": now_utc().isoformat()})
    return {"match_id": match_id, "first": first, "second": second}


@api_router.get("/matches/{match_id}/coinflip-status")
async def matches_coinflip_status(match_id: str, user: User = Depends(get_current_user)):
    ev = await db.coinflip_events.find_one({"match_id": match_id}, sort=[("created_at", -1)])
    if not ev:
        return {"set": False}
    return {"set": True, "first": ev.get("user_first_id"), "second": ev.get("user_second_id"), "created_at": ev.get("created_at")}


# -------------------------------------
# Swipe & Potential Matches (Test-friendly)
# -------------------------------------
ZODIAC = [
    ("Aries", "Fire"), ("Taurus", "Earth"), ("Gemini", "Air"), ("Cancer", "Water"),
    ("Leo", "Fire"), ("Virgo", "Earth"), ("Libra", "Air"), ("Scorpio", "Water"),
    ("Sagittarius", "Fire"), ("Capricorn", "Earth"), ("Aquarius", "Air"), ("Pisces", "Water")
]


async def ensure_test_candidates(exclude_id: str, count: int = 10):
    # Create synthetic users if DB is sparse
    existing = await db.users.count_documents({"id": {"$ne": exclude_id}})
    to_create = max(0, count - existing)
    for i in range(to_create):
        name = f"Star{i+1}"
        sign, _ = ZODIAC[i % len(ZODIAC)]
        u = User(
            email=f"star{i+1}@asign.com",
            first_name=name,
            last_name="",
            zodiac_sign=sign,
            birth_date="1995-01-01",
            photos=["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80&auto=format&fit=crop"],
            current_location={"latitude": 34.05 + (i*0.01), "longitude": -118.24 - (i*0.01)}
        )
        await db.users.update_one({"email": u.email}, {"$setOnInsert": u.dict()}, upsert=True)


# Polarity pairs (opposite signs that attract)
POLAR_PAIRS = {
    "Aries": "Libra", "Taurus": "Scorpio", "Gemini": "Sagittarius",
    "Cancer": "Capricorn", "Leo": "Aquarius", "Virgo": "Pisces",
    "Libra": "Aries", "Scorpio": "Taurus", "Sagittarius": "Gemini",
    "Capricorn": "Cancer", "Aquarius": "Leo", "Pisces": "Virgo"
}

# Astrology trait keywords for each sign
ZODIAC_TRAITS = {
    "Aries": ["adventurous", "confident", "passionate", "energetic", "bold"],
    "Taurus": ["reliable", "patient", "practical", "devoted", "stable"],
    "Gemini": ["curious", "adaptable", "witty", "communicative", "versatile"],
    "Cancer": ["intuitive", "emotional", "protective", "nurturing", "sensitive"],
    "Leo": ["creative", "passionate", "generous", "cheerful", "confident"],
    "Virgo": ["analytical", "practical", "loyal", "kind", "hardworking"],
    "Libra": ["diplomatic", "gracious", "fair", "social", "cooperative"],
    "Scorpio": ["resourceful", "brave", "passionate", "stubborn", "intense"],
    "Sagittarius": ["generous", "idealistic", "adventurous", "philosophical", "optimistic"],
    "Capricorn": ["responsible", "disciplined", "self-control", "ambitious", "patient"],
    "Aquarius": ["progressive", "original", "independent", "humanitarian", "intellectual"],
    "Pisces": ["compassionate", "artistic", "intuitive", "gentle", "wise"]
}


# ============================================
# HOLISTIC COMPATIBILITY SYSTEM
# ============================================

def mbti_similarity(userA: dict, userB: dict) -> float:
    """
    Calculate MBTI personality compatibility (30% weight).
    Simple letter-by-letter matching for 4-letter types.
    Falls back to 5-dimensional scoring if types not available.
    """
    # Try letter-by-letter matching first
    type_a = userA.get("personality_type")
    type_b = userB.get("personality_type")
    
    if type_a and type_b and len(type_a) == 4 and len(type_b) == 4:
        matches = sum(a == b for a, b in zip(type_a, type_b))
        return (matches / 4.0) * 100.0
    
    # Fallback to 5-dimensional MBTI scoring
    mbti_a = userA.get("mbti_scores")
    mbti_b = userB.get("mbti_scores")
    
    if not mbti_a or not mbti_b:
        return 70.0  # Neutral score if MBTI data missing
    
    # Calculate similarity based on dimensional differences
    dimensions = ["energy", "information", "decision", "planning", "interaction"]
    total_diff = 0
    
    for dim in dimensions:
        val_a = mbti_a.get(dim, 50.0)
        val_b = mbti_b.get(dim, 50.0)
        # Normalize difference to 0-1 scale (max diff is 100)
        diff = abs(val_a - val_b) / 100.0
        total_diff += diff
    
    # Average difference across dimensions
    avg_diff = total_diff / len(dimensions)
    
    # Convert to similarity score (0-100)
    similarity = (1 - avg_diff) * 100
    
    return max(0.0, min(100.0, similarity))


def interest_similarity(userA: dict, userB: dict) -> float:
    """
    Calculate interests compatibility using Jaccard similarity (20% weight).
    Jaccard = intersection / union
    """
    interests_a = set(userA.get("interests", []))
    interests_b = set(userB.get("interests", []))
    
    if not interests_a or not interests_b:
        return 0.0  # Return 0 if no interests (will be scaled to 0-100)
    
    intersection = len(interests_a & interests_b)
    union = len(interests_a | interests_b)
    
    if union == 0:
        return 0.0
    
    jaccard = intersection / union
    
    # Return raw Jaccard score (0-1), will be scaled to 0-100
    return jaccard


def lifestyle_similarity(userA: dict, userB: dict) -> float:
    """
    Calculate lifestyle alignment based on 8 lifestyle factors (25% weight).
    Normalized difference scoring across all sliders.
    Each slider is 1-5 scale.
    """
    lifestyle_a = userA.get("lifestyle_factors") or userA.get("lifestyle")
    lifestyle_b = userB.get("lifestyle_factors") or userB.get("lifestyle")
    
    if not lifestyle_a or not lifestyle_b:
        return 0.5  # Neutral 50% if missing
    
    factors = [
        "fitness_health", "career_ambition", "social_energy", 
        "travel_adventure", "nightlife_lifestyle", "family_future",
        "dating_approach", "passions_hobbies"
    ]
    
    # Special weighting for family and dating (2x importance)
    weights = {
        "family_future": 2.0,
        "dating_approach": 2.0
    }
    
    total_diff = 0
    total_weight = 0
    
    for factor in factors:
        val_a = lifestyle_a.get(factor, 3)  # Default to neutral (3)
        val_b = lifestyle_b.get(factor, 3)
        weight = weights.get(factor, 1.0)
        
        # Calculate normalized difference (0-1 scale, where 0 = identical, 1 = max diff)
        # Max difference is 4 (1 to 5 scale)
        diff = abs(val_a - val_b) / 4.0
        total_diff += diff * weight
        total_weight += weight
    
    # Average weighted difference
    avg_diff = total_diff / total_weight if total_weight > 0 else 0
    
    # Convert to similarity (0-1 scale)
    similarity = 1 - avg_diff
    
    return max(0.0, min(1.0, similarity))


def astrology_similarity(userA: dict, userB: dict) -> float:
    """
    Calculate astrology compatibility (25% weight).
    Simplified scoring:
    - Element affinity (50% weight): 0.5 if same element
    - Polarity bonus (30% weight): 0.3 if same polarity
    - Sun-Moon match (20% weight): 0.2 if sun matches moon
    Returns score 0-1.
    """
    sun_a = userA.get("zodiac_sign")
    sun_b = userB.get("zodiac_sign")
    moon_a = userA.get("moon_sign")
    moon_b = userB.get("moon_sign")
    
    if not sun_a or not sun_b:
        return 0.5  # Neutral if missing
    
    # Element mapping
    elements = {
        "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
        "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
        "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
        "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
    }
    
    # Polarity mapping (positive/negative)
    polarities = {
        "Aries": "Positive", "Gemini": "Positive", "Leo": "Positive",
        "Libra": "Positive", "Sagittarius": "Positive", "Aquarius": "Positive",
        "Taurus": "Negative", "Cancer": "Negative", "Virgo": "Negative",
        "Scorpio": "Negative", "Capricorn": "Negative", "Pisces": "Negative"
    }
    
    score = 0.0
    
    # Element affinity (50% weight)
    elem_a = elements.get(sun_a)
    elem_b = elements.get(sun_b)
    if elem_a and elem_b and elem_a == elem_b:
        score += 0.5
    
    # Polarity bonus (30% weight)
    pol_a = polarities.get(sun_a)
    pol_b = polarities.get(sun_b)
    if pol_a and pol_b and pol_a == pol_b:
        score += 0.3
    
    # Sun-Moon match (20% weight)
    if moon_a and moon_b:
        if sun_a == moon_b or sun_b == moon_a:
            score += 0.2
    
    return min(1.0, score)


def dealbreaker_penalty(userA: dict, userB: dict) -> float:
    """
    Calculate penalty points for deal-breaker mismatches.
    Returns penalty value (0-100 points to subtract).
    
    Deal-breakers:
    - relationship_goals: 30 points
    - kids (has_kids + want_kids): 40 points
    - smoking: 20 points
    """
    penalty = 0
    
    deal_breakers_a = userA.get("deal_breakers", {})
    deal_breakers_b = userB.get("deal_breakers", {})
    
    if not deal_breakers_a or not deal_breakers_b:
        return 0  # No penalty if data missing
    
    # Relationship goals mismatch (30 points)
    goals_a = deal_breakers_a.get("relationship_goals")
    goals_b = deal_breakers_b.get("relationship_goals")
    
    if goals_a and goals_b and goals_a != goals_b:
        # Critical mismatches
        critical_pairs = [
            ("casual", "long-term"),
            ("casual", "marriage"),
            ("friends", "long-term"),
            ("friends", "marriage")
        ]
        for g1, g2 in critical_pairs:
            if (goals_a == g1 and goals_b == g2) or (goals_a == g2 and goals_b == g1):
                penalty += 30
                break
    
    # Kids mismatch (40 points)
    has_kids_a = deal_breakers_a.get("has_kids", False)
    has_kids_b = deal_breakers_b.get("has_kids", False)
    want_kids_a = deal_breakers_a.get("want_kids")
    want_kids_b = deal_breakers_b.get("want_kids")
    
    # Critical: One has kids and wants different things about future kids
    if (has_kids_a or has_kids_b) and want_kids_a and want_kids_b:
        if (want_kids_a == "yes" and want_kids_b == "no") or \
           (want_kids_a == "no" and want_kids_b == "yes"):
            penalty += 40
    
    # Smoking mismatch (20 points)
    smoking_a = deal_breakers_a.get("smoking")
    smoking_b = deal_breakers_b.get("smoking")
    
    if smoking_a and smoking_b:
        if (smoking_a == "no" and smoking_b == "yes") or \
           (smoking_a == "yes" and smoking_b == "no"):
            penalty += 20
    
    return penalty


def nice_to_have_bonus(userA: dict, userB: dict) -> float:
    """
    Calculate bonus points for nice-to-have matches.
    Returns bonus value (0-20 points to add).
    
    Nice-to-haves (5 points each):
    - religion
    - politics
    - diet
    - exercise
    """
    bonus = 0
    
    prefs_a = userA.get("preferences", {})
    prefs_b = userB.get("preferences", {})
    
    if not prefs_a or not prefs_b:
        return 0  # No bonus if data missing
    
    # Religion match (5 points)
    if prefs_a.get("religion") and prefs_b.get("religion"):
        if prefs_a["religion"] == prefs_b["religion"]:
            bonus += 5
    
    # Politics match (5 points)
    if prefs_a.get("politics") and prefs_b.get("politics"):
        if prefs_a["politics"] == prefs_b["politics"]:
            bonus += 5
    
    # Diet match (5 points)
    if prefs_a.get("diet") and prefs_b.get("diet"):
        if prefs_a["diet"] == prefs_b["diet"]:
            bonus += 5
    
    # Exercise match (5 points)
    if prefs_a.get("exercise") and prefs_b.get("exercise"):
        if prefs_a["exercise"] == prefs_b["exercise"]:
            bonus += 5
    
    return bonus


def calculate_holistic_compatibility(userA: dict, userB: dict) -> dict:
    """
    Master compatibility calculation with 5 dimensions plus adjustments.
    
    Weights:
    - MBTI: 30%
    - Lifestyle: 25%
    - Interests: 20%
    - Astrology: 25%
    - Deal-breakers: variable penalties
    - Nice-to-haves: variable bonuses
    
    Returns dict with breakdown and final score (0-100).
    """
    # Calculate each dimension (returns 0-1 scale)
    mbti_score = mbti_similarity(userA, userB)
    lifestyle_score = lifestyle_similarity(userA, userB)
    interests_score = interest_similarity(userA, userB)
    astrology_score = astrology_similarity(userA, userB)
    
    # Calculate base score (0-100)
    # Convert MBTI score from 0-100 to 0-1 scale to match other functions
    mbti_normalized = mbti_score / 100.0
    
    base_score = (
        mbti_normalized * 30.0 +
        lifestyle_score * 25.0 +
        interests_score * 20.0 +
        astrology_score * 25.0
    )
    
    # Apply deal-breaker penalties
    penalty = dealbreaker_penalty(userA, userB)
    
    # Apply nice-to-have bonuses
    bonus = nice_to_have_bonus(userA, userB)
    
    # Calculate final score
    final_score = base_score - penalty + bonus
    final_score = max(0, min(100, final_score))
    
    # Calculate Lifestyle Mesh Score (combination of lifestyle + interests)
    lifestyle_mesh_score = (
        lifestyle_score * 40.0 +
        interests_score * 60.0
    )
    
    return {
        "overall_compatibility": round(final_score, 1),
        "mbti_compatibility": round(mbti_score, 1),  # mbti_score is already 0-100
        "lifestyle_compatibility": round(lifestyle_score * 100, 1),
        "interests_compatibility": round(interests_score * 100, 1),
        "astrology_compatibility": round(astrology_score * 100, 1),
        "lifestyle_mesh_score": round(lifestyle_mesh_score, 1),
        "penalty": round(penalty, 1),
        "bonus": round(bonus, 1)
    }




# Backwards compatibility aliases
calculate_mbti_compatibility = mbti_similarity
calculate_interests_compatibility = interest_similarity
calculate_lifestyle_alignment = lifestyle_similarity
calculate_astrology_compatibility = astrology_similarity


def quick_compat(user_sign: Optional[str], other_sign: Optional[str]) -> float:
    """Basic compatibility based on sun sign only (for backwards compatibility)"""
    if not user_sign or not other_sign:
        return 70 + int(randf()*30)
    # Simple element affinity: Fire/Air, Earth/Water pairs a bit higher
    elem_map = {
        "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
        "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
        "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
        "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
    }
    e1 = elem_map.get(user_sign, "?")
    e2 = elem_map.get(other_sign, "?")
    base = 70 + int(randf()*20)
    if (e1 == "Fire" and e2 == "Air") or (e1 == "Air" and e2 == "Fire"):
        base += 8
    if (e1 == "Earth" and e2 == "Water") or (e1 == "Water" and e2 == "Earth"):
        base += 8
    return float(min(99, base))


def calculate_compatibility_with_polarity(userA: dict, userB: dict) -> float:
    """
    Enhanced compatibility calculation with polarity bonus.
    Considers sun_sign, moon_sign, and rising_sign for deeper compatibility.
    
    Args:
        userA: User dict with zodiac_sign (sun), moon_sign, rising_sign
        userB: User dict with zodiac_sign (sun), moon_sign, rising_sign
    
    Returns:
        Compatibility score (0-100) with polarity bonuses applied
    """
    # Get base compatibility from sun signs
    sun_sign_a = userA.get("zodiac_sign")
    sun_sign_b = userB.get("zodiac_sign")
    base_score = quick_compat(sun_sign_a, sun_sign_b)
    
    # Apply polarity bonus based on sun, moon, and rising signs
    polarity_bonus = 0
    polarity_fields = [
        ("zodiac_sign", "Sun"),  # Sun sign (primary)
        ("moon_sign", "Moon"),   # Moon sign (emotional)
        ("rising_sign", "Rising") # Rising sign (appearance/first impression)
    ]
    
    for field, sign_type in polarity_fields:
        sign_a = userA.get(field)
        sign_b = userB.get(field)
        
        # Check if signs exist and form a polar pair
        if sign_a and sign_b and POLAR_PAIRS.get(sign_a) == sign_b:
            # Higher bonus for high base scores (synergy effect)
            if base_score > 70:
                polarity_bonus += 8
            elif 50 <= base_score <= 70:
                polarity_bonus += 4
            # Lower base scores get smaller bonus
            elif base_score < 50:
                polarity_bonus += 2
    
    # Cap polarity bonus for diminishing returns
    polarity_bonus = min(polarity_bonus, 15)
    
    final_score = base_score + polarity_bonus
    return float(min(99, final_score))



async def calculate_trending_energy_score(user_id: str, user_doc: dict) -> float:
    """
    Calculate Trending Energy Score (0-100) based on:
    - Engagement (35%): likes received, matches, message responses, profile saves
    - Compatibility Resonance (25%): average compatibility of recent matches
    - Behavior & Trust (25%): responsiveness, low ghost rate, trust score
    - Recency & Activity (15%): logged in recently, updated profile
    """
    now = now_utc()
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)
    
    # === ENGAGEMENT SCORE (35%) ===
    # Count likes received in last 30 days
    likes_received = await db.likes.count_documents({
        "target_id": user_id,
        "created_at": {"$gte": thirty_days_ago.isoformat()}
    })
    
    # Count matches in last 30 days
    matches_count = await db.matches.count_documents({
        "$or": [{"user1_id": user_id}, {"user2_id": user_id}],
        "matched_at": {"$gte": thirty_days_ago.isoformat()}
    })
    
    # Count message responses (replied events)
    replies_count = await db.reply_events.count_documents({
        "replier_id": user_id,
        "replied_at": {"$gte": thirty_days_ago.isoformat()}
    })
    
    # Normalize engagement metrics (0-100)
    engagement_score = min(100, (
        (min(likes_received, 50) / 50 * 40) +  # likes: 0-40 points
        (min(matches_count, 20) / 20 * 35) +   # matches: 0-35 points
        (min(replies_count, 30) / 30 * 25)     # replies: 0-25 points
    ))
    
    # === COMPATIBILITY RESONANCE (25%) ===
    # Get average compatibility score of recent matches
    pipeline = [
        {
            "$match": {
                "$or": [{"user1_id": user_id}, {"user2_id": user_id}],
                "matched_at": {"$gte": thirty_days_ago.isoformat()}
            }
        },
        {
            "$group": {
                "_id": None,
                "avg_compatibility": {"$avg": "$compatibility_score"}
            }
        }
    ]
    
    compat_result = await db.matches.aggregate(pipeline).to_list(1)
    avg_compatibility = compat_result[0]["avg_compatibility"] if compat_result else 75.0
    compatibility_score = min(100, avg_compatibility * 1.1)  # Boost slightly, cap at 100
    
    # === BEHAVIOR & TRUST (25%) ===
    # Use existing trust score and behavior metrics from user doc
    trust_score = user_doc.get("trust_score", 70.0)
    behavior_quality = user_doc.get("behavior_quality_30d", 80.0)
    responsiveness = user_doc.get("responsiveness_score", 100.0)
    
    behavior_score = (trust_score * 0.5 + behavior_quality * 0.3 + responsiveness * 0.2)
    
    # === RECENCY & ACTIVITY (15%) ===
    # Check last login (we'll simulate with last_spin_date or use a new field)
    last_activity_str = user_doc.get("last_spin_date") or user_doc.get("created_at")
    activity_score = 50.0  # default
    
    if last_activity_str:
        try:
            last_activity = datetime.fromisoformat(last_activity_str.replace("Z", "+00:00"))
            days_since_activity = (now - last_activity).days
            
            if days_since_activity < 1:
                activity_score = 100.0  # Active today
            elif days_since_activity < 3:
                activity_score = 85.0   # Active in last 3 days
            elif days_since_activity < 7:
                activity_score = 70.0   # Active this week
            elif days_since_activity < 14:
                activity_score = 50.0   # Active in last 2 weeks
            else:
                activity_score = 30.0   # Less active
        except:
            activity_score = 50.0
    
    # Check profile completeness
    profile_completeness = 0
    if user_doc.get("photos") and len(user_doc.get("photos", [])) > 0:
        profile_completeness += 30
    if user_doc.get("bio"):
        profile_completeness += 30
    if user_doc.get("interests") and len(user_doc.get("interests", [])) > 0:
        profile_completeness += 40
    
    activity_score = (activity_score * 0.7 + profile_completeness * 0.3)
    
    # === FINAL WEIGHTED SCORE ===
    trending_energy_score = (
        engagement_score * 0.35 +
        compatibility_score * 0.25 +
        behavior_score * 0.25 +
        activity_score * 0.15
    )
    
    return round(trending_energy_score, 1)



def current_season_sign(today: date) -> str:
    seasons = [
        ("Capricorn", (12, 22), (1, 19)),
        ("Aquarius", (1, 20), (2, 18)),
        ("Pisces", (2, 19), (3, 20)),
        ("Aries", (3, 21), (4, 19)),
        ("Taurus", (4, 20), (5, 20)),
        ("Gemini", (5, 21), (6, 20)),
        ("Cancer", (6, 21), (7, 22)),
        ("Leo", (7, 23), (8, 22)),
        ("Virgo", (8, 23), (9, 22)),
        ("Libra", (9, 23), (10, 22)),
        ("Scorpio", (10, 23), (11, 21)),
        ("Sagittarius", (11, 22), (12, 21)),
    ]
    m = today.month
    d = today.day
    for sign, (sm, sd), (em, ed) in seasons:
        if (m == sm and d >= sd) or (m == em and d <= ed) or (sm < em and (m > sm and m < em)):
            # Note: wrap-around handled for Capricorn explicitly below
            if sign != "Capricorn":
                return sign
    # Capricorn or wrap-around
    return "Capricorn"

SIGN_COLORS = {
    "Aries": "#ef4444", "Taurus": "#10b981", "Gemini": "#22d3ee", "Cancer": "#60a5fa",
    "Leo": "#f59e0b", "Virgo": "#84cc16", "Libra": "#a78bfa", "Scorpio": "#f43f5e",
    "Sagittarius": "#f97316", "Capricorn": "#64748b", "Aquarius": "#06b6d4", "Pisces": "#38bdf8"
}

@api_router.get("/users/potential-matches")
async def potential_matches(user: User = Depends(get_current_user), force_season: Optional[str] = None):
    await ensure_test_candidates(user.id)
    
    # Get current user data for holistic compatibility
    current_user_doc = await db.users.find_one({"id": user.id})

    # Determine current season sign (UTC)
    today = date.fromtimestamp(now_utc().timestamp())
    season_sign = force_season if force_season else current_season_sign(today)
    
    # Query others
    cur = db.users.find({"id": {"$ne": user.id}})
    docs = await cur.to_list(length=100)

    # Build and weight
    items = []
    for u in docs:
        compat_breakdown = calculate_holistic_compatibility(current_user_doc, u)
        sign = u.get("zodiac_sign") or "Gemini"
        in_season = (sign == season_sign)
        weight = 2.0 if in_season else 1.0  # 2.0x exposure multiplier
        items.append({
            "doc": u,
            "sign": sign,
            "in_season": in_season,
            "weight": weight,
            "compat": compat_breakdown
        })

    # Weighted shuffle: sort by random()/weight so higher weight rises
    from random import random as rnd
    items.sort(key=lambda x: rnd() / x["weight"])  # bias toward in-season

    out = []
    for it in items[:50]:
        u = it["doc"]
        compat_breakdown = it["compat"]
        out.append({
            "id": u.get("id"),
            "first_name": u.get("first_name") or (u.get("name") or "Star"),
            "last_name": u.get("last_name") or "",
            "zodiac_sign": it["sign"],
            "moon_sign": u.get("moon_sign"),
            "rising_sign": u.get("rising_sign"),
            "birth_date": u.get("birth_date") or "1995-01-01",
            "photos": u.get("photos") or ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80&auto=format&fit=crop"],
            "current_location": u.get("current_location") or {"latitude": 34.05, "longitude": -118.24},
            "compatibility_score": compat_breakdown["overall_compatibility"],
            "compatibility_breakdown": compat_breakdown,
            "bio": u.get("bio"),
            "interests": u.get("interests"),
            "lifestyle_factors": u.get("lifestyle_factors"),
            "deal_breakers": u.get("deal_breakers"),
            "preferences": u.get("preferences"),

# =====================================
# Zodiac Season Spotlight - Test Routes
# =====================================
@api_router.post("/season/test-start")
async def season_test_start(sign: Optional[str] = None, notify: bool = True, user: User = Depends(get_current_user)):
    """Simulate the start of a Zodiac season for validation.
    - Persists a preview flag on the user
    - Optionally sends a push notification if FCM token is present
    """
    # Normalize sign
    today = date.fromtimestamp(now_utc().timestamp())
    chosen = (sign.title() if sign else current_season_sign(today))
    preview = {
        "active": True,
        "sign": chosen,
        "started_at": now_utc().isoformat()
    }
    await db.users.update_one({"id": user.id}, {"$set": {"season_spotlight_preview": preview}})

    notification_sent = False
    if notify:
        # Try sending a push notification if token exists
        try:
            udoc = await db.users.find_one({"id": user.id})
            prefs = (udoc or {}).get("horoscope_preferences", {})
            token = prefs.get("fcm_token")
            if token:
                from firebase_service import send_push_notification
                title = f"\u2728 Your season has started, {chosen}!"
                body = "You're glowing and getting extra exposure."
                # Use default deep link fallback configured in firebase_service
                notification_sent = await send_push_notification(
                    fcm_token=token,
                    title=title,
                    body=body,
                    deep_link=None,
                    data={"type": "season_spotlight", "sign": chosen}
                )
        except Exception as e:
            print(f"Season test notification error: {e}")
            notification_sent = False

    # Provide a preview URL hint for the frontend (use forceSeason query)
    return {
        "success": True,
        "sign": chosen,
        "preview": preview,
        "notification_sent": bool(notification_sent),
        "hint": {
            "preview_query": f"?forceSeason={chosen}",
            "force_param": "force_season in /api/users/potential-matches"
        }
    }


@api_router.get("/season/status")
async def season_status(user: User = Depends(get_current_user)):
    udoc = await db.users.find_one({"id": user.id})
    return {
        "active": bool((udoc or {}).get("season_spotlight_preview", {}).get("active", False)),
        "data": (udoc or {}).get("season_spotlight_preview")
    }


@api_router.post("/season/clear-test")
async def season_clear_test(user: User = Depends(get_current_user)):
    await db.users.update_one({"id": user.id}, {"$unset": {"season_spotlight_preview": ""}})
    return {"success": True}

            "season_spotlight_active": it["in_season"],
            "season_color": SIGN_COLORS.get(it["sign"], "#a78bfa"),
            "season_sign": season_sign
        })
    return out



@api_router.get("/users/trending-energies")
async def trending_energies(user: User = Depends(get_current_user)):
    """
    Return users with high Trending Energy Score.
    Shows people who are actively engaged, compatible, and have good behavior.
    Now uses enhanced compatibility with polarity bonus.
    """
    await ensure_test_candidates(user.id)
    
    # Get current user data for compatibility calculation
    current_user_doc = await db.users.find_one({"id": user.id})
    
    # Get all potential matches
    cur = db.users.find({"id": {"$ne": user.id}})
    docs = await cur.to_list(length=100)
    
    # Calculate trending energy score for each user
    scored_users = []
    for u in docs:
        energy_score = await calculate_trending_energy_score(u.get("id"), u)
        
        # Use holistic compatibility calculation
        compat_breakdown = calculate_holistic_compatibility(current_user_doc, u)
        
        scored_users.append({
            "id": u.get("id"),
            "first_name": u.get("first_name") or (u.get("name") or "Star"),
            "last_name": u.get("last_name") or "",
            "zodiac_sign": u.get("zodiac_sign") or "Gemini",
            "moon_sign": u.get("moon_sign"),
            "rising_sign": u.get("rising_sign"),
            "birth_date": u.get("birth_date") or "1995-01-01",
            "photos": u.get("photos") or ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80&auto=format&fit=crop"],
            "current_location": u.get("current_location") or {"latitude": 34.05, "longitude": -118.24},
            "compatibility_score": compat_breakdown["overall_compatibility"],
            "compatibility_breakdown": compat_breakdown,
            "trending_energy_score": energy_score,
        })
    
    # Sort by trending energy score (descending) and return top results
    scored_users.sort(key=lambda x: x["trending_energy_score"], reverse=True)
    
    # Only return users with trending energy score >= 60 (minimum threshold)
    trending_users = [u for u in scored_users if u["trending_energy_score"] >= 60.0]
    
    # Return top 20 trending users
    return trending_users[:20]



@api_router.post("/users/like/{target_id}")
async def like_user(target_id: str, user: User = Depends(get_current_user)):
    if target_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot like yourself")
    await db.likes.update_one(
        {"liker_id": user.id, "target_id": target_id},
        {"$set": {"liker_id": user.id, "target_id": target_id, "created_at": now_utc().isoformat()}},
        upsert=True,
    )
    return {"success": True}


@api_router.get("/users/check-match/{target_id}")
async def check_match(target_id: str, user: User = Depends(get_current_user)):
    # auto-match if high compatibility to make testing easy
    target = await db.users.find_one({"id": target_id})
    current_user_doc = await db.users.find_one({"id": user.id})
    
    # Use enhanced compatibility with polarity bonus
    comp = calculate_compatibility_with_polarity(current_user_doc, target) if target else 70.0
    if comp >= 82:
        # ensure reciprocal like
        await db.likes.update_one(
            {"liker_id": target_id, "target_id": user.id},
            {"$set": {"liker_id": target_id, "target_id": user.id, "created_at": now_utc().isoformat()}},
            upsert=True,
        )

    you_like = await db.likes.find_one({"liker_id": user.id, "target_id": target_id})
    they_like = await db.likes.find_one({"liker_id": target_id, "target_id": user.id})
    if you_like and they_like:
        # create match if doesn't exist
        existing = await db.matches.find_one({
            "$or": [
                {"user1_id": user.id, "user2_id": target_id},
                {"user1_id": target_id, "user2_id": user.id},
            ]
        })
        if not existing:
            mid = str(uuid.uuid4())
            match_doc = {"id": mid, "user1_id": user.id, "user2_id": target_id, "matched_at": now_utc().isoformat(), "compatibility_score": comp}
            await db.matches.insert_one(match_doc)
        else:
            mid = existing.get("id")
        return {"is_match": True, "match_id": mid}
    return {"is_match": False}


@api_router.post("/users/pass/{target_id}")
async def pass_user(target_id: str, user: User = Depends(get_current_user)):
    await db.passes.update_one(
        {"user_id": user.id, "target_id": target_id},
        {"$set": {"user_id": user.id, "target_id": target_id, "created_at": now_utc().isoformat()}},
        upsert=True,
    )
    return {"success": True}


@api_router.post("/users/super-like/{target_id}")
async def super_like_user(target_id: str, user: User = Depends(get_current_user)):
    # treat as like for testing and optionally decrement inventory
    await like_user(target_id, user)
    await db.users.update_one({"id": user.id}, {"$inc": {"super_likes": -1}})
    return {"success": True}


@api_router.post("/users/direct-message/{target_id}")
async def direct_message_match(target_id: str, user: User = Depends(get_current_user)):
    mid = str(uuid.uuid4())
    match_doc = {"id": mid, "user1_id": user.id, "user2_id": target_id, "matched_at": now_utc().isoformat(), "compatibility_score": 90.0}
    await db.matches.insert_one(match_doc)
    return {"success": True, "match_id": mid}


@api_router.post("/users/use-direct-message")
async def use_direct_message(user: User = Depends(get_current_user)):
    await db.users.update_one({"id": user.id}, {"$inc": {"direct_messages": -1}})
    return {"success": True}


@api_router.delete("/users/undo-swipe/{target_id}")
async def undo_swipe(target_id: str, user: User = Depends(get_current_user)):
    await db.likes.delete_one({"liker_id": user.id, "target_id": target_id})
    await db.passes.delete_one({"user_id": user.id, "target_id": target_id})
    return {"success": True}


# -------------------------------------
# Health
# -------------------------------------
@api_router.get("/health")
async def health():
    return {"ok": True, "time": now_utc().isoformat()}


# Mount router
app.include_router(api_router)