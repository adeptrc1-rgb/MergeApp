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

load_dotenv()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# CORS
preview_origin = os.environ.get("PREVIEW_ORIGIN", "https://zodiac-dating.preview.emergentagent.com")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[preview_origin, "http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "astrology_dating_db")
if not MONGO_URL:
    raise RuntimeError("MONGO_URL not set in environment")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Constants
COOKIE_NAME = "session_token"
SECURE_COOKIES = True

def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def normalize_dt(val: Any) -> Optional[datetime]:
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val)
        except:
            return None
    return None

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[str] = None
    zodiac_sign: Optional[str] = None
    moon_sign: Optional[str] = None
    rising_sign: Optional[str] = None
    photos: Optional[List[str]] = []
    bio: Optional[str] = None
    interests: Optional[List[str]] = []
    profile_completed: bool = False
    mbti_scores: Optional[Dict[str, float]] = None
    personality_type: Optional[str] = None
    lifestyle_factors: Optional[Dict[str, int]] = None
    deal_breakers: Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None
    horoscope_preferences: Optional[Dict[str, Any]] = None
    last_spin_date: Optional[str] = None
    next_spin_time: Optional[str] = None
    spin_streak: int = 0
    spins_today: int = 0
    spin_reset_date: Optional[str] = None
    daily_spin_available: bool = True
    star_coins: int = 0
    profile_boosts: int = 0
    super_likes: int = 0
    direct_messages: int = 0
    is_premium: bool = False
    owned_items: Optional[List[str]] = []
    active_light: Optional[str] = None
    active_skin: Optional[str] = None
    current_streak: int = 0
    last_login_date: Optional[str] = None
    streak_saver_count: int = 0
    claimed_today: bool = False
    active_multiplier: Optional[Dict[str, Any]] = None

class LoginBody(BaseModel):
    email: str

class Session(BaseModel):
    token: str
    user_id: str
    expires_at: str

# Auth helper
async def get_current_user(request: Request) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    sess = await db.sessions.find_one({"token": token})
    if not sess:
        raise HTTPException(status_code=401, detail="Invalid session")
    exp = sess.get("expires_at")
    try:
        exp_dt = datetime.fromisoformat(exp)
    except:
        exp_dt = now_utc() - timedelta(days=1)
    if now_utc() > exp_dt:
        raise HTTPException(status_code=401, detail="Session expired")
    udoc = await db.users.find_one({"id": sess["user_id"]})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**udoc)

# Auth endpoints
@api_router.get("/auth/health")
async def auth_health():
    return {"ok": True, "time": now_utc().isoformat()}

@api_router.post("/auth/test-login")
async def test_login(body: LoginBody, response: Response):
    email = body.email.lower().strip()
    udoc = await db.users.find_one({"email": email})
    if not udoc:
        uid = str(uuid.uuid4())
        udoc = {
            "id": uid,
            "email": email,
            "first_name": "Test",
            "last_name": "User",
            "zodiac_sign": "Leo",
            "photos": ["https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&q=80"],
            "bio": "Test user",
            "interests": ["music", "coffee"],
            "profile_completed": True,
            "star_coins": 5000,
            "super_likes": 5,
            "profile_boosts": 2,
            "direct_messages": 10,
            "is_premium": False,
            "spins_today": 0,
            "spin_streak": 0,
            "likes_received_30d": 15,
            "matches_created_30d": 8,
            "message_replies_30d": 12,
            "trust_score": 90.0,
            "last_active_days": 0,
            "profile_completeness": 95.0
        }
        await db.users.insert_one(udoc)
    user = User(**udoc)
    token = str(uuid.uuid4())
    sess = {
        "token": token,
        "user_id": user.id,
        "expires_at": (now_utc() + timedelta(days=7)).isoformat()
    }
    await db.sessions.insert_one(sess)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=7*24*60*60,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="none",
        path="/"
    )
    return {"success": True, "user": user.dict(), "needs_onboarding": not user.profile_completed}

