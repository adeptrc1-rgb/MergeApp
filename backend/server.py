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
preview_origin = os.environ.get("PREVIEW_ORIGIN", "https://cosmic-match-11.preview.emergentagent.com")
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
            "spin_streak": 0
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
        in_season = (sign == season)
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
            "preferences": u.get("preferences", {}),
            "season_spotlight_active": in_season,
            "season_color": SIGN_COLORS.get(sign, "#a78bfa"),
            "season_sign": season
        })
    return result

@api_router.get("/matches")
async def get_matches(user: User = Depends(get_current_user)):
    return []

# Coinflip endpoints for matches
@api_router.get("/matches/{match_id}/coinflip-status")
async def get_coinflip_status(match_id: str, user: User = Depends(get_current_user)):
    """Get coinflip status for a match"""
    coinflip = await db.coinflips.find_one({"match_id": match_id})
    if coinflip:
        return {"set": True, "first": coinflip.get("first_user_id"), "second": coinflip.get("second_user_id")}
    return {"set": False}

@api_router.post("/matches/{match_id}/coinflip")
async def create_coinflip(match_id: str, user: User = Depends(get_current_user)):
    """Create a coinflip to determine who messages first"""
    # Check if coinflip already exists
    existing = await db.coinflips.find_one({"match_id": match_id})
    if existing:
        return {"first": existing.get("first_user_id"), "second": existing.get("second_user_id")}
    
    # Get match details to find both users
    match = await db.matches.find_one({"id": match_id})
    if not match:
        # For testing, create a mock coinflip with current user
        import random
        users = [user.id, "other_user_" + str(uuid.uuid4())]
        random.shuffle(users)
        
        coinflip = {
            "id": str(uuid.uuid4()),
            "match_id": match_id,
            "first_user_id": users[0],
            "second_user_id": users[1],
            "created_at": now_utc().isoformat()
        }
        await db.coinflips.insert_one(coinflip)
        return {"first": users[0], "second": users[1]}
    
    # Randomly determine who goes first
    import random
    users = [match.get("user1_id"), match.get("user2_id")]
    random.shuffle(users)
    
    coinflip = {
        "id": str(uuid.uuid4()),
        "match_id": match_id,
        "first_user_id": users[0],
        "second_user_id": users[1],
        "created_at": now_utc().isoformat()
    }
    await db.coinflips.insert_one(coinflip)
    return {"first": users[0], "second": users[1]}

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
