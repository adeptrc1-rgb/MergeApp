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
import secrets
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

# Enums and constants
class GenderIdentity(str, Enum):
    MAN = "man"
    WOMAN = "woman"
    NON_BINARY = "non_binary"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"
    SELF_DESCRIBE = "self_describe"

class OpenToDating(str, Enum):
    MEN = "men"
    WOMEN = "women"
    NON_BINARY = "non_binary"
    ALL_GENDERS = "all_genders"

class RelationshipGoal(str, Enum):
    CASUAL = "casual"
    SERIOUS = "serious"
    FRIENDS = "friends"
    OPEN = "open"

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

class LifestyleSliders(BaseModel):
    fitness_health: int = Field(ge=1, le=5, default=3)  # How important is staying active
    career_ambition: int = Field(ge=1, le=5, default=3)  # How much do you prioritize career growth
    social_energy: int = Field(ge=1, le=5, default=3)  # Quiet nights in vs nights out
    travel_adventure: int = Field(ge=1, le=5, default=3)  # How important is travel
    nightlife_lifestyle: int = Field(ge=1, le=5, default=3)  # How often enjoy partying/drinking
    family_future: int = Field(ge=1, le=5, default=3)  # How important is family life/kids
    dating_approach: int = Field(ge=1, le=5, default=3)  # Take things slow vs dive in fast
    passions_hobbies: int = Field(ge=1, le=5, default=3)  # How central are hobbies

class ProfilePhotos(BaseModel):
    face_photo: Optional[str] = None  # Full face photo
    body_photo: Optional[str] = None  # Full length body photo
    lifestyle_photo: Optional[str] = None  # Lifestyle photo

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    picture: Optional[str] = None
    birth_date: date
    birth_time: Optional[str] = None
    birth_location: Optional[Location] = None
    hometown: Optional[Location] = None
    current_location: Optional[Location] = None
    zodiac_sign: str
    
    # Enhanced Profile Fields
    gender_identity: Optional[GenderIdentity] = None
    gender_self_describe: Optional[str] = None  # If self_describe is selected
    open_to_dating: Optional[List[OpenToDating]] = []
    orientation_visible: bool = True
    
    # Lifestyle & Values
    lifestyle_sliders: Optional[LifestyleSliders] = None
    
    # Additional Profile Fields
    industry: Optional[str] = None
    interests: Optional[List[str]] = []
    relationship_goals: Optional[RelationshipGoal] = None
    profile_photos: Optional[ProfilePhotos] = None
    
    bio: Optional[str] = None
    
    # Preferences
    age_range_min: int = 18
    age_range_max: int = 50
    max_distance_km: int = 50
    
    # Astrology & Premium Features
    angel_number: Optional[str] = None  # e.g., "111", "222", "333"
    profile_boosts: int = 4  # Free boosts on signup (24hr expiry)
    super_likes: int = 4  # Free super likes on signup (24hr expiry)
    direct_messages: int = 4  # Free direct messages on signup (24hr expiry)
    
    # Timed Features (24-hour expiry)
    boosts_expiry: Optional[datetime] = None
    super_likes_expiry: Optional[datetime] = None
    direct_messages_expiry: Optional[datetime] = None
    
    # Daily Rewards
    last_spin_date: Optional[date] = None  # Track last cosmic wheel spin
    daily_spin_available: bool = True
    
    # System fields
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    response_score: float = 100.0  # Hidden responsiveness score
    total_matches: int = 0
    responded_matches: int = 0
    avg_response_time: Optional[float] = None
    profile_completed: bool = False

class UserCreate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
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
    
    # Enhanced fields
    gender_identity: Optional[GenderIdentity] = None
    gender_self_describe: Optional[str] = None
    open_to_dating: Optional[List[OpenToDating]] = []
    orientation_visible: Optional[bool] = True
    lifestyle_sliders: Optional[Dict[str, int]] = None
    industry: Optional[str] = None
    relationship_goals: Optional[RelationshipGoal] = None
    
    # Photos (stored as base64 strings)
    profile_photos: Optional[Dict[str, str]] = None

class CompatibilityScore(BaseModel):
    user1_id: str
    user2_id: str
    compatibility_percentage: float
    slider_breakdown: Dict[str, Dict[str, Any]]  # Detailed breakdown
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    compatibility_score: float
    compatibility_breakdown: Optional[Dict[str, Any]] = None
    compatibility_report: str
    geographic_score: float
    distance_km: Optional[float] = None
    status: str = "pending"  # pending, matched, declined, expired
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user1_liked: Optional[bool] = None
    user2_liked: Optional[bool] = None
    user1_response_time: Optional[datetime] = None
    user2_response_time: Optional[datetime] = None
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=24))