@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user.dict()

@api_router.put("/users/me")
async def update_user_profile(
    bio: Optional[str] = None,
    interests: Optional[list] = None,
    user: User = Depends(get_current_user)
):
    update_data = {}
    if bio is not None:
        update_data["bio"] = bio
    if interests is not None:
        update_data["interests"] = interests
    
    if update_data:
        await db.users.update_one(
            {"id": user.id},
            {"$set": update_data}
        )
    
    return {"success": True, "message": "Profile updated successfully"}

# Horoscope
@api_router.get("/horoscope/today")
async def horoscope_today(user: User = Depends(get_current_user)):
    return {
        "sign": user.zodiac_sign or "Leo",
        "constellation": user.zodiac_sign or "Leo",
        "message": "Your charisma is magnetic today. Take a step toward something bold.",
        "message_long": "The sun aligns with your ambitions. It's a perfect day to connect and express."
    }

# Matches
SIGN_COLORS = {
    "Aries": "#ef4444", "Taurus": "#10b981", "Gemini": "#22d3ee", "Cancer": "#60a5fa",
    "Leo": "#f59e0b", "Virgo": "#84cc16", "Libra": "#a78bfa", "Scorpio": "#f43f5e",
    "Sagittarius": "#f97316", "Capricorn": "#64748b", "Aquarius": "#06b6d4", "Pisces": "#38bdf8"
}

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
        if (m == sm and d >= sd) or (m == em and d <= ed):
            return sign
        if sm > em and (m == sm or m == em):
            if (m == sm and d >= sd) or (m == em and d <= ed):
                return sign
    return "Capricorn"

