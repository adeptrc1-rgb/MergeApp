from fastapi import FastAPI, APIRouter, HTTPException, Depends, Cookie, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, date, timedelta
import requests
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize LLM Chat
llm_key = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="A Sign - Astrology Dating API")
api_router = APIRouter(prefix="/api")

# Zodiac sign data
ZODIAC_SIGNS = {
    "aries": {"element": "fire", "dates": "March 21 - April 19"},
    "taurus": {"element": "earth", "dates": "April 20 - May 20"},
    "gemini": {"element": "air", "dates": "May 21 - June 20"},
    "cancer": {"element": "water", "dates": "June 21 - July 22"},
    "leo": {"element": "fire", "dates": "July 23 - August 22"},
    "virgo": {"element": "earth", "dates": "August 23 - September 22"},
    "libra": {"element": "air", "dates": "September 23 - October 22"},
    "scorpio": {"element": "water", "dates": "October 23 - November 21"},
    "sagittarius": {"element": "fire", "dates": "November 22 - December 21"},
    "capricorn": {"element": "earth", "dates": "December 22 - January 19"},
    "aquarius": {"element": "air", "dates": "January 20 - February 18"},
    "pisces": {"element": "water", "dates": "February 19 - March 20"}
}

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    birth_date: date
    birth_time: Optional[str] = None
    birth_location: Optional[str] = None
    zodiac_sign: str
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    birth_date: str
    birth_time: Optional[str] = None
    birth_location: Optional[str] = None
    bio: Optional[str] = None

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    compatibility_score: float
    compatibility_report: str
    status: str = "pending"  # pending, matched, declined
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user1_liked: Optional[bool] = None
    user2_liked: Optional[bool] = None

class Swipe(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    swiper_id: str
    swiped_id: str
    liked: bool
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions
def get_zodiac_sign(birth_date: date) -> str:
    """Calculate zodiac sign from birth date"""
    month, day = birth_date.month, birth_date.day
    
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "aries"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "gemini"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "libra"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "scorpio"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "capricorn"
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "aquarius"
    else:
        return "pisces"

async def calculate_compatibility(sign1: str, sign2: str) -> Dict[str, Any]:
    """Calculate compatibility between two zodiac signs using AI"""
    try:
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"compatibility_{sign1}_{sign2}",
            system_message="You are an expert astrologer. Provide compatibility analysis between zodiac signs with a score from 0-100 and detailed explanation."
        ).with_model("openai", "gpt-4o-mini")
        
        prompt = f"Analyze the romantic compatibility between {sign1.title()} and {sign2.title()}. Provide:\n1. A compatibility score from 0-100\n2. A detailed explanation of their compatibility including strengths and challenges\n3. Advice for making the relationship work\n\nFormat your response as: SCORE: [number]\nANALYSIS: [detailed analysis]"
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse response
        lines = response.strip().split('\n')
        score = 75  # default score
        analysis = "Compatible signs with good potential."
        
        for line in lines:
            if line.startswith("SCORE:"):
                try:
                    score = float(line.split(":")[1].strip())
                except:
                    pass
            elif line.startswith("ANALYSIS:"):
                analysis = line.split(":", 1)[1].strip()
        
        return {
            "score": score,
            "report": analysis
        }
    except Exception as e:
        print(f"Error calculating compatibility: {e}")
        # Fallback compatibility logic
        element_compatibility = {
            ("fire", "fire"): 85,
            ("fire", "air"): 90,
            ("fire", "earth"): 60,
            ("fire", "water"): 40,
            ("earth", "earth"): 80,
            ("earth", "water"): 85,
            ("earth", "air"): 45,
            ("air", "air"): 75,
            ("air", "water"): 50,
            ("water", "water"): 88
        }
        
        elem1 = ZODIAC_SIGNS[sign1]["element"]
        elem2 = ZODIAC_SIGNS[sign2]["element"]
        score = element_compatibility.get((elem1, elem2), element_compatibility.get((elem2, elem1), 65))
        
        return {
            "score": score,
            "report": f"{sign1.title()} and {sign2.title()} have {score}% compatibility based on their elemental match."
        }

async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)) -> Optional[User]:
    """Get current user from session token"""
    token = session_token
    
    # Fallback to Authorization header
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    if not token:
        return None
    
    session = await db.sessions.find_one({"session_token": token})
    if not session or datetime.now(timezone.utc) > session["expires_at"]:
        return None
    
    user_data = await db.users.find_one({"id": session["user_id"]})
    if not user_data:
        return None
    
    return User(**user_data)