class ResponseBehavior(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action_type: str  # "responded_quickly", "expired_match", "ghosted", "continued_conversation"
    match_id: str
    response_time_hours: Optional[float] = None
    compatibility_level: str  # "high", "medium", "low"
    penalty_applied: float = 0.0
    reward_applied: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

def calculate_lifestyle_compatibility(user1_sliders: LifestyleSliders, user2_sliders: LifestyleSliders) -> Dict[str, Any]:
    """Calculate compatibility based on lifestyle sliders"""
    
    slider_fields = [
        'fitness_health', 'career_ambition', 'social_energy', 'travel_adventure',
        'nightlife_lifestyle', 'family_future', 'dating_approach', 'passions_hobbies'
    ]
    
    breakdown = {}
    total_score = 0
    total_weight = 0
    
    for field in slider_fields:
        user1_val = getattr(user1_sliders, field)
        user2_val = getattr(user2_sliders, field)
        
        difference = abs(user1_val - user2_val)
        
        # Scoring logic
        if difference <= 1:  # Alignment within ±1 = +points
            field_score = 100 - (difference * 10)
        elif difference >= 3:  # Mismatch difference ≥3 = –points
            # Stronger penalty for extreme differences
            penalty = 60 + (difference - 3) * 30
            # Don't penalize high-priority users as much, but still significant penalty
            if max(user1_val, user2_val) == 5:
                penalty *= 0.8
            field_score = max(0, 100 - penalty)
        else:  # Difference of 2
            field_score = 60 - (difference * 10)
        
        # Weight important categories more
        weight = 1.5 if field in ['family_future', 'dating_approach', 'career_ambition'] else 1.0
        
        breakdown[field] = {
            'user1_value': user1_val,
            'user2_value': user2_val,
            'difference': difference,
            'field_score': field_score,
            'weight': weight
        }
        
        total_score += field_score * weight
        total_weight += weight
    
    overall_score = total_score / total_weight if total_weight > 0 else 0
    
    return {
        'overall_percentage': min(100, max(0, overall_score)),
        'breakdown': breakdown
    }

def check_gender_compatibility(user1: User, user2: User) -> bool:
    """Check if two users are compatible based on gender preferences"""
    
    # Helper function to convert gender identity to dating preference
    def gender_to_dating_pref(gender):
        if gender == GenderIdentity.MAN:
            return OpenToDating.MEN
        elif gender == GenderIdentity.WOMAN:
            return OpenToDating.WOMEN
        elif gender == GenderIdentity.NON_BINARY:
            return OpenToDating.NON_BINARY
        return None
    
    user1_gender_pref = gender_to_dating_pref(user1.gender_identity)
    user2_gender_pref = gender_to_dating_pref(user2.gender_identity)
    
    # Check if user1 is open to user2's gender
    user1_compatible = (
        OpenToDating.ALL_GENDERS in user1.open_to_dating or
        user2_gender_pref in user1.open_to_dating
    ) if user1.open_to_dating else False
    
    # Check if user2 is open to user1's gender
    user2_compatible = (
        OpenToDating.ALL_GENDERS in user2.open_to_dating or
        user1_gender_pref in user2.open_to_dating
    ) if user2.open_to_dating else False
    
    return user1_compatible and user2_compatible

async def calculate_compatibility(user1: User, user2: User) -> Dict[str, Any]:
    """Calculate enhanced compatibility between two users"""
    
    # Check gender compatibility first
    if not check_gender_compatibility(user1, user2):
        return {
            "score": 0,
            "report": "Gender preferences not compatible"
        }
    
    try:
        compatibility_score = 0
        factors = []
        
        # Lifestyle compatibility (60% of score)
        if user1.lifestyle_sliders and user2.lifestyle_sliders:
            lifestyle_compat = calculate_lifestyle_compatibility(user1.lifestyle_sliders, user2.lifestyle_sliders)
            compatibility_score += lifestyle_compat['overall_percentage'] * 0.6
            factors.append(f"Lifestyle compatibility: {lifestyle_compat['overall_percentage']:.0f}%")
        
        # Astrology compatibility (25% of score)
        astro_score = await get_astrology_compatibility(user1.zodiac_sign, user2.zodiac_sign)
        compatibility_score += astro_score * 0.25
        factors.append(f"Astrology compatibility: {astro_score:.0f}%")
        
        # Shared interests (15% of score)
        if user1.interests and user2.interests:
            shared_interests = set(user1.interests).intersection(set(user2.interests))
            interest_score = min(100, len(shared_interests) * 20)
            compatibility_score += interest_score * 0.15
            factors.append(f"Shared interests: {len(shared_interests)} ({interest_score:.0f}%)")
        
        report = f"Compatibility based on: {', '.join(factors)}"
        
        return {
            "score": min(100, max(0, compatibility_score)),
            "report": report
        }
        
    except Exception as e:
        print(f"Error calculating compatibility: {e}")
        return {
            "score": 50,
            "report": "Basic compatibility assessment"
        }

async def get_astrology_compatibility(sign1: str, sign2: str) -> float:
    """Get astrology compatibility score"""
    try:
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"astro_{sign1}_{sign2}",
            system_message="You are an expert astrologer. Provide only a compatibility score from 0-100."
        ).with_model("openai", "gpt-4o-mini")
        
        response = await chat.send_message(UserMessage(text=f"Compatibility score for {sign1} and {sign2} (0-100 only):"))
        
        # Extract number from response
        import re
        numbers = re.findall(r'\d+', response)
        if numbers:
            return float(numbers[0])
    except Exception:
        pass
    
    # Fallback to elemental compatibility
    element_scores = {
        ("fire", "fire"): 85, ("fire", "air"): 90, ("fire", "earth"): 60, ("fire", "water"): 40,
        ("earth", "earth"): 80, ("earth", "water"): 85, ("earth", "air"): 45,
        ("air", "air"): 75, ("air", "water"): 50, ("water", "water"): 88
    }
    
    elem1 = ZODIAC_SIGNS.get(sign1, {}).get("element", "fire")
    elem2 = ZODIAC_SIGNS.get(sign2, {}).get("element", "fire")
    
    return element_scores.get((elem1, elem2), element_scores.get((elem2, elem1), 65))