@api_router.get("/users/potential-matches")
async def potential_matches(user: User = Depends(get_current_user), force_season: Optional[str] = None):
    season = force_season or current_season_sign(now_utc().date())
    cur = db.users.find({"id": {"$ne": user.id}})
    docs = await cur.to_list(length=100)
    
    result = []
    for u in docs:
        sign = u.get("zodiac_sign", "Gemini")
        result.append({
            "id": u.get("id"),
            "first_name": u.get("first_name", "Star"),
            "last_name": u.get("last_name", ""),
            "zodiac_sign": sign,
            "moon_sign": u.get("moon_sign"),
            "rising_sign": u.get("rising_sign"),
            "birth_date": u.get("birth_date", "1995-01-01"),
            "photos": u.get("photos", ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80"]),
            "current_location": u.get("current_location", {"latitude": 34.05, "longitude": -118.24}),
            "compatibility_score": randf() * 30 + 70,
            "bio": u.get("bio", "Stargazer. Coffee lover."),
            "interests": u.get("interests", ["music", "coffee"]),
            "lifestyle_factors": u.get("lifestyle_factors", {}),
            "deal_breakers": u.get("deal_breakers", {}),
            "preferences": u.get("preferences", {})
        })
    return result

@api_router.get("/matches")
async def get_matches(user: User = Depends(get_current_user)):
    return []

# Trending Energies Algorithm with Responsiveness
def calculate_trending_energy_score(user_data: dict) -> float:
    """
    Calculate Trending Energy Score (0-100)
    Formula: Engagement(40%) + Compatibility Resonance(30%) + Behavior & Trust(20%) + Recency(10%)
    """
    
    # 1. Engagement Score (40% weight) - max 100 pts
    likes_received = min(user_data.get("likes_received_30d", 0), 50)
    matches_created = min(user_data.get("matches_created_30d", 0), 20)
    message_replies = min(user_data.get("message_replies_30d", 0), 30)
    
    engagement_score = (
        (likes_received / 50 * 40) +
        (matches_created / 20 * 35) +
        (message_replies / 30 * 25)
    )
    
    # 2. Compatibility Resonance (30% weight) - average compatibility of matches
    avg_compatibility = user_data.get("avg_match_compatibility", 75.0)
    compatibility_resonance = min(avg_compatibility * 1.1, 100)  # 10% boost, capped at 100
    
    # 3. Behavior & Trust Score (20% weight)
    trust_score = user_data.get("trust_score", 85.0)
    
    behavior_trust_score = trust_score
    
    # 4. Recency & Activity (15% weight)
    last_active_days = user_data.get("last_active_days", 7)
    if last_active_days == 0:
        recency_score = 100
    elif last_active_days <= 3:
        recency_score = 85
    elif last_active_days <= 7:
        recency_score = 70
    elif last_active_days <= 14:
        recency_score = 50
    else:
        recency_score = 30
    
    profile_completeness = user_data.get("profile_completeness", 70.0)
    recency_activity = recency_score * 0.70 + profile_completeness * 0.30
    
    # Final Trending Energy Score
    trending_score = (
        engagement_score * 0.40 +
        compatibility_resonance * 0.30 +
        behavior_trust_score * 0.20 +
        recency_activity * 0.10
    )
    
    return round(trending_score, 1)

@api_router.get("/users/trending")
async def get_trending_users(user: User = Depends(get_current_user)):
    """Get trending users based on energy score (minimum 60)"""
    cur = db.users.find({"id": {"$ne": user.id}})
    docs = await cur.to_list(length=100)
    
    trending_users = []
    for u in docs:
        # Calculate trending energy score
        user_data = {
            "likes_received_30d": u.get("likes_received_30d", 0),
            "matches_created_30d": u.get("matches_created_30d", 0),
            "message_replies_30d": u.get("message_replies_30d", 0),
            "avg_match_compatibility": u.get("avg_match_compatibility", 75.0),
            "trust_score": u.get("trust_score", 85.0),
            "last_active_days": u.get("last_active_days", 5),
            "profile_completeness": u.get("profile_completeness", 70.0)
        }
        
        energy_score = calculate_trending_energy_score(user_data)
        
        # Only include users with energy score >= 60
        if energy_score >= 60:
            trending_users.append({
                "id": u.get("id"),
                "first_name": u.get("first_name", "Star"),
                "last_name": u.get("last_name", ""),
                "zodiac_sign": u.get("zodiac_sign", "Leo"),
                "photos": u.get("photos", []),
                "bio": u.get("bio", ""),
                "interests": u.get("interests", []),
                "trending_energy_score": energy_score,
                "compatibility_score": randf() * 30 + 70
            })
    
    # Sort by energy score (highest first) and return top 20
    trending_users.sort(key=lambda x: x["trending_energy_score"], reverse=True)
    return trending_users[:20]

# Synchronized Cosmic Coinflip endpoints
@api_router.get("/matches/{match_id}/coinflip-status")
async def get_coinflip_status(match_id: str, user: User = Depends(get_current_user)):
    """Get synchronized coinflip status for a match"""
    coinflip = await db.coinflips.find_one({"match_id": match_id})
    if coinflip:
        return {
            "set": True,
            "first_user_id": coinflip.get("first_user_id"),
            "second_user_id": coinflip.get("second_user_id"),
            "animation_start_time": coinflip.get("animation_start_time"),
            "created_at": coinflip.get("created_at")
        }
    return {"set": False}

@api_router.post("/matches/{match_id}/coinflip")
async def create_coinflip(match_id: str, user: User = Depends(get_current_user)):
    """Create a synchronized coinflip with animation timing"""
    # Check if coinflip already exists
    existing = await db.coinflips.find_one({"match_id": match_id})
    if existing:
        return {
            "first_user_id": existing.get("first_user_id"),
            "second_user_id": existing.get("second_user_id"),
            "animation_start_time": existing.get("animation_start_time"),
            "winner_user_id": existing.get("first_user_id")
        }
    
    # Get match details to find both users
    match = await db.matches.find_one({"id": match_id})
    if not match:
        # For testing, create a mock coinflip with current user
        import random
        users = [user.id, "other_user_" + str(uuid.uuid4())]
        random.shuffle(users)
        
        # Schedule animation to start 2 seconds from now for sync
        animation_start = now_utc() + timedelta(seconds=2)
        
        coinflip = {
            "id": str(uuid.uuid4()),
            "match_id": match_id,
            "first_user_id": users[0],
            "second_user_id": users[1],
            "animation_start_time": animation_start.isoformat(),
            "created_at": now_utc().isoformat()
        }
        await db.coinflips.insert_one(coinflip)
        return {
            "first_user_id": users[0],
            "second_user_id": users[1],
            "animation_start_time": animation_start.isoformat(),
            "winner_user_id": users[0]
        }
    
    # Randomly determine who goes first
    import random
    users = [match.get("user1_id"), match.get("user2_id")]
    random.shuffle(users)
    
    # Schedule animation to start 2 seconds from now for sync
    animation_start = now_utc() + timedelta(seconds=2)
    
    coinflip = {
        "id": str(uuid.uuid4()),
        "match_id": match_id,
        "first_user_id": users[0],
        "second_user_id": users[1],
        "animation_start_time": animation_start.isoformat(),
        "created_at": now_utc().isoformat()
    }
    await db.coinflips.insert_one(coinflip)
    return {
        "first_user_id": users[0],
        "second_user_id": users[1],
        "animation_start_time": animation_start.isoformat(),
        "winner_user_id": users[0]
    }

@api_router.get("/matches/{match_id}/messages")
async def get_match_messages(match_id: str, user: User = Depends(get_current_user)):
    """Get messages for a specific match"""
    messages = await db.messages.find({"match_id": match_id}).sort("created_at", 1).to_list(length=1000)
    return messages

@api_router.post("/matches/test-create")
async def test_create_match(user: User = Depends(get_current_user)):
    """Create a test match for development"""
    match_id = str(uuid.uuid4())
    match = {
        "id": match_id,
        "user1_id": user.id,
        "user2_id": "test_user_" + str(uuid.uuid4()),
        "matched_at": now_utc().isoformat(),
        "compatibility_score": 88
    }
    await db.matches.insert_one(match)
    return {"match_id": match_id}

# Cosmic Wheel Rewards
REWARD_TABLE = [
    {"type": "boost", "label": "Profile Boost", "weight": 15, "tier": "common"},
    {"type": "super_like", "label": "Super Like", "weight": 20, "tier": "common"},
    {"type": "dm", "label": "Direct Message", "weight": 10, "tier": "rare"},
    {"type": "star_coins", "label": "50 Star Coins", "amount": 50, "weight": 25, "tier": "common"},
    {"type": "star_coins", "label": "100 Star Coins", "amount": 100, "weight": 15, "tier": "rare"},
    {"type": "star_coins", "label": "200 Star Coins", "amount": 200, "weight": 8, "tier": "epic"},
    {"type": "extra_spin", "label": "Extra Spin", "weight": 5, "tier": "epic"},
    {"type": "cooldown_skip", "label": "Cooldown Skip", "weight": 2, "tier": "legendary"},
]

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
    
    return {
        "can_spin": can_spin,
        "cooldown_hours": round(cooldown_hours, 2),
        "spin_streak": int(udoc.get("spin_streak", 0)),
        "spins_today": spins_today,
        "max_spins": max_spins,
        "is_premium": bool(udoc.get("is_premium", False))
    }

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
    
    if inc:
        await db.users.update_one({"id": user.id}, {"$inc": inc})
    await db.users.update_one({"id": user.id}, {"$set": update_doc})
    
    return SpinResult(reward=chosen, tier=chosen["tier"])

@api_router.post("/rewards/reset-cosmic-wheel")
async def reset_cosmic_wheel(user: User = Depends(get_current_user)):
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"spins_today": 0, "next_spin_time": None, "spin_reset_date": None}}
    )
    return {"success": True}

