from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, date, time, timedelta, timezone
import uuid
import os
import json

# ... [rest of imports and initializations unchanged]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# [CORS and DB setup sections are unchanged]

# ==========================
# MODELS (trimmed for brevity)
# ==========================
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    zodiac_sign: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = []
    photos: Optional[List[str]] = []
    location: Optional[Dict[str, Any]] = None
    current_location: Optional[Dict[str, Any]] = None
    age_range_min: Optional[int] = 18
    age_range_max: Optional[int] = 50
    max_distance_km: Optional[int] = 50
    profile_boosts: int = 4
    super_likes: int = 4
    direct_messages: int = 4
    boosts_expiry: Optional[datetime] = None
    super_likes_expiry: Optional[datetime] = None
    direct_messages_expiry: Optional[datetime] = None
    last_spin_date: Optional[datetime] = None
    next_spin_time: Optional[datetime] = None
    spin_streak: int = 0
    spins_today: int = 0
    spin_reset_date: Optional[date] = None
    daily_spin_available: bool = True
    star_coins: int = 0
    is_premium: bool = False
    premium_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    response_score: float = 100.0  # Legacy
    responsiveness_score: float = 100.0  # Canonical for ranking/penalties
    total_matches: int = 0
    responded_matches: int = 0
    avg_response_time: Optional[float] = None
    profile_completed: bool = False
    # Penalty window for high-compatibility expiration
    penalty_active: bool = False
    penalty_started_at: Optional[datetime] = None
    penalty_ends_at: Optional[datetime] = None
    penalty_band: Optional[str] = None  # '75-84' | '85-94' | '95-100'
    penalty_reflect_used: bool = False

# ... [Other models unchanged]

# ==========================
# RESPONSIVENESS SCORING
# ==========================
async def update_responsiveness_score(user_id: str, action_type: str, match_id: str,
                                    compatibility_level: str,
                                    response_time_hours: Optional[float] = None,
                                    compatibility_score_value: Optional[float] = None):
    """Update user's responsiveness score and penalty window based on behavior"""
    penalty = 0
    reward = 0

    if action_type == "responded_quickly" and response_time_hours and response_time_hours < 2:
        reward = 2
    elif action_type == "continued_conversation":
        reward = 1
    elif action_type == "expired_match":
        # Only penalize high compatibility (>=75), with scaled bands
        if compatibility_level == "high":
            if compatibility_score_value is not None:
                if 75 <= compatibility_score_value <= 84:
                    penalty = 5
                    band = "75-84"
                    duration = timedelta(hours=6)
                elif 85 <= compatibility_score_value <= 94:
                    penalty = 10
                    band = "85-94"
                    duration = timedelta(hours=12)
                elif 95 <= compatibility_score_value <= 100:
                    penalty = 15
                    band = "95-100"
                    duration = timedelta(hours=24)
                else:
                    penalty = 5
                    band = "75-84"
                    duration = timedelta(hours=6)
            else:
                # Default when exact score unknown
                penalty = 10
                band = "85-94"
                duration = timedelta(hours=12)
            # Set/extend penalty window on the user
            now = datetime.now(timezone.utc)
            user_doc = await db.users.find_one({"id": user_id})
            current_end = None
            if user_doc:
                current_end = user_doc.get("penalty_ends_at")
                if isinstance(current_end, str):
                    try:
                        current_end = datetime.fromisoformat(current_end)
                    except Exception:
                        current_end = None
            new_end = now + duration
            if current_end and current_end > now:
                # Extend to the later end time
                if new_end < current_end:
                    new_end = current_end
            await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "penalty_active": True,
                    "penalty_started_at": (user_doc.get("penalty_started_at") or now.isoformat()),
                    "penalty_ends_at": new_end.isoformat(),
                    "penalty_band": band,
                }, "$setOnInsert": {"penalty_reflect_used": False}}
            )
        else:
            penalty = 0  # No penalty for medium/low
    elif action_type == "ghosted":
        penalty = 5

    # Record behavior
    behavior = ResponseBehavior(
        user_id=user_id,
        action_type=action_type,
        match_id=match_id,
        response_time_hours=response_time_hours,
        compatibility_level=compatibility_level,
        penalty_applied=penalty,
        reward_applied=reward
    )
    await db.response_behaviors.insert_one(behavior.dict())

    # Update scores
    user = await db.users.find_one({"id": user_id})
    if user:
        current_score = user.get("responsiveness_score")
        if current_score is None:
            current_score = user.get("response_score", 100)
        new_score = max(0, min(100, float(current_score) + reward - penalty))
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"responsiveness_score": new_score, "response_score": new_score}}
        )

# ==========================
# PENALTY STATUS ENDPOINTS
# ==========================
@api_router.get("/penalty/status")
async def penalty_status(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    doc = await db.users.find_one({"id": user.id})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    active = bool(doc.get("penalty_active"))
    started = doc.get("penalty_started_at")
    ends = doc.get("penalty_ends_at")
    band = doc.get("penalty_band")
    reflect_used = bool(doc.get("penalty_reflect_used", False))

    now = datetime.now(timezone.utc)
    started_dt = None
    ends_dt = None
    if isinstance(started, str):
        try:
            started_dt = datetime.fromisoformat(started)
        except Exception:
            started_dt = None
    if isinstance(ends, str):
        try:
            ends_dt = datetime.fromisoformat(ends)
        except Exception:
            ends_dt = None

    if active and ends_dt and now >= ends_dt:
        # Clear penalty window
        await db.users.update_one({"id": user.id}, {"$set": {"penalty_active": False}, "$unset": {"penalty_started_at": "", "penalty_ends_at": "", "penalty_band": ""}})
        return {"active": False, "remaining_seconds": 0}

    remaining = int((ends_dt - now).total_seconds()) if (active and ends_dt) else 0
    total = int((ends_dt - started_dt).total_seconds()) if (active and ends_dt and started_dt) else None

    return {
        "active": active,
        "band": band,
        "reflect_used": reflect_used,
        "started_at": started,
        "ends_at": ends,
        "remaining_seconds": max(0, remaining),
        "total_seconds": total
    }

@api_router.post("/penalty/reflect")
async def penalty_reflect(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    doc = await db.users.find_one({"id": user.id})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    if not doc.get("penalty_active"):
        raise HTTPException(status_code=400, detail="No active penalty")
    if doc.get("penalty_reflect_used"):
        raise HTTPException(status_code=400, detail="Reflect already used")
    ends = doc.get("penalty_ends_at")
    now = datetime.now(timezone.utc)
    if isinstance(ends, str):
        try:
            ends_dt = datetime.fromisoformat(ends)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid penalty window")
    else:
        raise HTTPException(status_code=400, detail="Invalid penalty window")

    if now >= ends_dt:
        await db.users.update_one({"id": user.id}, {"$set": {"penalty_active": False, "penalty_reflect_used": True}})
        return {"active": False, "remaining_seconds": 0}

    remaining = (ends_dt - now).total_seconds()
    reduced = int(remaining * 0.8)  # 20% faster unlock
    new_end = now + timedelta(seconds=reduced)

    await db.users.update_one(
        {"id": user.id},
        {"$set": {"penalty_ends_at": new_end.isoformat(), "penalty_reflect_used": True}}
    )

    return {"active": True, "remaining_seconds": reduced, "ends_at": new_end.isoformat()}

# ... [rest of file unchanged]

app.include_router(api_router)