async def update_responsiveness_score(user_id: str, action_type: str, match_id: str, 
                                    compatibility_level: str, response_time_hours: Optional[float] = None):
    """Update user's responsiveness score based on behavior"""
    
    penalty = 0
    reward = 0
    
    if action_type == "responded_quickly" and response_time_hours and response_time_hours < 2:
        reward = 2
    elif action_type == "continued_conversation":
        reward = 1
    elif action_type == "expired_match":
        if compatibility_level == "high":  # 80%+
            penalty = 15
        elif compatibility_level == "medium":  # 50-79%
            penalty = 8
        else:  # <50%
            penalty = 3
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
    
    # Update user's responsiveness score
    user = await db.users.find_one({"id": user_id})
    if user:
        current_score = user.get("responsiveness_score", 80)
        new_score = max(0, min(100, current_score + reward - penalty))
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"responsiveness_score": new_score}}
        )


# ============================================================================
# ANGEL NUMBER CALCULATION
# ============================================================================

def calculate_angel_number(birth_date: date) -> str:
    """
    Calculate angel number from birth date using numerology
    Reduces birth date to a single digit or master number, then creates angel number
    """
    # Convert date to numbers: day + month + year
    day = birth_date.day
    month = birth_date.month
    year = birth_date.year
    
    # Sum all digits
    total = day + month + year
    
    # Reduce to single digit (but keep master numbers 11, 22, 33)
    while total > 33:
        total = sum(int(digit) for digit in str(total))
    
    # Keep reducing unless it's a master number
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(digit) for digit in str(total))
    
    # Create angel number (repeating digit)
    if total == 11:
        return "111"
    elif total == 22:
        return "222"
    elif total == 33:
        return "333"
    else:
        # For single digits, create triple digit angel number
        return str(total) * 3

async def get_current_user(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)) -> Optional[User]:
    """Get current user from session token"""
    token = session_token
    
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    if not token:
        return None
    
    session = await db.sessions.find_one({"session_token": token})
    if not session:
        return None
    
    # Handle timezone-aware datetime comparison
    expires_at = session["expires_at"]
    if isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if datetime.now(timezone.utc) > expires_at:
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
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TestLoginRequest(BaseModel):
    email: str = "testuser@asign.com"