@api_router.post("/dev/add-coins")
async def add_coins_dev(user: User = Depends(get_current_user)):
    """Dev endpoint to add 5000 star coins"""
    await db.users.update_one(
        {"id": user.id},
        {"$inc": {"star_coins": 5000}}
    )
    udoc = await db.users.find_one({"id": user.id})
    return {"success": True, "new_balance": udoc.get("star_coins", 0)}

# 21-Day Streak System
STREAK_REWARDS = [
    {"day": 1, "type": "coins", "amount": 10, "tier": "bronze", "label": "10 Star Coins"},
    {"day": 2, "type": "multiplier", "amount": 1.05, "duration_hours": 24, "tier": "bronze", "label": "1.05× Multiplier (24h)"},
    {"day": 3, "type": "utility", "item": "redo", "amount": 1, "tier": "silver", "milestone": True, "label": "1 Redo"},
    {"day": 4, "type": "coins", "amount": 15, "tier": "bronze", "label": "15 Star Coins"},
    {"day": 5, "type": "cosmetic", "item": "basic_skin", "tier": "silver", "label": "Basic Profile Frame"},
    {"day": 6, "type": "utility", "item": "super_like", "amount": 1, "tier": "bronze", "label": "1 Super Like"},
    {"day": 7, "type": "boost", "duration_minutes": 15, "tier": "gold", "milestone": True, "label": "Profile Boost (15 min)"},
    {"day": 8, "type": "multiplier", "amount": 1.1, "duration_hours": 24, "tier": "bronze", "label": "1.10× Multiplier (24h)"},
    {"day": 9, "type": "coins", "amount": 20, "tier": "bronze", "label": "20 Star Coins"},
    {"day": 10, "type": "utility", "item": "dm_token", "amount": 1, "tier": "silver", "label": "1 Direct Message Token"},
    {"day": 11, "type": "cosmetic", "item": "premium_frame", "tier": "silver", "label": "Premium Card Frame"},
    {"day": 12, "type": "coins", "amount": 25, "tier": "bronze", "label": "25 Star Coins"},
    {"day": 13, "type": "utility", "item": "redo", "amount": 1, "tier": "bronze", "label": "1 Redo"},
    {"day": 14, "type": "boost", "duration_minutes": 30, "tier": "gold", "milestone": True, "label": "Profile Boost (30 min)"},
    {"day": 15, "type": "multiplier", "amount": 1.15, "duration_hours": 24, "tier": "silver", "label": "1.15× Multiplier (24h)"},
    {"day": 16, "type": "coins", "amount": 30, "tier": "bronze", "label": "30 Star Coins"},
    {"day": 17, "type": "cosmetic", "item": "rare_skin", "tier": "silver", "label": "Rare Premium Skin"},
    {"day": 18, "type": "utility", "item": "super_like", "amount": 1, "tier": "bronze", "label": "1 Super Like"},
    {"day": 19, "type": "coins", "amount": 35, "tier": "bronze", "label": "35 Star Coins"},
    {"day": 20, "type": "utility", "item": "dm_token", "amount": 1, "tier": "silver", "label": "1 Direct Message Token"},
    {"day": 21, "type": "legendary", "tier": "gold", "milestone": True, "label": "Legendary Bundle", 
     "bundle": {"premium_skin": 1, "boost": 2, "multiplier": {"amount": 1.25, "duration_hours": 48}}}
]

