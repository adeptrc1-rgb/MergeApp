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
import math
from emergentintegrations.llm.chat import LlmChat, UserMessage
from enum import Enum

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
    "aries": {"element": "fire", "dates": "March 21 - April 19", "traits": ["adventurous", "energetic", "confident"]},
    "taurus": {"element": "earth", "dates": "April 20 - May 20", "traits": ["reliable", "patient", "practical"]},
    "gemini": {"element": "air", "dates": "May 21 - June 20", "traits": ["curious", "adaptable", "witty"]},
    "cancer": {"element": "water", "dates": "June 21 - July 22", "traits": ["nurturing", "intuitive", "emotional"]},
    "leo": {"element": "fire", "dates": "July 23 - August 22", "traits": ["confident", "generous", "creative"]},
    "virgo": {"element": "earth", "dates": "August 23 - September 22", "traits": ["analytical", "helpful", "practical"]},
    "libra": {"element": "air", "dates": "September 23 - October 22", "traits": ["balanced", "diplomatic", "social"]},
    "scorpio": {"element": "water", "dates": "October 23 - November 21", "traits": ["passionate", "mysterious", "intense"]},
    "sagittarius": {"element": "fire", "dates": "November 22 - December 21", "traits": ["adventurous", "optimistic", "philosophical"]},
    "capricorn": {"element": "earth", "dates": "December 22 - January 19", "traits": ["ambitious", "disciplined", "responsible"]},
    "aquarius": {"element": "air", "dates": "January 20 - February 18", "traits": ["innovative", "independent", "humanitarian"]},
    "pisces": {"element": "water", "dates": "February 19 - March 20", "traits": ["intuitive", "compassionate", "artistic"]}
}

# Models
class Location(BaseModel):
    city: str
    country: str
    state: Optional[str] = None
    latitude: float
    longitude: float

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    birth_date: date
    birth_time: Optional[str] = None
    birth_location: Optional[Location] = None
    hometown: Optional[Location] = None
    current_location: Optional[Location] = None
    zodiac_sign: str
    bio: Optional[str] = None
    interests: Optional[List[str]] = []
    # Preferences
    age_range_min: int = 18
    age_range_max: int = 50
    max_distance_km: int = 50  # Default 50km radius
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    response_score: float = 100.0  # Starts at 100, decreases with penalties
    total_matches: int = 0
    responded_matches: int = 0
    avg_response_time: Optional[float] = None  # in hours

class UserCreate(BaseModel):
    birth_date: str
    birth_time: Optional[str] = None
    birth_location: Optional[Dict[str, Any]] = None
    hometown: Optional[Dict[str, Any]] = None
    current_location: Optional[Dict[str, Any]] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = []
    age_range_min: Optional[int] = 18
    age_range_max: Optional[int] = 50
    max_distance_km: Optional[int] = 50

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    compatibility_score: float
    compatibility_report: str
    geographic_score: float
    distance_km: Optional[float] = None
    status: str = "pending"  # pending, matched, declined, expired
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user1_liked: Optional[bool] = None
    user2_liked: Optional[bool] = None
    user1_response_time: Optional[datetime] = None
    user2_response_time: Optional[datetime] = None
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=72))

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