@api_router.post("/auth/test-login")
async def test_login(request: TestLoginRequest, response: Response):
    """Test login endpoint - creates session for test user"""
    try:
        # Find the test user
        user = await db.users.find_one({"email": request.email})
        if not user:
            raise HTTPException(status_code=404, detail="Test user not found")
        
        # Create session token
        session_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        # Delete old sessions for this user
        await db.sessions.delete_many({"user_id": user["id"]})
        
        # Create new session
        session = {
            "session_token": session_token,
            "user_id": user["id"],
            "created_at": datetime.now(timezone.utc),
            "expires_at": expires_at
        }
        await db.sessions.insert_one(session)
        
        # Set session cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            max_age=7 * 24 * 60 * 60,
            httponly=False,  # Allow JavaScript access for debugging
            secure=True,
            samesite="none",
            path="/"
        )
        
        return {
            "success": True,
            "user_id": user["id"],
            "needs_onboarding": user.get("needs_onboarding", False)
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
    """Complete user profile with enhanced fields"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        birth_date = datetime.strptime(profile_data.birth_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    zodiac_sign = get_zodiac_sign(birth_date)
    angel_number = calculate_angel_number(birth_date)
    
    # Set 24-hour expiry for initial free rewards
    expiry_time = datetime.now(timezone.utc) + timedelta(hours=24)
    
    update_data = {
        "birth_date": birth_date.isoformat(),
        "zodiac_sign": zodiac_sign,
        "angel_number": angel_number,
        "needs_onboarding": False,
        "profile_completed": True,
        # Initialize free features on signup with 24hr expiry
        "profile_boosts": 4,
        "super_likes": 4,
        "direct_messages": 4,
        "boosts_expiry": expiry_time,
        "super_likes_expiry": expiry_time,
        "direct_messages_expiry": expiry_time,
        "daily_spin_available": True
    }
    
    # Name fields
    if profile_data.first_name:
        update_data["first_name"] = profile_data.first_name
    if profile_data.last_name:
        update_data["last_name"] = profile_data.last_name
    
    # Basic fields
    if profile_data.birth_time:
        update_data["birth_time"] = profile_data.birth_time
    if profile_data.bio:
        update_data["bio"] = profile_data.bio
    if profile_data.interests:
        update_data["interests"] = profile_data.interests
    
    # Profile photos
    if profile_data.profile_photos:
        # Store as dict in MongoDB
        photos = ProfilePhotos(**profile_data.profile_photos)
        update_data["profile_photos"] = photos.dict()
    
    # Enhanced profile fields
    if profile_data.gender_identity:
        update_data["gender_identity"] = profile_data.gender_identity
    if profile_data.gender_self_describe:
        update_data["gender_self_describe"] = profile_data.gender_self_describe
    if profile_data.open_to_dating:
        update_data["open_to_dating"] = profile_data.open_to_dating
    if profile_data.orientation_visible is not None:
        update_data["orientation_visible"] = profile_data.orientation_visible
    if profile_data.industry:
        update_data["industry"] = profile_data.industry
    if profile_data.relationship_goals:
        update_data["relationship_goals"] = profile_data.relationship_goals
    
    # Lifestyle sliders
    if profile_data.lifestyle_sliders:
        lifestyle_data = LifestyleSliders(**profile_data.lifestyle_sliders)
        update_data["lifestyle_sliders"] = lifestyle_data.dict()
    
    # Process locations
    if profile_data.birth_location:
        update_data["birth_location"] = profile_data.birth_location
    elif profile_data.hometown:
        update_data["birth_location"] = profile_data.hometown
    
    if profile_data.hometown:
        update_data["hometown"] = profile_data.hometown
    if profile_data.current_location:
        update_data["current_location"] = profile_data.current_location
    
    # Preferences
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
    """Get potential matches with enhanced filtering and ranking"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    swiped_users = await db.swipes.find({"swiper_id": user.id}).to_list(length=None)
    swiped_ids = [s["swiped_id"] for s in swiped_users] + [user.id]
    
    # Get users with good response scores and completed profiles
    potential_matches = await db.users.find({
        "id": {"$nin": swiped_ids},
        "is_active": True,
        "profile_completed": True,
        "response_score": {"$gte": 50}
    }).limit(100).to_list(length=None)
    
    filtered_matches = []
    user_age = calculate_age(user.birth_date) if user.birth_date else 25
    
    for match_data in potential_matches:
        try:
            match_user = User(**match_data)
            
            # Gender compatibility check
            if not check_gender_compatibility(user, match_user):
                continue
            
            # Age filtering
            if match_user.birth_date:
                match_age = calculate_age(match_user.birth_date)
                if match_age < user.age_range_min or match_age > user.age_range_max:
                    continue
                if user_age < match_user.age_range_min or user_age > match_user.age_range_max:
                    continue
            
            # Distance filtering
            distance_km = None
            geographic_score = 50
            if user.current_location and match_user.current_location:
                distance_km = calculate_distance(
                    user.current_location.latitude,
                    user.current_location.longitude,
                    match_user.current_location.latitude,
                    match_user.current_location.longitude
                )
                
                if distance_km > user.max_distance_km or distance_km > match_user.max_distance_km:
                    continue
                    
                geographic_score = calculate_geographic_score(distance_km)
            
            # Calculate compatibility score
            compatibility = await calculate_compatibility(user, match_user)
            
            # Create match profile for display
            match_profile = {
                "id": match_user.id,
                "name": match_user.name,
                "age": calculate_age(match_user.birth_date) if match_user.birth_date else None,
                "zodiac_sign": match_user.zodiac_sign,
                "bio": match_user.bio,
                "interests": match_user.interests,
                "industry": match_user.industry,
                "relationship_goals": match_user.relationship_goals,
                "distance_km": distance_km,
                "compatibility_score": compatibility["score"],
                "geographic_score": geographic_score,
                "response_score": match_user.response_score,
                "profile_photos": match_user.profile_photos,
                # Calculate overall ranking score
                "ranking_score": (
                    compatibility["score"] * 0.5 +  # 50% compatibility
                    geographic_score * 0.3 +        # 30% location
                    match_user.response_score * 0.2  # 20% responsiveness
                )
            }
            
            filtered_matches.append(match_profile)
            
        except Exception as e:
            print(f"Error processing match {match_data.get('id')}: {e}")
            continue
    
    # Sort by ranking score
    filtered_matches.sort(key=lambda x: x["ranking_score"], reverse=True)
    
    return filtered_matches[:20]

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

@api_router.delete("/users/undo-swipe/{swiped_id}")
async def undo_swipe(swiped_id: str, user: User = Depends(get_current_user)):
    """Undo the last swipe on a user"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Delete the swipe record
    result = await db.swipes.delete_one({
        "swiper_id": user.id,
        "swiped_id": swiped_id
    })
    
    # Also delete match if it exists
    await db.matches.delete_one({
        "$or": [
            {"user1_id": user.id, "user2_id": swiped_id},
            {"user1_id": swiped_id, "user2_id": user.id}
        ]
    })
    
    return {"success": True, "deleted_count": result.deleted_count}

@api_router.post("/users/super-like/{swiped_id}")
async def super_like_user(swiped_id: str, user: User = Depends(get_current_user)):
    """Super like a user (uses one super like from user's balance)"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user has super likes available
    user_data = await db.users.find_one({"id": user.id})
    if not user_data or user_data.get("super_likes", 0) <= 0:
        raise HTTPException(status_code=400, detail="No super likes remaining")
    
    # Check if already swiped
    existing_swipe = await db.swipes.find_one({
        "swiper_id": user.id,
        "swiped_id": swiped_id
    })
    
    if existing_swipe:
        raise HTTPException(status_code=400, detail="Already swiped on this user")
    
    # Create swipe with super_like flag
    swipe = Swipe(
        swiper_id=user.id,
        swiped_id=swiped_id,
        liked=True
    )
    swipe_dict = swipe.dict()
    swipe_dict["super_like"] = True
    
    await db.swipes.insert_one(swipe_dict)
    
    # Decrement super likes
    await db.users.update_one(
        {"id": user.id},
        {"$inc": {"super_likes": -1}}
    )
    
    # Check for mutual match
    mutual_swipe = await db.swipes.find_one({
        "swiper_id": swiped_id,
        "swiped_id": user.id,
        "liked": True
    })
    
    is_match = mutual_swipe is not None
    
    if is_match:
        # Create match if doesn't exist
        existing_match = await db.matches.find_one({
            "$or": [
                {"user1_id": user.id, "user2_id": swiped_id},
                {"user1_id": swiped_id, "user2_id": user.id}
            ]
        })
        
        if not existing_match:
            match_id = str(uuid.uuid4())
            match = {
                "id": match_id,
                "user1_id": user.id,
                "user2_id": swiped_id,
                "matched_at": datetime.now(timezone.utc),
                "status": "matched"
            }
            await db.matches.insert_one(match)
    
    return {
        "success": True,
        "is_match": is_match,
        "super_likes_remaining": user_data.get("super_likes", 0) - 1
    }

@api_router.get("/matches")
async def get_matches(user: User = Depends(get_current_user)):
    """Get user's matches with responsiveness tracking"""
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
        
        # Check for expired matches and apply responsiveness penalties
        if datetime.now(timezone.utc) > match["expires_at"] and match["status"] == "matched":
            compatibility_level = "high" if match["compatibility_score"] >= 80 else "medium" if match["compatibility_score"] >= 50 else "low"
            
            # Apply penalty to users who haven't responded
            if match["user1_id"] == user.id and not match.get("user1_response_time"):
                await update_responsiveness_score(user.id, "expired_match", match["id"], compatibility_level)
            elif match["user2_id"] == user.id and not match.get("user2_response_time"):
                await update_responsiveness_score(user.id, "expired_match", match["id"], compatibility_level)
                
            # Update match status
            await db.matches.update_one(
                {"id": match["id"]},
                {"$set": {"status": "expired"}}
            )
    
    return matches

# Background task to check expired matches
@api_router.post("/admin/check-expired-matches")
async def check_expired_matches():
    """Background task to check and update responsiveness for expired matches"""
    expired_matches = await db.matches.find({
        "status": "matched",
        "expires_at": {"$lt": datetime.now(timezone.utc)}
    }).to_list(length=None)
    
    for match in expired_matches:
        compatibility_level = "high" if match["compatibility_score"] >= 80 else "medium" if match["compatibility_score"] >= 50 else "low"
        
        # Apply responsiveness penalties
        if not match.get("user1_response_time"):
            await update_responsiveness_score(match["user1_id"], "expired_match", match["id"], compatibility_level)
        if not match.get("user2_response_time"):
            await update_responsiveness_score(match["user2_id"], "expired_match", match["id"], compatibility_level)
        
        # Update match status
        await db.matches.update_one(
            {"id": match["id"]},
            {"$set": {"status": "expired"}}
        )
    
    return {"processed": len(expired_matches)}

# New endpoints for enhanced profile management
@api_router.post("/users/update-lifestyle")
async def update_lifestyle_sliders(sliders: Dict[str, int], user: User = Depends(get_current_user)):
    """Update user's lifestyle sliders"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        lifestyle_data = LifestyleSliders(**sliders)
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"lifestyle_sliders": lifestyle_data.dict()}}
        )
        return {"success": True, "message": "Lifestyle preferences updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid slider data: {str(e)}")

@api_router.post("/users/update-photos")
async def update_profile_photos(photos: Dict[str, str], user: User = Depends(get_current_user)):
    """Update user's profile photos"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        photo_data = ProfilePhotos(**photos)
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"profile_photos": photo_data.dict()}}
        )
        return {"success": True, "message": "Photos updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid photo data: {str(e)}")

