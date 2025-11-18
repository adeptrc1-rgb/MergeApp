from fastapi import FastAPI, APIRouter, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, timezone, date
import os
import uuid
import random

# Basic in-memory session store (dev rescue). In prod, this should be Mongo-backed.
SESSIONS: Dict[str, Dict[str, Any]] = {}
USERS: Dict[str, Dict[str, Any]] = {}

COOKIE_NAME = "session_token"
SECURE_COOKIES = True  # Preview/prod over HTTPS

app = FastAPI()
api_router = APIRouter(prefix="/api")

preview_origin = os.environ.get("PREVIEW_ORIGIN", "https://datemerge.preview.emergentagent.com")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[preview_origin, "http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class LoginBody(BaseModel):
    email: Optional[str] = None


# Helpers
async def _ensure_user_and_session(email: str, response: Response) -> Dict[str, Any]:
    email = (email or 'testuser@asign.com').lower().strip()
    # Ensure user
    user = None
    for u in USERS.values():
        if u.get("email") == email:
            user = u
            break
    if not user:
        uid = str(uuid.uuid4())
        user = {
            "id": uid,
            "email": email,
            "first_name": "Test",
            "last_name": "User",
            "zodiac_sign": "Leo",
            "photos": [
                "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&q=80&auto=format&fit=crop"
            ],
        }
        USERS[uid] = user

    # Session
    token = str(uuid.uuid4())
    SESSIONS[token] = {
        "user_id": user["id"],
        "expires_at": (now_utc() + timedelta(days=7)).isoformat(),
    }
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="none",
        path="/",
    )
    return {"success": True, "user": user, "needs_onboarding": False}


def _get_current_user_from_cookie(request: Request) -> Dict[str, Any]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    sess = SESSIONS.get(token)
    if not sess:
        raise HTTPException(status_code=401, detail="Session invalid")
    uid = sess.get("user_id")
    user = USERS.get(uid)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@api_router.get("/auth/health")
async def auth_health():
    return {"ok": True, "time": now_utc().isoformat()}


@api_router.get("/auth/test-login")
async def auth_test_login_get(response: Response):
    return await _ensure_user_and_session('testuser@asign.com', response)


@api_router.post("/auth/test-login")
async def auth_test_login_post(response: Response, body: Optional[LoginBody] = None):
    email = (body.email if body else 'testuser@asign.com')
    return await _ensure_user_and_session(email, response)


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = _get_current_user_from_cookie(request)
    return user


# --- Horoscope minimal ---
@api_router.get("/horoscope/today")
async def horoscope_today():
    return {
        "sign": "Leo",
        "constellation": "Leo",
        "message": "Your charisma is magnetic today. Take a step toward something bold.",
        "message_long": "The sun aligns with your ambitions. It's a perfect day to connect and express."}


# --- Potential matches minimal ---
SIGN_COLORS = {
    "Aries": "#ef4444", "Taurus": "#10b981", "Gemini": "#22d3ee", "Cancer": "#60a5fa",
    "Leo": "#f59e0b", "Virgo": "#84cc16", "Libra": "#a78bfa", "Scorpio": "#f43f5e",
    "Sagittarius": "#f97316", "Capricorn": "#64748b", "Aquarius": "#06b6d4", "Pisces": "#38bdf8"
}

SEED_PHOTOS = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=900&q=80&auto=format&fit=crop",
]


def _season_sign(today: date) -> str:
    # Simple season detect (approximate)
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
            if sign != "Capricorn":
                return sign
    return "Capricorn"


@api_router.get("/users/potential-matches")
async def potential_matches(request: Request, force_season: Optional[str] = None):
    # Ensure logged in
    _ = _get_current_user_from_cookie(request)
    season = force_season or _season_sign(now_utc().date())
    names = [
        ("Ava", "Aries"), ("Liam", "Taurus"), ("Mia", "Gemini"), ("Noah", "Cancer"),
        ("Zoe", "Leo"), ("Ethan", "Virgo"), ("Ruby", "Libra"), ("Mason", "Scorpio"),
        ("Ivy", "Sagittarius"), ("Lucas", "Capricorn"), ("Ella", "Aquarius"), ("Jack", "Pisces")
    ]
    result = []
    for i, (first, sign) in enumerate(names):
        in_season = (sign == season)
        weight = 2.0 if in_season else 1.0
        if random.random() > (0.65 if in_season else 0.35):
            result.append({
                "id": f"seed-{i}",
                "first_name": first,
                "last_name": "",
                "zodiac_sign": sign,
                "birth_date": "1995-01-01",
                "photos": [SEED_PHOTOS[i % len(SEED_PHOTOS)]],
                "current_location": {"latitude": 34.05, "longitude": -118.24},
                "compatibility_score": random.randint(70, 98),
                "bio": "Stargazer. Coffee lover. Road trips and playlists.",
                "interests": ["music", "coffee", "hiking"],
                "lifestyle_factors": {"fitness_health": 3, "social_energy": 4},
                "deal_breakers": {"relationship_goals": "serious_relationship"},
                "preferences": {"music": "indie / lo-fi"},
                "season_spotlight_active": in_season,
                "season_color": SIGN_COLORS.get(sign, "#a78bfa"),
                "season_sign": season
            })
    # Ensure at least a couple
    if not result:
        result = [{
            "id": "fallback-1",
            "first_name": "Zoe",
            "last_name": "",
            "zodiac_sign": season,
            "birth_date": "1996-02-10",
            "photos": [SEED_PHOTOS[0]],
            "current_location": {"latitude": 34.05, "longitude": -118.24},
            "compatibility_score": 90,
            "bio": "Season glow engaged.",
            "interests": ["art", "yoga"],
            "lifestyle_factors": {"fitness_health": 4, "social_energy": 3},
            "deal_breakers": {"relationship_goals": "serious_relationship"},
            "preferences": {"music": "neo-soul"},
            "season_spotlight_active": True,
            "season_color": SIGN_COLORS.get(season, "#a78bfa"),
            "season_sign": season
        }]
    return result


# Minimal matches endpoints
@api_router.get("/matches")
async def get_matches(request: Request):
    _ = _get_current_user_from_cookie(request)
    return []


app.include_router(api_router)