@api_router.get("/streaks/status")
async def get_streak_status(user: User = Depends(get_current_user)):
    """Get current streak status and available reward"""
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = date.today().isoformat()
    last_login = udoc.get("last_login_date")
    current_streak = udoc.get("current_streak", 0)
    claimed_today = udoc.get("claimed_today", False)
    
    # Check if streak should reset
    if last_login and last_login != today:
        try:
            last_date = date.fromisoformat(last_login)
            today_date = date.today()
            days_diff = (today_date - last_date).days
            
            if days_diff > 1:
                # Streak broken
                current_streak = 0
                claimed_today = False
                await db.users.update_one(
                    {"id": user.id},
                    {"$set": {"current_streak": 0, "claimed_today": False}}
                )
        except:
            pass
    
    # Get current day reward (1-21, cycles)
    reward_day = (current_streak % 21) + 1 if current_streak < 21 else 21
    current_reward = next((r for r in STREAK_REWARDS if r["day"] == reward_day), STREAK_REWARDS[0])
    next_reward = next((r for r in STREAK_REWARDS if r["day"] == reward_day + 1), STREAK_REWARDS[0])
    
    return {
        "current_streak": current_streak,
        "claimed_today": claimed_today,
        "can_claim": not claimed_today,
        "current_reward": current_reward,
        "next_reward": next_reward,
        "streak_saver_count": udoc.get("streak_saver_count", 0),
        "days_until_milestone": 21 - (current_streak % 21) if current_streak < 21 else 0
    }