@api_router.get("/users/compatibility-preview/{user_id}")
async def get_compatibility_preview(user_id: str, user: User = Depends(get_current_user)):
    """Get detailed compatibility breakdown with another user"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    other_user_data = await db.users.find_one({"id": user_id})
    if not other_user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    other_user = User(**other_user_data)
    compatibility = await calculate_compatibility(user, other_user)
    
    # Get detailed breakdown if lifestyle sliders exist
    breakdown = None
    if user.lifestyle_sliders and other_user.lifestyle_sliders:
        breakdown = calculate_lifestyle_compatibility(user.lifestyle_sliders, other_user.lifestyle_sliders)
    
    return {
        "compatibility_score": compatibility["score"],
        "compatibility_report": compatibility["report"],
        "lifestyle_breakdown": breakdown
    }

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "app": "A Sign Dating API"}

@api_router.get("/")
async def root():
    return {"message": "A Sign - Astrology Dating API"}


# ============================================================================
# ASTROLOGY FEATURES
# ============================================================================

# Daily horoscopes for each sign
DAILY_HOROSCOPES = {
    "Aries": ["Your energy is contagious today! Share it with someone special.", "A bold move could lead to exciting connections.", "Adventure awaits - take the first step!"],
    "Taurus": ["Comfort and connection go hand in hand today.", "Someone appreciates your steady presence.", "Indulge in something that makes you feel good."],
    "Gemini": ["Your words have power today - use them wisely.", "A deep conversation could spark something new.", "Curiosity leads to interesting discoveries."],
    "Cancer": ["Your intuition is especially strong today.", "Emotional connections deepen naturally.", "Trust your feelings about new connections."],
    "Leo": ["Your confidence is magnetic today!", "Someone notices your authentic self.", "Shine bright and let your personality lead."],
    "Virgo": ["Attention to detail pays off in relationships.", "Small gestures make big impressions today.", "Organization brings unexpected opportunities."],
    "Libra": ["Balance brings beautiful connections today.", "Your charm opens new doors.", "Harmony with others feels effortless."],
    "Scorpio": ["Intensity draws the right people to you.", "Deep connections are favored today.", "Trust your passionate nature."],
    "Sagittarius": ["Adventure and romance align perfectly!", "Your optimism is contagious.", "Someone shares your wanderlust."],
    "Capricorn": ["Your ambition is attractive to others.", "Stability creates space for romance.", "Long-term thinking brings rewards."],
    "Aquarius": ["Your unique perspective attracts kindred spirits.", "Innovation meets connection today.", "Be authentically you."],
    "Pisces": ["Your empathy creates magical moments.", "Dreams and reality align beautifully.", "Creativity sparks romantic possibilities."]
}

@api_router.get("/astrology/daily-horoscope/{zodiac_sign}")
async def get_daily_horoscope(zodiac_sign: str):
    """Get daily horoscope for a zodiac sign"""
    import random
    horoscopes = DAILY_HOROSCOPES.get(zodiac_sign, ["The stars align in your favor today!"])
    message = random.choice(horoscopes)
    
    return {
        "zodiac_sign": zodiac_sign,
        "message": message,
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    }

@api_router.get("/users/check-match/{swiped_id}")
async def check_mutual_match(swiped_id: str, user: User = Depends(get_current_user)):
    """Check if there's a mutual match"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if other user has also liked this user
    other_like = await db.swipes.find_one({
        "swiper_id": swiped_id,
        "swiped_id": user.id,
        "action": "like"
    })
    
    user_like = await db.swipes.find_one({
        "swiper_id": user.id,
        "swiped_id": swiped_id,
        "action": "like"
    })
    
    is_match = other_like is not None and user_like is not None
    
    if is_match:
        # Check if match already exists
        existing_match = await db.matches.find_one({
            "$or": [
                {"user1_id": user.id, "user2_id": swiped_id},
                {"user1_id": swiped_id, "user2_id": user.id}
            ]
        })
        
        if not existing_match:
            # Create new match
            match_id = str(uuid.uuid4())
            match = {
                "id": match_id,
                "user1_id": user.id,
                "user2_id": swiped_id,
                "matched_at": datetime.now(timezone.utc),
                "status": "matched",
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=24),
                "compatibility_score": 75  # Calculate this properly
            }
            await db.matches.insert_one(match)
    
    return {
        "is_match": is_match,
        "swiped_id": swiped_id
    }