class UserPenalty(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    penalty_type: str  # "no_response", "slow_response"
    penalty_amount: float
    match_id: str
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

def calculate_age(birth_date: date) -> int:
    """Calculate age from birth date"""
    today = date.today()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    return age

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lon / 2) * math.sin(delta_lon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def calculate_geographic_score(distance_km: float) -> float:
    """Calculate geographic compatibility score based on distance"""
    if distance_km <= 10:
        return 100
    elif distance_km <= 50:
        return 90
    elif distance_km <= 100:
        return 75
    elif distance_km <= 500:
        return 50
    elif distance_km <= 1000:
        return 25
    else:
        return 10

async def calculate_compatibility(user1: User, user2: User) -> Dict[str, Any]:
    """Calculate enhanced compatibility between two users with location and birth time"""
    try:
        # Build comprehensive prompt with location and time data
        location_info = ""
        if user1.birth_location and user2.birth_location:
            location_info = f"\nUser 1 was born in {user1.birth_location.city}, {user1.birth_location.country}"
            location_info += f"\nUser 2 was born in {user2.birth_location.city}, {user2.birth_location.country}"
        
        time_info = ""
        if user1.birth_time and user2.birth_time:
            time_info = f"\nUser 1 birth time: {user1.birth_time}"
            time_info += f"\nUser 2 birth time: {user2.birth_time}"
            
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"compatibility_{user1.zodiac_sign}_{user2.zodiac_sign}",
            system_message="You are an expert astrologer with deep knowledge of zodiac compatibility, birth charts, and cosmic influences. Provide detailed romantic compatibility analysis."
        ).with_model("openai", "gpt-4o-mini")
        
        prompt = f"""Analyze the romantic compatibility between these two people:

Person 1: {user1.zodiac_sign.title()} (born {user1.birth_date})
Person 2: {user2.zodiac_sign.title()} (born {user2.birth_date})
{location_info}
{time_info}

Provide:
1. A compatibility score from 0-100
2. A detailed analysis including:
   - Elemental compatibility ({ZODIAC_SIGNS[user1.zodiac_sign]['element']} and {ZODIAC_SIGNS[user2.zodiac_sign]['element']})
   - Personality traits alignment
   - Potential challenges and strengths
   - How birth location/time affects their connection (if provided)
   - Relationship advice for this pairing

Format: SCORE: [number]
ANALYSIS: [detailed analysis]"""
        
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
        # Enhanced fallback compatibility logic
        element_compatibility = {
            ("fire", "fire"): 85, ("fire", "air"): 90, ("fire", "earth"): 60, ("fire", "water"): 40,
            ("earth", "earth"): 80, ("earth", "water"): 85, ("earth", "air"): 45, ("earth", "fire"): 60,
            ("air", "air"): 75, ("air", "water"): 50, ("air", "fire"): 90, ("air", "earth"): 45,
            ("water", "water"): 88, ("water", "fire"): 40, ("water", "earth"): 85, ("water", "air"): 50
        }
        
        elem1 = ZODIAC_SIGNS[user1.zodiac_sign]["element"]
        elem2 = ZODIAC_SIGNS[user2.zodiac_sign]["element"]
        score = element_compatibility.get((elem1, elem2), 65)
        
        return {
            "score": score,
            "report": f"{user1.zodiac_sign.title()} and {user2.zodiac_sign.title()} have {score}% compatibility based on their elemental match."
        }

async def apply_penalty(user_id: str, penalty_type: str, match_id: str):
    """Apply penalty to user for poor response behavior"""
    penalty_amounts = {
        "no_response": 10.0,
        "slow_response": 5.0
    }
    
    penalty_amount = penalty_amounts.get(penalty_type, 5.0)
    
    # Record penalty
    penalty = UserPenalty(
        user_id=user_id,
        penalty_type=penalty_type,
        penalty_amount=penalty_amount,
        match_id=match_id
    )
    await db.penalties.insert_one(penalty.dict())
    
    # Update user score
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"response_score": -penalty_amount}}
    )

async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)) -> Optional[User]:
    """Get current user from session token"""
    token = session_token
    
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

# Authentication endpoints (same as before)
@api_router.post("/auth/session")
async def create_session(response: Response, x_session_id: str = Header(..., alias="X-Session-ID")):
    """Process session ID from Emergent Auth"""
    try:
        auth_response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": x_session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_data = auth_response.json()
        existing_user = await db.users.find_one({"email": user_data["email"]})
        
        user_id = None
        if existing_user:
            user_id = existing_user["id"]
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"last_active": datetime.now(timezone.utc)}}
            )
        else:
            user_id = str(uuid.uuid4())
            new_user = {
                "id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture"),
                "created_at": datetime.now(timezone.utc),
                "last_active": datetime.now(timezone.utc),
                "is_active": True,
                "needs_onboarding": True,
                "response_score": 100.0,
                "total_matches": 0,
                "responded_matches": 0
            }
            await db.users.insert_one(new_user)
        
        session_token = user_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = Session(
            user_id=user_id,
            session_token=session_token,
            expires_at=expires_at
        )
        
        await db.sessions.insert_one(session.dict())
        
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