@api_router.post("/streaks/claim")
async def claim_streak_reward(user: User = Depends(get_current_user)):
    """Claim today's streak reward"""
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = date.today().isoformat()
    claimed_today = udoc.get("claimed_today", False)
    
    if claimed_today:
        raise HTTPException(status_code=400, detail="Already claimed today's reward")
    
    current_streak = udoc.get("current_streak", 0)
    reward_day = (current_streak % 21) + 1 if current_streak < 21 else 21
    reward = next((r for r in STREAK_REWARDS if r["day"] == reward_day), STREAK_REWARDS[0])
    
    # Apply reward
    updates = {
        "current_streak": current_streak + 1,
        "claimed_today": True,
        "last_login_date": today
    }
    inc_updates = {}
    
    if reward["type"] == "coins":
        inc_updates["star_coins"] = reward["amount"]
    elif reward["type"] == "utility":
        if reward["item"] == "redo":
            inc_updates["redos"] = reward.get("amount", 1)
        elif reward["item"] == "super_like":
            inc_updates["super_likes"] = reward.get("amount", 1)
        elif reward["item"] == "dm_token":
            inc_updates["direct_messages"] = reward.get("amount", 1)
    elif reward["type"] == "boost":
        inc_updates["profile_boosts"] = 1
    elif reward["type"] == "multiplier":
        expires_at = (now_utc() + timedelta(hours=reward.get("duration_hours", 24))).isoformat()
        updates["active_multiplier"] = {
            "amount": reward["amount"],
            "expires_at": expires_at
        }
    elif reward["type"] == "legendary":
        bundle = reward.get("bundle", {})
        inc_updates["profile_boosts"] = bundle.get("boost", 2)
        if "multiplier" in bundle:
            expires_at = (now_utc() + timedelta(hours=bundle["multiplier"]["duration_hours"])).isoformat()
            updates["active_multiplier"] = {
                "amount": bundle["multiplier"]["amount"],
                "expires_at": expires_at
            }
    
    if inc_updates:
        await db.users.update_one({"id": user.id}, {"$inc": inc_updates})
    await db.users.update_one({"id": user.id}, {"$set": updates})
    
    return {
        "success": True,
        "reward": reward,
        "new_streak": current_streak + 1
    }