@api_router.get("/users/liked-me")
async def get_users_who_liked_me(user: User = Depends(get_current_user)):
    """Get users who have liked the current user"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find all users who liked me
    likes = await db.swipes.find({
        "swiped_id": user.id,
        "liked": True
    }).to_list(length=100)
    
    # Get user details for each like
    liked_users = []
    for like in likes:
        # Check if I haven't swiped on them yet (they're still potential matches)
        my_swipe = await db.swipes.find_one({
            "swiper_id": user.id,
            "swiped_id": like["swiper_id"]
        })
        
        # Only show if I haven't swiped on them yet
        if not my_swipe:
            user_data = await db.users.find_one({"id": like["swiper_id"]})
            if user_data:
                liked_users.append(User(**user_data))
    
    return liked_users

@api_router.get("/astrology/compatibility-insight")
async def get_compatibility_insight(sign1: str, sign2: str):
    """Get compatibility insight between two zodiac signs"""
    
    # Element compatibility
    element_map = {
        'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
        'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
        'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
        'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    }
    
    element1 = element_map.get(sign1, "Unknown")
    element2 = element_map.get(sign2, "Unknown")
    
    # Compatibility insights
    insights = {
        ("Fire", "Fire"): "Dynamic and passionate! You both share high energy and enthusiasm.",
        ("Fire", "Air"): "Exciting combination! Air fans Fire's flames, creating spark and adventure.",
        ("Fire", "Earth"): "Challenging but rewarding. Fire's passion meets Earth's stability.",
        ("Fire", "Water"): "Steamy but complex. Fire and Water create intense chemistry.",
        ("Earth", "Earth"): "Grounded and stable! You both value security and loyalty.",
        ("Earth", "Air"): "Different approaches, but complementary. Earth grounds Air's ideas.",
        ("Earth", "Water"): "Natural harmony! Earth provides structure for Water's emotions.",
        ("Air", "Air"): "Intellectual connection! You'll never run out of things to discuss.",
        ("Air", "Water"): "Mysterious attraction. Air brings lightness to Water's depth.",
        ("Water", "Water"): "Deep emotional bond! You intuitively understand each other."
    }
    
    key = (element1, element2) if (element1, element2) in insights else (element2, element1)
    insight = insights.get(key, "Unique and interesting dynamic between your signs!")
    
    return {
        "sign1": sign1,
        "sign2": sign2,
        "element1": element1,
        "element2": element2,
        "insight": insight
    }

# ============================================================================
# REWARDS & GAMIFICATION
# ============================================================================

@api_router.get("/rewards/daily-spin-status")
async def check_daily_spin_status(user: User = Depends(get_current_user)):
    """Check if user can spin the cosmic wheel today"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_data = await db.users.find_one({"id": user.id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = date.today()
    last_spin = user_data.get("last_spin_date")
    
    # Check if user can spin (once per day)
    can_spin = True
    if last_spin:
        if isinstance(last_spin, str):
            last_spin = datetime.fromisoformat(last_spin).date()
        elif isinstance(last_spin, datetime):
            last_spin = last_spin.date()
        
        can_spin = last_spin < today
    
    return {
        "can_spin": can_spin,
        "last_spin_date": str(last_spin) if last_spin else None,
        "next_available": str(today) if not can_spin else str(today)
    }