# Authentication endpoints
@api_router.post("/auth/session")
async def create_session(response: Response, x_session_id: str = Header(..., alias="X-Session-ID")):
    """Process session ID from Emergent Auth"""
    try:
        # Get user data from Emergent Auth
        auth_response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": x_session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_data = auth_response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        
        user_id = None
        if existing_user:
            user_id = existing_user["id"]
            # Update last active
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"last_active": datetime.now(timezone.utc)}}
            )
        else:
            # Create new user (will need onboarding)
            user_id = str(uuid.uuid4())
            new_user = {
                "id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture"),
                "created_at": datetime.now(timezone.utc),
                "last_active": datetime.now(timezone.utc),
                "is_active": True,
                "needs_onboarding": True
            }
            await db.users.insert_one(new_user)
        
        # Create session
        session_token = user_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = Session(
            user_id=user_id,
            session_token=session_token,
            expires_at=expires_at
        )
        
        await db.sessions.insert_one(session.dict())
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            max_age=7 * 24 * 60 * 60,
            httponly=True,
            secure=True,
            samesite="none",
            path="/"
        )
        
        return {
            "success": True,
            "user_id": user_id,
            "needs_onboarding": existing_user is None or existing_user.get("needs_onboarding", True)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user info"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, user: User = Depends(get_current_user)):
    """Logout user"""
    if user:
        await db.sessions.delete_many({"user_id": user.id})
    
    response.delete_cookie("session_token", path="/")
    return {"success": True}

# User endpoints
@api_router.post("/users/complete-profile")
async def complete_profile(profile_data: UserCreate, user: User = Depends(get_current_user)):
    """Complete user profile after onboarding"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Parse birth date
    try:
        birth_date = datetime.strptime(profile_data.birth_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Calculate zodiac sign
    zodiac_sign = get_zodiac_sign(birth_date)
    
    # Update user profile
    update_data = {
        "birth_date": birth_date.isoformat(),
        "zodiac_sign": zodiac_sign,
        "needs_onboarding": False
    }
    
    if profile_data.birth_time:
        update_data["birth_time"] = profile_data.birth_time
    if profile_data.birth_location:
        update_data["birth_location"] = profile_data.birth_location
    if profile_data.bio:
        update_data["bio"] = profile_data.bio
    
    await db.users.update_one(
        {"id": user.id},
        {"$set": update_data}
    )
    
    return {"success": True, "zodiac_sign": zodiac_sign}

@api_router.get("/users/potential-matches")
async def get_potential_matches(user: User = Depends(get_current_user)):
    """Get potential matches for the user"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get users already swiped
    swiped_users = await db.swipes.find({"swiper_id": user.id}).to_list(length=None)
    swiped_ids = [s["swiped_id"] for s in swiped_users] + [user.id]
    
    # Get potential matches (excluding already swiped and self)
    potential_matches = await db.users.find({
        "id": {"$nin": swiped_ids},
        "is_active": True,
        "needs_onboarding": {"$ne": True}
    }).limit(10).to_list(length=None)
    
    return potential_matches

@api_router.post("/users/swipe")
async def swipe_user(swipe_data: dict, user: User = Depends(get_current_user)):
    """Swipe on a user (like or pass)"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    swiped_id = swipe_data.get("swiped_id")
    liked = swipe_data.get("liked", False)
    
    if not swiped_id:
        raise HTTPException(status_code=400, detail="Missing swiped_id")
    
    # Check if already swiped
    existing_swipe = await db.swipes.find_one({
        "swiper_id": user.id,
        "swiped_id": swiped_id
    })
    
    if existing_swipe:
        raise HTTPException(status_code=400, detail="Already swiped on this user")
    
    # Create swipe record
    swipe = Swipe(
        swiper_id=user.id,
        swiped_id=swiped_id,
        liked=liked
    )
    
    await db.swipes.insert_one(swipe.dict())
    
    # Check for mutual like
    if liked:
        mutual_swipe = await db.swipes.find_one({
            "swiper_id": swiped_id,
            "swiped_id": user.id,
            "liked": True
        })
        
        if mutual_swipe:
            # Create match
            swiped_user = await db.users.find_one({"id": swiped_id})
            if swiped_user:
                compatibility = await calculate_compatibility(user.zodiac_sign, swiped_user["zodiac_sign"])
                
                match = Match(
                    user1_id=user.id,
                    user2_id=swiped_id,
                    compatibility_score=compatibility["score"],
                    compatibility_report=compatibility["report"],
                    status="matched"
                )
                
                await db.matches.insert_one(match.dict())
                return {"success": True, "match": True, "compatibility": compatibility}
    
    return {"success": True, "match": False}

@api_router.get("/matches")
async def get_matches(user: User = Depends(get_current_user)):
    """Get user's matches"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    matches = await db.matches.find({
        "$or": [
            {"user1_id": user.id},
            {"user2_id": user.id}
        ],
        "status": "matched"
    }).to_list(length=None)
    
    # Get match partner info
    for match in matches:
        partner_id = match["user2_id"] if match["user1_id"] == user.id else match["user1_id"]
        partner = await db.users.find_one({"id": partner_id})
        match["partner"] = partner
    
    return matches

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "app": "A Sign Dating API"}

@api_router.get("/")
async def root():
    return {"message": "A Sign - Astrology Dating API"}

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()