# Store System - Lights and Skins
STORE_ITEMS = [
    # Lights - Visual effects around profile cards
    {
        "id": "light_aurora",
        "name": "Aurora Shimmer",
        "type": "light",
        "price": 500,
        "description": "Mystical northern lights dance around your profile",
        "effect": {"type": "aurora", "colors": ["#00ff88", "#00ffff", "#8800ff"], "intensity": "medium"}
    },
    {
        "id": "light_cosmic_glow",
        "name": "Cosmic Glow",
        "type": "light",
        "price": 300,
        "description": "A soft cosmic glow that pulses with stardust",
        "effect": {"type": "glow", "color": "#a78bfa", "intensity": "soft"}
    },
    {
        "id": "light_fire_aura",
        "name": "Fire Aura",
        "type": "light",
        "price": 400,
        "description": "Flickering flames surround your profile with warmth",
        "effect": {"type": "flames", "colors": ["#ff6600", "#ffaa00"], "intensity": "medium"}
    },
    {
        "id": "light_moonbeam",
        "name": "Moonbeam",
        "type": "light",
        "price": 350,
        "description": "Gentle lunar rays illuminate your presence",
        "effect": {"type": "rays", "color": "#e0e7ff", "intensity": "soft"}
    },
    {
        "id": "light_starfield",
        "name": "Starfield",
        "type": "light",
        "price": 600,
        "description": "Twinkling stars orbit around your card",
        "effect": {"type": "particles", "particle": "star", "count": 15}
    },
    {
        "id": "light_pride_rainbow",
        "name": "Pride Rainbow",
        "type": "light",
        "price": 450,
        "description": "Celebrate love and identity with vibrant LGBTQ+ pride colors",
        "effect": {"type": "aurora", "colors": ["#e40303", "#ff8c00", "#ffed00", "#008026", "#24408e", "#732982"], "intensity": "vibrant"}
    },
    {
        "id": "light_autism_awareness",
        "name": "Autism Awareness",
        "type": "light",
        "price": 450,
        "description": "Support autism awareness with puzzle piece colors",
        "effect": {"type": "aurora", "colors": ["#0066cc", "#ffd700", "#22c55e", "#ef4444"], "intensity": "awareness"}
    },
    
    # Premium Skins - Overlay-based themes (no borders/frames)
    {
        "id": "skin_galaxy",
        "name": "Cosmic Galaxy",
        "type": "skin",
        "price": 1200,
        "description": "Semi-transparent star sparkles and nebula overlays on your photo",
        "effect": {
            "type": "galaxy",
            "overlay": "nebula_gradient",
            "overlayOpacity": 0.3,
            "particles": {"type": "stars", "count": 40, "twinkle": True},
            "textGlow": "#a78bfa",
            "badgeFloat": True,
            "nameAnimation": "glow"
        }
    },
    {
        "id": "skin_pastel",
        "name": "Pastel Dreams",
        "type": "skin",
        "price": 1000,
        "description": "Soft gradient overlay with gentle floating particles",
        "effect": {
            "type": "pastel",
            "overlay": "soft_gradient",
            "overlayColors": ["#ffc9e5", "#e5c9ff", "#c9ffe5"],
            "overlayOpacity": 0.25,
            "particles": {"type": "bubbles", "count": 25, "float": True},
            "textGlow": "#ffc9e5",
            "badgeFloat": True,
            "nameAnimation": "gradient_shift"
        }
    },
    {
        "id": "skin_zodiac",
        "name": "Zodiac Mystique",
        "type": "skin",
        "price": 1500,
        "description": "Faint constellation patterns and zodiac symbols over your photo",
        "effect": {
            "type": "zodiac",
            "overlay": "constellation_pattern",
            "overlayOpacity": 0.2,
            "particles": {"type": "zodiac_symbols", "count": 12, "float": True},
            "textGlow": "#ffd700",
            "badgeFloat": True,
            "badgeHalo": True,
            "nameAnimation": "shimmer"
        }
    },
    {
        "id": "skin_neon",
        "name": "Neon Nights",
        "type": "skin",
        "price": 1300,
        "description": "Dark overlay with glowing neon accents and floating icons",
        "effect": {
            "type": "neon",
            "overlay": "dark_vignette",
            "overlayOpacity": 0.4,
            "particles": {"type": "neon_icons", "count": 8, "glow": True},
            "textGlow": "#00ffff",
            "accentGlow": "#ff00ff",
            "nameAnimation": "neon_pulse",
            "badgeFloat": True
        }
    },
    {
        "id": "skin_pride_spectrum",
        "name": "Pride Spectrum",
        "type": "skin",
        "price": 1100,
        "description": "Your name and zodiac shimmer with vibrant LGBTQ+ rainbow colors",
        "effect": {
            "type": "pride",
            "overlay": "subtle_rainbow",
            "overlayOpacity": 0.15,
            "particles": {"type": "rainbow_sparkles", "count": 30, "float": True},
            "textGlow": "rainbow",
            "gradientColors": ["#e40303", "#ff8c00", "#ffed00", "#008026", "#24408e", "#732982"],
            "nameAnimation": "rainbow_gradient",
            "badgeFloat": True,
            "badgeRainbow": True
        }
    },
    {
        "id": "skin_autism_spectrum",
        "name": "Autism Spectrum",
        "type": "skin",
        "price": 1100,
        "description": "Your name and zodiac shine with autism awareness colors",
        "effect": {
            "type": "autism",
            "overlay": "subtle_puzzle",
            "overlayOpacity": 0.15,
            "particles": {"type": "puzzle_sparkles", "count": 25, "float": True},
            "textGlow": "autism",
            "gradientColors": ["#0066cc", "#ffd700", "#22c55e", "#ef4444"],
            "nameAnimation": "autism_gradient",
            "badgeFloat": True,
            "puzzleGlow": True
        }
    }
]