# Enhanced User endpoints
@api_router.post("/users/complete-profile")
async def complete_profile(profile_data: UserCreate, user: User = Depends(get_current_user)):
    """Complete user profile with enhanced location data"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        birth_date = datetime.strptime(profile_data.birth_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    zodiac_sign = get_zodiac_sign(birth_date)
    
    update_data = {
        "birth_date": birth_date.isoformat(),
        "zodiac_sign": zodiac_sign,
        "needs_onboarding": False
    }
    
    if profile_data.birth_time:
        update_data["birth_time"] = profile_data.birth_time
    
    # Process locations
    if profile_data.birth_location:
        update_data["birth_location"] = profile_data.birth_location
    elif profile_data.hometown:
        # Use hometown as birth location if not specified
        update_data["birth_location"] = profile_data.hometown
    
    if profile_data.hometown:
        update_data["hometown"] = profile_data.hometown
    
    if profile_data.current_location:
        update_data["current_location"] = profile_data.current_location
    
    if profile_data.bio:
        update_data["bio"] = profile_data.bio
    
    if profile_data.interests:
        update_data["interests"] = profile_data.interests
    
    if profile_data.age_range_min is not None:
        update_data["age_range_min"] = profile_data.age_range_min
    
    if profile_data.age_range_max is not None:
        update_data["age_range_max"] = profile_data.age_range_max
    
    if profile_data.max_distance_km is not None:
        update_data["max_distance_km"] = profile_data.max_distance_km
    
    await db.users.update_one(
        {"id": user.id},
        {"$set": update_data}
    )
    
    return {"success": True, "zodiac_sign": zodiac_sign}

@api_router.post("/users/update-preferences")
async def update_preferences(preferences: dict, user: User = Depends(get_current_user)):
    """Update user's dating preferences"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    update_data = {}
    
    if "age_range_min" in preferences:
        update_data["age_range_min"] = preferences["age_range_min"]
    
    if "age_range_max" in preferences:
        update_data["age_range_max"] = preferences["age_range_max"]
    
    if "max_distance_km" in preferences:
        update_data["max_distance_km"] = preferences["max_distance_km"]
    
    if update_data:
        await db.users.update_one(
            {"id": user.id},
            {"$set": update_data}
        )
    
    return {"success": True, "message": "Preferences updated successfully"}