@api_router.post("/rewards/spin-wheel")
async def spin_cosmic_wheel(user: User = Depends(get_current_user)):
    """Spin the cosmic wheel for daily rewards"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_data = await db.users.find_one({"id": user.id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = date.today()
    last_spin = user_data.get("last_spin_date")
    
    # Check if user already spun today
    if last_spin:
        if isinstance(last_spin, str):
            last_spin = datetime.fromisoformat(last_spin).date()
        elif isinstance(last_spin, datetime):
            last_spin = last_spin.date()
        
        if last_spin >= today:
            raise HTTPException(status_code=400, detail="Already spun today")
    
    # Update last spin date
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"last_spin_date": today.isoformat()}}
    )
    
    return {
        "success": True,
        "message": "Reward will be added by client"
    }

@api_router.post("/rewards/claim-reward")
async def claim_reward(reward_type: str, amount: int, user: User = Depends(get_current_user)):
    """Claim a reward from cosmic wheel"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_data = await db.users.find_one({"id": user.id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Set 24-hour expiry for new rewards
    expiry_time = datetime.now(timezone.utc) + timedelta(hours=24)
    
    update_fields = {}
    
    if reward_type == "boost":
        current_boosts = user_data.get("profile_boosts", 0)
        update_fields["profile_boosts"] = current_boosts + amount
        update_fields["boosts_expiry"] = expiry_time
    elif reward_type == "super_like":
        current_super_likes = user_data.get("super_likes", 0)
        update_fields["super_likes"] = current_super_likes + amount
        update_fields["super_likes_expiry"] = expiry_time
    elif reward_type == "dm":
        current_dms = user_data.get("direct_messages", 0)
        update_fields["direct_messages"] = current_dms + amount
        update_fields["direct_messages_expiry"] = expiry_time
    elif reward_type == "heart":
        # Hearts are just regular likes, no expiry
        pass
    else:
        raise HTTPException(status_code=400, detail="Invalid reward type")
    
    if update_fields:
        await db.users.update_one(
            {"id": user.id},
            {"$set": update_fields}
        )
    
    return {
        "success": True,
        "reward_type": reward_type,
        "amount": amount,
        "expiry": expiry_time.isoformat() if "expiry" in str(update_fields) else None
    }