@api_router.get("/store/items")
async def get_store_items(user: User = Depends(get_current_user)):
    """Get all available store items"""
    return STORE_ITEMS

@api_router.get("/store/inventory")
async def get_user_inventory(user: User = Depends(get_current_user)):
    """Get user's owned items and active selections"""
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "owned_items": udoc.get("owned_items", []),
        "active_light": udoc.get("active_light"),
        "active_skin": udoc.get("active_skin"),
        "star_coins": udoc.get("star_coins", 0)
    }

class PurchaseBody(BaseModel):
    item_id: str

@api_router.post("/store/purchase")
async def purchase_item(body: PurchaseBody, user: User = Depends(get_current_user)):
    """Purchase an item from the store"""
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the item
    item = next((i for i in STORE_ITEMS if i["id"] == body.item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check if already owned
    owned_items = udoc.get("owned_items", [])
    if body.item_id in owned_items:
        raise HTTPException(status_code=400, detail="Item already owned")
    
    # Check if user has enough star coins
    star_coins = udoc.get("star_coins", 0)
    if star_coins < item["price"]:
        raise HTTPException(status_code=400, detail=f"Insufficient star coins. Need {item['price']}, have {star_coins}")
    
    # Deduct coins and add item to owned
    new_coins = star_coins - item["price"]
    owned_items.append(body.item_id)
    
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"star_coins": new_coins, "owned_items": owned_items}}
    )
    
    return {
        "success": True,
        "item": item,
        "remaining_coins": new_coins
    }

class ActivateBody(BaseModel):
    item_id: Optional[str] = None
    item_type: str  # "light" or "skin"

@api_router.post("/store/activate")
async def activate_item(body: ActivateBody, user: User = Depends(get_current_user)):
    """Activate/equip an owned item"""
    udoc = await db.users.find_one({"id": user.id})
    if not udoc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If item_id is None, deactivate the item type
    if body.item_id is None:
        field = "active_light" if body.item_type == "light" else "active_skin"
        await db.users.update_one(
            {"id": user.id},
            {"$set": {field: None}}
        )
        return {"success": True, "message": f"Deactivated {body.item_type}"}
    
    # Check if user owns the item
    owned_items = udoc.get("owned_items", [])
    if body.item_id not in owned_items:
        raise HTTPException(status_code=400, detail="Item not owned")
    
    # Find the item to verify type
    item = next((i for i in STORE_ITEMS if i["id"] == body.item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item["type"] != body.item_type:
        raise HTTPException(status_code=400, detail="Item type mismatch")
    
    # Activate the item
    field = "active_light" if body.item_type == "light" else "active_skin"
    await db.users.update_one(
        {"id": user.id},
        {"$set": {field: body.item_id}}
    )
    
    return {
        "success": True,
        "item": item,
        "message": f"Activated {item['name']}"
    }

app.include_router(api_router)