@api_router.get("/users/potential-matches")
async def get_potential_matches(user: User = Depends(get_current_user)):
    """Get potential matches with age and distance filtering"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    swiped_users = await db.swipes.find({"swiper_id": user.id}).to_list(length=None)
    swiped_ids = [s["swiped_id"] for s in swiped_users] + [user.id]
    
    # Get users with good response scores
    potential_matches = await db.users.find({
        "id": {"$nin": swiped_ids},
        "is_active": True,
        "needs_onboarding": {"$ne": True},
        "response_score": {"$gte": 50}  # Only show users with decent response scores
    }).limit(50).to_list(length=None)  # Get more initially for filtering
    
    filtered_matches = []
    user_age = calculate_age(user.birth_date) if user.birth_date else 25
    
    for match in potential_matches:
        # Age filtering
        if match.get("birth_date"):
            match_age = calculate_age(datetime.fromisoformat(match["birth_date"]).date())
            if match_age < user.age_range_min or match_age > user.age_range_max:
                continue
        
        # Distance filtering
        if user.current_location and match.get("current_location"):
            distance = calculate_distance(
                user.current_location.latitude,
                user.current_location.longitude,
                match["current_location"]["latitude"],
                match["current_location"]["longitude"]
            )
            
            # Filter by user's distance preference
            if distance > user.max_distance_km:
                continue
                
            match["distance_km"] = distance
            match["geographic_score"] = calculate_geographic_score(distance)
        
        # Also check if match wants to see user (mutual age filtering)
        match_age_min = match.get("age_range_min", 18)
        match_age_max = match.get("age_range_max", 50)
        if user_age < match_age_min or user_age > match_age_max:
            continue
        
        # Also check match's distance preference
        if match.get("current_location") and user.current_location:
            match_max_distance = match.get("max_distance_km", 50)
            if match.get("distance_km", 0) > match_max_distance:
                continue
        
        filtered_matches.append(match)
    
    # Sort by response score and geographic proximity
    filtered_matches.sort(
        key=lambda x: (x.get("geographic_score", 0) + x["response_score"]), 
        reverse=True
    )
    
    return filtered_matches[:10]

@api_router.post("/users/swipe")
async def swipe_user(swipe_data: dict, user: User = Depends(get_current_user)):
    """Enhanced swipe with geographic and compatibility calculation"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    swiped_id = swipe_data.get("swiped_id")
    liked = swipe_data.get("liked", False)
    
    if not swiped_id:
        raise HTTPException(status_code=400, detail="Missing swiped_id")
    
    existing_swipe = await db.swipes.find_one({
        "swiper_id": user.id,
        "swiped_id": swiped_id
    })
    
    if existing_swipe:
        raise HTTPException(status_code=400, detail="Already swiped on this user")
    
    swipe = Swipe(
        swiper_id=user.id,
        swiped_id=swiped_id,
        liked=liked
    )
    
    await db.swipes.insert_one(swipe.dict())
    
    if liked:
        mutual_swipe = await db.swipes.find_one({
            "swiper_id": swiped_id,
            "swiped_id": user.id,
            "liked": True
        })
        
        if mutual_swipe:
            swiped_user_data = await db.users.find_one({"id": swiped_id})
            if swiped_user_data:
                swiped_user = User(**swiped_user_data)
                compatibility = await calculate_compatibility(user, swiped_user)
                
                # Calculate geographic score
                geographic_score = 50  # default
                distance_km = None
                if user.current_location and swiped_user.current_location:
                    distance_km = calculate_distance(
                        user.current_location.latitude,
                        user.current_location.longitude,
                        swiped_user.current_location.latitude,
                        swiped_user.current_location.longitude
                    )
                    geographic_score = calculate_geographic_score(distance_km)
                
                match = Match(
                    user1_id=user.id,
                    user2_id=swiped_id,
                    compatibility_score=compatibility["score"],
                    compatibility_report=compatibility["report"],
                    geographic_score=geographic_score,
                    distance_km=distance_km,
                    status="matched"
                )
                
                await db.matches.insert_one(match.dict())
                
                # Update match counts
                await db.users.update_one({"id": user.id}, {"$inc": {"total_matches": 1}})
                await db.users.update_one({"id": swiped_id}, {"$inc": {"total_matches": 1}})
                
                return {
                    "success": True, 
                    "match": True, 
                    "compatibility": compatibility,
                    "geographic_score": geographic_score,
                    "distance_km": distance_km
                }
    
    return {"success": True, "match": False}

@api_router.get("/matches")
async def get_matches(user: User = Depends(get_current_user)):
    """Get user's matches with penalty tracking"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    matches = await db.matches.find({
        "$or": [{"user1_id": user.id}, {"user2_id": user.id}],
        "status": "matched"
    }).to_list(length=None)
    
    for match in matches:
        partner_id = match["user2_id"] if match["user1_id"] == user.id else match["user1_id"]
        partner = await db.users.find_one({"id": partner_id})
        match["partner"] = partner
        
        # Check for expired matches and apply penalties
        if datetime.now(timezone.utc) > match["expires_at"] and match["status"] == "matched":
            # Apply penalty to users who haven't responded
            if match["user1_id"] == user.id and not match.get("user1_response_time"):
                await apply_penalty(user.id, "no_response", match["id"])
            elif match["user2_id"] == user.id and not match.get("user2_response_time"):
                await apply_penalty(user.id, "no_response", match["id"])
                
            # Update match status
            await db.matches.update_one(
                {"id": match["id"]},
                {"$set": {"status": "expired"}}
            )
    
    return matches

# Background task to check expired matches
@api_router.post("/admin/check-expired-matches")
async def check_expired_matches():
    """Background task to check and penalize expired matches"""
    expired_matches = await db.matches.find({
        "status": "matched",
        "expires_at": {"$lt": datetime.now(timezone.utc)}
    }).to_list(length=None)
    
    for match in expired_matches:
        # Apply penalties
        if not match.get("user1_response_time"):
            await apply_penalty(match["user1_id"], "no_response", match["id"])
        if not match.get("user2_response_time"):
            await apply_penalty(match["user2_id"], "no_response", match["id"])
        
        # Update match status
        await db.matches.update_one(
            {"id": match["id"]},
            {"$set": {"status": "expired"}}
        )
    
    return {"processed": len(expired_matches)}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "app": "A Sign Dating API"}

@api_router.get("/")
async def root():
    return {"message": "A Sign - Astrology Dating API"}

app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()