@api_router.get("/users/check-expired-rewards")
async def check_expired_rewards(user: User = Depends(get_current_user)):
    """Check and clear expired rewards"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_data = await db.users.find_one({"id": user.id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    now = datetime.now(timezone.utc)
    update_fields = {}
    
    # Check boosts expiry
    boosts_expiry = user_data.get("boosts_expiry")
    if boosts_expiry:
        if isinstance(boosts_expiry, str):
            boosts_expiry = datetime.fromisoformat(boosts_expiry)
        if boosts_expiry < now:
            update_fields["profile_boosts"] = 0
            update_fields["boosts_expiry"] = None
    
    # Check super likes expiry
    super_likes_expiry = user_data.get("super_likes_expiry")
    if super_likes_expiry:
        if isinstance(super_likes_expiry, str):
            super_likes_expiry = datetime.fromisoformat(super_likes_expiry)
        if super_likes_expiry < now:
            update_fields["super_likes"] = 0
            update_fields["super_likes_expiry"] = None
    
    # Check DMs expiry
    dms_expiry = user_data.get("direct_messages_expiry")
    if dms_expiry:
        if isinstance(dms_expiry, str):
            dms_expiry = datetime.fromisoformat(dms_expiry)
        if dms_expiry < now:
            update_fields["direct_messages"] = 0
            update_fields["direct_messages_expiry"] = None
    
    if update_fields:
        await db.users.update_one(
            {"id": user.id},
            {"$set": update_fields}
        )
    
    return {
        "expired_items_cleared": len(update_fields) > 0,
        "remaining_boosts": user_data.get("profile_boosts", 0) if not update_fields.get("profile_boosts") == 0 else 0,
        "remaining_super_likes": user_data.get("super_likes", 0) if not update_fields.get("super_likes") == 0 else 0,
        "remaining_dms": user_data.get("direct_messages", 0) if not update_fields.get("direct_messages") == 0 else 0
    }

app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# ============================================================================
# CHAT/MESSAGING ENDPOINTS  
# ============================================================================

@api_router.get("/matches/my-matches")
async def get_my_matches(user: User = Depends(get_current_user)):
    """Get all matches for current user"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find all matches where user is either user1 or user2
    matches = await db.matches.find({
        "$or": [
            {"user1_id": user.id},
            {"user2_id": user.id}
        ],
        "status": "matched"
    }).to_list(length=100)
    
    matched_users = []
    for match in matches:
        # Get the other user's ID
        other_user_id = match["user2_id"] if match["user1_id"] == user.id else match["user1_id"]
        
        # Fetch the other user's profile
        other_user = await db.users.find_one({"id": other_user_id})
        if other_user:
            matched_users.append({
                "id": other_user["id"],
                "match_id": match["id"],
                "first_name": other_user.get("first_name", other_user.get("name", "Unknown")),
                "last_name": other_user.get("last_name", ""),
                "zodiac_sign": other_user.get("zodiac_sign", "Unknown"),
                "birth_date": other_user["birth_date"].isoformat() if isinstance(other_user["birth_date"], date) else other_user["birth_date"],
                "current_location": other_user.get("current_location"),
                "profile_photos": other_user.get("profile_photos"),
                "compatibility_score": match.get("compatibility_score", 75),
                "matched_at": match["matched_at"].isoformat() if isinstance(match["matched_at"], datetime) else match["matched_at"]
            })
    
    # Sort by match date (most recent first)
    matched_users.sort(key=lambda x: x["matched_at"], reverse=True)
    
    return matched_users

@api_router.get("/messages/{match_user_id}")
async def get_messages(match_user_id: str, user: User = Depends(get_current_user)):
    """Get all messages with a specific matched user"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get messages between these two users
    messages = await db.messages.find({
        "$or": [
            {"sender_id": user.id, "receiver_id": match_user_id},
            {"sender_id": match_user_id, "receiver_id": user.id}
        ]
    }).sort("sent_at", 1).to_list(length=500)
    
    return messages

class SendMessageRequest(BaseModel):
    match_id: str
    receiver_id: str
    message: str

@api_router.post("/messages/send")
async def send_message(request: SendMessageRequest, user: User = Depends(get_current_user)):
    """Send a message to a matched user"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify they are matched
    match = await db.matches.find_one({
        "id": request.match_id,
        "$or": [
            {"user1_id": user.id, "user2_id": request.receiver_id},
            {"user1_id": request.receiver_id, "user2_id": user.id}
        ]
    })
    
    if not match:
        raise HTTPException(status_code=403, detail="Not matched with this user")
    
    # Create message
    message = {
        "id": str(uuid.uuid4()),
        "match_id": request.match_id,
        "sender_id": user.id,
        "receiver_id": request.receiver_id,
        "message": request.message,
        "sent_at": datetime.now(timezone.utc),
        "read": False
    }
    
    await db.messages.insert_one(message)
    
    return {"success": True, "message_id": message["id"]}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()