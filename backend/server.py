from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, timezone, date
import os
import uuid
from random import choices, random as randf
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import httpx
import cloudinary
import cloudinary.uploader
import cloudinary.api
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import base64

load_dotenv()

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

# Spotify Configuration
SPOTIFY_CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.environ.get("SPOTIFY_REDIRECT_URI")

def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=SPOTIFY_REDIRECT_URI,
        scope="user-read-private user-read-email user-top-read"
    )

app = FastAPI()
api_router = APIRouter(prefix="/api")

# CORS
preview_origin = os.environ.get("PREVIEW_ORIGIN", "https://merge-dating-1.preview.emergentagent.com")
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
SECURE_COOKIES = True  # Required for SameSite=None

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
    model_config = {"extra": "allow"}  # Allow extra fields for backward compatibility
    
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
    # Profile details
    industry: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    hometown: Optional[Any] = None  # Can be string or dict for backward compatibility
    education: Optional[str] = None
    # Discovery settings
    show_age: bool = True
    show_distance: bool = True
    discovery_enabled: bool = True
    # Spotify integration
    spotify_connected: bool = False
    spotify_access_token: Optional[str] = None
    spotify_refresh_token: Optional[str] = None
    spotify_token_expires: Optional[str] = None
    vibe_song: Optional[Dict[str, Any]] = None  # {track_name, artist, preview_url, album_art, spotify_uri}
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
    # Photo verification status
    is_photo_verified: bool = False
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
    print(f"[AUTH DEBUG] Cookie name: {COOKIE_NAME}, Token: {token}, All cookies: {request.cookies}")
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
    
    # Remove MongoDB's _id field before creating User object
    if "_id" in udoc:
        del udoc["_id"]
    
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
            "star_coins": 50000,
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
    else:
        # Update existing test user's coins to 50,000 for testing
        await db.users.update_one(
            {"id": udoc["id"]},
            {"$set": {"star_coins": 50000}}
        )
        udoc["star_coins"] = 50000
    
    # Remove MongoDB's _id field before creating User object
    if "_id" in udoc:
        del udoc["_id"]
    
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

@api_router.post("/auth/session")
async def handle_google_session(request: Request, response: Response):
    """Handle Google OAuth session from Emergent Auth"""
    try:
        # Get session ID from header
        session_id = request.headers.get('X-Session-ID')
        
        print(f"[AUTH] Received session request with ID: {session_id}")
        
        if not session_id:
            print("[AUTH] No session ID provided")
            raise HTTPException(status_code=400, detail="No session ID provided")
        
        # Get request body to check for additional data
        body = await request.json() if request.headers.get('content-length') else {}
        print(f"[AUTH] Request body: {body}")
        
        # Check if email is provided directly in the request
        email = body.get("email")
        name = body.get("name", "")
        
        if not email:
            # Try to get from Emergent session storage (if available)
            # For now, use session_id as a temporary identifier
            # In production, this should integrate with Emergent's actual auth system
            print("[AUTH] No email provided - using test mode")
            
            # Create a test email based on session ID for development
            # This allows testing the flow without full OAuth integration
            email = f"user_{session_id[:8]}@emergent-test.com"
            name = f"User {session_id[:4]}"
            print(f"[AUTH] Generated test credentials: {email}")
        
        print(f"[AUTH] Authenticated email: {email}")
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": email})
        
        if existing_user:
            # Existing user - log them in
            user_id = existing_user["id"]
            needs_onboarding = not existing_user.get("profile_completed", False)
            print(f"[AUTH] Existing user found: {user_id}, needs_onboarding: {needs_onboarding}")
        else:
            # New user - create account
            user_id = str(uuid.uuid4())
            first_name = name.split()[0] if name else email.split('@')[0]
            
            new_user = {
                "id": user_id,
                "email": email,
                "first_name": first_name,
                "profile_completed": False,
                "star_coins": 50000,
                "photos": [],
                "interests": [],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.users.insert_one(new_user)
            needs_onboarding = True
            print(f"[AUTH] New user created: {user_id}")
        
        # Set session cookie
        response.set_cookie(
            key="user_id",
            value=user_id,
            httponly=True,
            secure=SECURE_COOKIES,
            samesite="none",
            max_age=30 * 24 * 60 * 60  # 30 days
        )
        
        print(f"[AUTH] Session successful, cookie set")
        
        return {
            "success": True,
            "needs_onboarding": needs_onboarding
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AUTH] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Authentication failed")


@api_router.post("/onboarding/complete")
async def complete_onboarding(request: Request, response: Response):
    """Complete user onboarding and create full profile"""
    try:
        # Get user_id from cookie
        user_id = request.cookies.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Get onboarding data from request
        data = await request.json()
        
        print(f"[ONBOARDING] Completing profile for user: {user_id}")
        print(f"[ONBOARDING] Data received: {data.keys()}")
        
        # Find user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate age from birth_date
        from datetime import datetime, date
        birth_date_str = data.get('birth_date')
        age = None
        zodiac_sign = None
        
        if birth_date_str:
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            
            # Calculate zodiac sign
            zodiac_signs = [
                ((1, 20), (2, 18), 'Aquarius'), ((2, 19), (3, 20), 'Pisces'),
                ((3, 21), (4, 19), 'Aries'), ((4, 20), (5, 20), 'Taurus'),
                ((5, 21), (6, 20), 'Gemini'), ((6, 21), (7, 22), 'Cancer'),
                ((7, 23), (8, 22), 'Leo'), ((8, 23), (9, 22), 'Virgo'),
                ((9, 23), (10, 22), 'Libra'), ((10, 23), (11, 21), 'Scorpio'),
                ((11, 22), (12, 21), 'Sagittarius'), ((12, 22), (1, 19), 'Capricorn')
            ]
            
            for start, end, sign in zodiac_signs:
                if (birth_date.month == start[0] and birth_date.day >= start[1]) or \
                   (birth_date.month == end[0] and birth_date.day <= end[1]):
                    zodiac_sign = sign
                    break
        
        # Prepare update data
        update_data = {
            "first_name": data.get('first_name'),
            "birth_date": birth_date_str,
            "age": age,
            "zodiac_sign": zodiac_sign,
            "hometown": data.get('hometown'),
            
            # Personality
            "personality_type": data.get('personality_type'),
            "mbti_scores": data.get('mbti_scores', {}),
            "mbti_answers": {
                "social_energy_source": data.get('social_energy_source'),
                "information_processing": data.get('information_processing'),
                "decision_making": data.get('decision_making'),
                "sliders": data.get('mbti_sliders', {})
            },
            
            # Lifestyle & Deal-breakers
            "deal_breakers": data.get('deal_breakers', {}),
            "interests": data.get('interests', []),
            "lifestyle_factors": {
                "social_energy": data.get('lifestyle_factors', {}).get('social_energy', 3),
                "occupation": data.get('lifestyle_factors', {}).get('occupation', '')
            },
            
            # Communication preferences
            "preferences": data.get('preferences', {}),
            
            # Photos
            "photos": data.get('photos', []),
            
            # Mark profile as completed
            "profile_completed": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Update user in database
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            print("[ONBOARDING] Warning: No documents modified")
        
        print(f"[ONBOARDING] Profile completed successfully for {user_id}")
        
        return {
            "success": True,
            "message": "Profile completed successfully",
            "user_id": user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ONBOARDING] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to complete onboarding: {str(e)}")



@api_router.put("/users/me")
async def update_user_profile(
    request: Request,
    user: User = Depends(get_current_user)
):
    """
    Update user profile with various fields
    """
    body = await request.json()
    
    # Define allowed fields for update
    allowed_fields = [
        'bio', 'interests', 'first_name', 'industry', 
        'job_title', 'location', 'hometown', 'education',
        'show_age', 'show_distance', 'discovery_enabled'
    ]
    
    update_data = {}
    for field in allowed_fields:
        if field in body:
            update_data[field] = body[field]
    
    if update_data:
        await db.users.update_one(
            {"id": user.id},
            {"$set": update_data}
        )
    
    return {"success": True, "message": "Profile updated successfully"}


# Photo Upload Endpoint
@api_router.post("/users/photos/upload")
async def upload_photo(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    """
    Upload a photo to Cloudinary and return the URL
    """
    try:
        # Read file content
        contents = await file.read()
        
        # Upload to Cloudinary with transformation for optimization
        upload_result = cloudinary.uploader.upload(
            contents,
            folder=f"merge_dating/{user.id}",
            transformation=[
                {'width': 1000, 'height': 1000, 'crop': 'limit'},
                {'quality': 'auto:good'},
                {'fetch_format': 'auto'}
            ],
            resource_type="image"
        )
        
        # Return secure URL
        return {
            "success": True,
            "url": upload_result['secure_url'],
            "public_id": upload_result['public_id']
        }
    
    except Exception as e:
        print(f"[PHOTO_UPLOAD] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Photo upload failed: {str(e)}")


# Update User Photos
@api_router.put("/users/photos")
async def update_user_photos(
    request: Request,
    user: User = Depends(get_current_user)
):
    """
    Update user's photo array with reordering/deletion
    """
    try:
        body = await request.json()
        photos = body.get("photos", [])
        
        # Validate photos array (max 6 photos)
        if not isinstance(photos, list):
            raise HTTPException(status_code=400, detail="Photos must be an array")
        
        if len(photos) > 6:
            raise HTTPException(status_code=400, detail="Maximum 6 photos allowed")
        
        # Update user photos in database
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"photos": photos}}
        )
        
        return {
            "success": True,
            "message": "Photos updated successfully",
            "photos": photos
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[PHOTO_UPDATE] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update photos: {str(e)}")


# Delete Photo from Cloudinary
@api_router.delete("/users/photos/{public_id:path}")
async def delete_photo(
    public_id: str,
    user: User = Depends(get_current_user)
):
    """
    Delete a photo from Cloudinary
    """
    try:
        # Delete from Cloudinary
        result = cloudinary.uploader.destroy(public_id)
        
        return {
            "success": True,
            "message": "Photo deleted successfully",
            "result": result
        }
    
    except Exception as e:
        print(f"[PHOTO_DELETE] Error: {e}")
        # Don't fail if cloudinary delete fails - photo might already be gone
        return {
            "success": True,
            "message": "Photo removed from profile"
        }


# ================== SPOTIFY INTEGRATION ==================

@api_router.get("/spotify/auth-url")
async def get_spotify_auth_url(user: User = Depends(get_current_user)):
    """
    Get Spotify OAuth authorization URL
    """
    try:
        sp_oauth = get_spotify_oauth()
        auth_url = sp_oauth.get_authorize_url()
        return {"auth_url": auth_url}
    except Exception as e:
        print(f"[SPOTIFY_AUTH] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")


@api_router.get("/spotify/callback")
async def spotify_callback(code: str, request: Request):
    """
    Handle Spotify OAuth callback
    """
    try:
        # Get user from session
        session_token = request.cookies.get(COOKIE_NAME)
        if not session_token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        session_doc = await db.sessions.find_one({"token": session_token})
        if not session_doc:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        user_id = session_doc["user_id"]
        
        # Exchange code for tokens
        sp_oauth = get_spotify_oauth()
        token_info = sp_oauth.get_access_token(code)
        
        # Update user with Spotify tokens
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "spotify_connected": True,
                "spotify_access_token": token_info["access_token"],
                "spotify_refresh_token": token_info["refresh_token"],
                "spotify_token_expires": token_info["expires_at"]
            }}
        )
        
        # Redirect back to profile page
        return RedirectResponse(url="/profile?spotify=connected")
    
    except Exception as e:
        print(f"[SPOTIFY_CALLBACK] Error: {e}")
        return RedirectResponse(url="/profile?spotify=error")


@api_router.get("/spotify/search")
async def spotify_search(q: str, user: User = Depends(get_current_user)):
    """
    Search for songs on Spotify
    """
    if not user.spotify_connected or not user.spotify_access_token:
        raise HTTPException(status_code=400, detail="Spotify not connected")
    
    try:
        sp = spotipy.Spotify(auth=user.spotify_access_token)
        results = sp.search(q=q, limit=20, type='track')
        
        tracks = []
        for item in results['tracks']['items']:
            tracks.append({
                "id": item['id'],
                "name": item['name'],
                "artist": ", ".join([artist['name'] for artist in item['artists']]),
                "album": item['album']['name'],
                "album_art": item['album']['images'][0]['url'] if item['album']['images'] else None,
                "preview_url": item['preview_url'],
                "spotify_uri": item['uri'],
                "duration_ms": item['duration_ms']
            })
        
        return {"tracks": tracks}
    
    except Exception as e:
        print(f"[SPOTIFY_SEARCH] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@api_router.get("/spotify/top-tracks")
async def get_top_tracks(user: User = Depends(get_current_user)):
    """
    Get user's top tracks from Spotify
    """
    if not user.spotify_connected or not user.spotify_access_token:
        raise HTTPException(status_code=400, detail="Spotify not connected")
    
    try:
        sp = spotipy.Spotify(auth=user.spotify_access_token)
        results = sp.current_user_top_tracks(limit=20, time_range='medium_term')
        
        tracks = []
        for item in results['items']:
            tracks.append({
                "id": item['id'],
                "name": item['name'],
                "artist": ", ".join([artist['name'] for artist in item['artists']]),
                "album": item['album']['name'],
                "album_art": item['album']['images'][0]['url'] if item['album']['images'] else None,
                "preview_url": item['preview_url'],
                "spotify_uri": item['uri'],
                "duration_ms": item['duration_ms']
            })
        
        return {"tracks": tracks}
    
    except Exception as e:
        print(f"[SPOTIFY_TOP_TRACKS] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get top tracks: {str(e)}")


@api_router.post("/spotify/set-vibe-song")
async def set_vibe_song(request: Request, user: User = Depends(get_current_user)):
    """
    Set user's vibe song
    """
    try:
        body = await request.json()
        vibe_song = body.get("vibe_song")
        
        if not vibe_song:
            raise HTTPException(status_code=400, detail="vibe_song is required")
        
        # Update user's vibe song
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"vibe_song": vibe_song}}
        )
        
        return {
            "success": True,
            "message": "Vibe song updated successfully",
            "vibe_song": vibe_song
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SET_VIBE_SONG] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to set vibe song: {str(e)}")


@api_router.delete("/spotify/disconnect")
async def disconnect_spotify(user: User = Depends(get_current_user)):
    """
    Disconnect Spotify account
    """
    try:
        await db.users.update_one(
            {"id": user.id},
            {"$set": {
                "spotify_connected": False,
                "spotify_access_token": None,
                "spotify_refresh_token": None,
                "spotify_token_expires": None
            }}
        )
        
        return {
            "success": True,
            "message": "Spotify disconnected successfully"
        }
    
    except Exception as e:
        print(f"[SPOTIFY_DISCONNECT] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to disconnect Spotify: {str(e)}")


# ================== UNIVERSAL MUSIC SEARCH (DEEZER API) ==================

@api_router.get("/music/search")
async def universal_music_search(q: str, limit: int = 20):
    """
    Universal music search using Deezer API (works globally, no auth required)
    """
    try:
        import requests
        
        # Deezer API - free, no authentication needed, available globally
        response = requests.get(
            "https://api.deezer.com/search",
            params={"q": q, "limit": limit},
            timeout=10
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Music search service unavailable")
        
        data = response.json()
        tracks = []
        
        for item in data.get("data", []):
            tracks.append({
                "id": str(item.get("id")),
                "title": item.get("title"),
                "artist": item.get("artist", {}).get("name"),
                "album": item.get("album", {}).get("title"),
                "album_art": item.get("album", {}).get("cover_medium"),
                "preview_url": item.get("preview"),  # 30-second preview
                "duration": item.get("duration"),
                "source": "deezer"
            })
        
        return {"tracks": tracks}
    
    except requests.RequestException as e:
        print(f"[MUSIC_SEARCH] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Music search failed: {str(e)}")
    except Exception as e:
        print(f"[MUSIC_SEARCH] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@api_router.post("/music/set-anthem")
async def set_music_anthem(request: Request, user: User = Depends(get_current_user)):
    """
    Set user's music anthem (works for all users, no Spotify required)
    """
    try:
        body = await request.json()
        anthem = body.get("anthem")
        
        if not anthem or not isinstance(anthem, dict):
            raise HTTPException(status_code=400, detail="anthem is required and must be an object")
        
        # Validate anthem structure
        required_fields = ["title", "artist"]
        if not all(field in anthem for field in required_fields):
            raise HTTPException(status_code=400, detail="anthem must include title and artist")
        
        # Update user's vibe song (now anthem)
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"vibe_song": anthem}}
        )
        
        return {
            "success": True,
            "message": "Music anthem set successfully",
            "anthem": anthem
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SET_ANTHEM] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to set anthem: {str(e)}")


@api_router.delete("/music/remove-anthem")
async def remove_music_anthem(user: User = Depends(get_current_user)):
    """
    Remove user's music anthem
    """
    try:
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"vibe_song": None}}
        )
        
        return {
            "success": True,
            "message": "Music anthem removed successfully"
        }
    
    except Exception as e:
        print(f"[REMOVE_ANTHEM] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to remove anthem: {str(e)}")


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
            "current_location": u.get("current_location", {"latitude": 34.05, "longitude": -118.24, "city": "Los Angeles"}),
            "compatibility_score": randf() * 30 + 70,
            "bio": u.get("bio", "Stargazer. Coffee lover."),
            "interests": u.get("interests", ["music", "coffee"]),
            "lifestyle_factors": u.get("lifestyle_factors", {}),
            "deal_breakers": u.get("deal_breakers", {}),
            "preferences": u.get("preferences", {}),
            "education": u.get("education", {"college": "UCLA"}),
            "vibe_song": u.get("vibe_song"),
            "trustScore": u.get("trust_score", 75)
        })
    return result

@api_router.get("/matches")
async def get_matches(user: User = Depends(get_current_user)):
    """Get all matches for the current user"""
    try:
        # Find all matches where user is either user1 or user2
        matches_cursor = db.matches.find({
            "$or": [
                {"user1_id": user.id},
                {"user2_id": user.id}
            ]
        })
        matches = await matches_cursor.to_list(length=100)
        
        result = []
        for match in matches:
            # Determine the other user
            other_user_id = match["user2_id"] if match["user1_id"] == user.id else match["user1_id"]
            
            # Get other user's profile
            other_user = await db.users.find_one({"id": other_user_id})
            
            if other_user:
                result.append({
                    "id": match.get("id"),
                    "match_id": match.get("id"),
                    "first_name": other_user.get("first_name", "User"),
                    "last_name": other_user.get("last_name", ""),
                    "birth_date": other_user.get("birth_date", "1995-01-01"),
                    "zodiac_sign": other_user.get("zodiac_sign", "Leo"),
                    "photos": other_user.get("photos", ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80"]),
                    "current_location": other_user.get("current_location", {"city": "Unknown"}),
                    "compatibility_score": match.get("compatibility_score", 85),
                    "matched_at": match.get("matched_at")
                })
        
        return result
    except Exception as e:
        print(f"Error fetching matches: {e}")
# === TRUST SCORE HELPERS ===

def calculate_enhanced_trust_score(user_data: dict) -> float:
    """Apply photo verification multiplier and caps to foundational trust score.

    - Foundational trust: existing user_data["trust_score"] (0-100)
    - If photo verified: 1.5x multiplier, capped at 100
    - If NOT verified: hard cap at 75
    """
    foundational_trust = float(user_data.get("trust_score", 70.0))
    is_photo_verified = bool(user_data.get("is_photo_verified") or user_data.get("photo_verified"))

    if is_photo_verified:
        enhanced = foundational_trust * 1.5
        return min(enhanced, 100.0)
    # Unverified users: cap at 75
    return min(foundational_trust, 75.0)



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
    # Use enhanced trust score with photo verification multiplier and caps
    enhanced_trust_score = calculate_enhanced_trust_score(user_data)
    behavior_trust_score = enhanced_trust_score
    
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
            "is_photo_verified": u.get("is_photo_verified", False),
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

@api_router.get("/messages/unread-count")
async def get_unread_count(user: User = Depends(get_current_user)):
    """Get count of unread messages for the current user"""
    try:
        # Get all matches for this user
        matches = await db.matches.find({
            "$or": [{"user1_id": user.id}, {"user2_id": user.id}]
        }).to_list(length=None)
        
        unread_count = 0
        
        for match in matches:
            match_id = match["id"]
            
            # Get the last message in this conversation
            last_message = await db.messages.find_one(
                {"match_id": match_id},
                sort=[("created_at", -1)]
            )
            
            # If there's a message and it's not from the current user, it's unread
            if last_message and last_message.get("sender_id") != user.id:
                # Check if user has read this conversation
                # For simplicity, we'll count any conversation where the last message is from the other user
                unread_count += 1
        
        return {"unread_count": unread_count}
    except Exception as e:
        print(f"Error getting unread count: {e}")
        return {"unread_count": 0}

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
    {"day": 5, "type": "cosmetic", "item": "basic_aura", "tier": "silver", "label": "Basic Profile Aura"},
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
    {"day": 17, "type": "cosmetic", "item": "rare_aura", "tier": "silver", "label": "Rare Premium Aura"},
    {"day": 18, "type": "utility", "item": "super_like", "amount": 1, "tier": "bronze", "label": "1 Super Like"},
    {"day": 19, "type": "coins", "amount": 35, "tier": "bronze", "label": "35 Star Coins"},
    {"day": 20, "type": "utility", "item": "dm_token", "amount": 1, "tier": "silver", "label": "1 Direct Message Token"},
    {"day": 21, "type": "legendary", "tier": "gold", "milestone": True, "label": "Legendary Bundle", 
     "bundle": {"premium_aura": 1, "boost": 2, "multiplier": {"amount": 1.25, "duration_hours": 48}}}
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
    
    # Premium Auras - Overlay-based themes (no borders/frames)
    {
        "id": "aura_galaxy",
        "name": "Galaxy Aura",
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
        "id": "aura_pastel",
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
        "id": "aura_zodiac",
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
        "id": "aura_neon",
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
        "id": "aura_pride_spectrum",
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
        "id": "aura_autism_spectrum",
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
    },
    
    # Zodiac Sign Auras
    {
        "id": "aura_aries",
        "name": "Aries",
        "type": "skin",
        "price": 1200,
        "description": "Blazing Trail - Animated ember particles and spark effects",
        "effect": {
            "type": "aries",
            "gradientColors": ["#FF6B6B", "#FFD166"],
            "particles": {"type": "embers", "count": 30, "spark": True},
            "animation": "pulsing_sparks",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#FFD166"
        }
    },
    {
        "id": "aura_taurus",
        "name": "Taurus",
        "type": "skin",
        "price": 1200,
        "description": "Grounded Glow - Subtle earth-toned pulse with leaf particles",
        "effect": {
            "type": "taurus",
            "gradientColors": ["#4ECDC4", "#A1887F"],
            "particles": {"type": "leaves", "count": 20, "float": True},
            "animation": "heartbeat_pulse",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#4ECDC4"
        }
    },
    {
        "id": "aura_gemini",
        "name": "Gemini",
        "type": "skin",
        "price": 1200,
        "description": "Twin Pulse - Two colors alternating in rhythmic pattern",
        "effect": {
            "type": "gemini",
            "gradientColors": ["#667EEA", "#C0C0C0"],
            "animation": "alternating_glow",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#667EEA"
        }
    },
    {
        "id": "aura_cancer",
        "name": "Cancer",
        "type": "skin",
        "price": 1200,
        "description": "Lunar Tide - Gentle wave-like washing motion",
        "effect": {
            "type": "cancer",
            "gradientColors": ["#E8EAF0", "#4A90E2"],
            "animation": "horizontal_wave",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#4A90E2"
        }
    },
    {
        "id": "aura_leo",
        "name": "Leo",
        "type": "skin",
        "price": 1200,
        "description": "Solar Flare - Radiant sunburst with ray effects",
        "effect": {
            "type": "leo",
            "gradientColors": ["#FFD700", "#8A4FFF"],
            "particles": {"type": "rays", "count": 12, "radial": True},
            "animation": "pulsing_outward",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#FFD700"
        }
    },
    {
        "id": "aura_virgo",
        "name": "Virgo",
        "type": "skin",
        "price": 1200,
        "description": "Precision Glow - Clean geometric pattern overlay",
        "effect": {
            "type": "virgo",
            "gradientColors": ["#96CEB4", "#FFF8E1"],
            "animation": "geometric_pattern",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#96CEB4"
        }
    },
    {
        "id": "aura_libra",
        "name": "Libra",
        "type": "skin",
        "price": 1200,
        "description": "Balanced Harmony - Two colors flowing in perfect sync",
        "effect": {
            "type": "libra",
            "gradientColors": ["#FF9A8B", "#87CEEB"],
            "animation": "symmetrical_flow",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#FF9A8B"
        }
    },
    {
        "id": "aura_scorpio",
        "name": "Scorpio",
        "type": "skin",
        "price": 1200,
        "description": "Mystic Veil - Dark shimmer with crimson accents",
        "effect": {
            "type": "scorpio",
            "gradientColors": ["#B71C1C", "#2D3748"],
            "animation": "mystic_shimmer",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#B71C1C"
        }
    },
    {
        "id": "aura_sagittarius",
        "name": "Sagittarius",
        "type": "skin",
        "price": 1200,
        "description": "Arrow Trail - Motion lines like a shooting arrow",
        "effect": {
            "type": "sagittarius",
            "gradientColors": ["#6C63FF", "#FFE66D"],
            "animation": "directional_flow",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#FFE66D"
        }
    },
    {
        "id": "aura_capricorn",
        "name": "Capricorn",
        "type": "skin",
        "price": 1200,
        "description": "Stone Foundation - Solid geometric block patterns",
        "effect": {
            "type": "capricorn",
            "gradientColors": ["#666666", "#CD7F32"],
            "animation": "stable_shift",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#CD7F32"
        }
    },
    {
        "id": "aura_aquarius",
        "name": "Aquarius",
        "type": "skin",
        "price": 1200,
        "description": "Future Pulse - Digital glitch and data stream effects",
        "effect": {
            "type": "aquarius",
            "gradientColors": ["#00A8E8", "#B0BEC5"],
            "particles": {"type": "data_stream", "count": 15, "digital": True},
            "animation": "glitch_pulse",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#00A8E8"
        }
    },
    {
        "id": "aura_pisces",
        "name": "Pisces",
        "type": "skin",
        "price": 1200,
        "description": "Ocean Dream - Flowing water-like animation",
        "effect": {
            "type": "pisces",
            "gradientColors": ["#4ECDC4", "#A56CD0"],
            "animation": "vertical_wave",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#A56CD0"
        }
    },
    
    # Premium Cosmic Auras
    {
        "id": "aura_galactic_nebula",
        "name": "Galactic Nebula",
        "type": "skin",
        "price": 2000,
        "description": "Starfield - Twinkling star particles on rotating gradient (Premium)",
        "effect": {
            "type": "galactic_nebula",
            "gradientColors": ["#667EEA", "#6C63FF", "#8A4FFF"],
            "particles": {"type": "stars", "count": 50, "twinkle": True},
            "animation": "color_rotation",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#8A4FFF"
        }
    },
    {
        "id": "aura_solar_eclipse",
        "name": "Solar Eclipse",
        "type": "skin",
        "price": 2000,
        "description": "Corona Glow - Golden rim lighting on dark background (Premium)",
        "effect": {
            "type": "solar_eclipse",
            "gradientColors": ["#2D3748", "#FFD700"],
            "animation": "corona_pulse",
            "nameAnimation": "zodiac_gradient",
            "textGlow": "#FFD700"
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
    item_type: str  # "light" or "aura"

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

# ==================== AI CONVERSATION STARTERS ====================

class AIStarterRequest(BaseModel):
    prompt: str
    currentUser: Dict[str, Any]
    matchUser: Dict[str, Any]
    cosmicInsights: Dict[str, Any]

@api_router.post("/ai/conversation-starters")
async def generate_conversation_starters(body: AIStarterRequest, request: Request):
    """
    Generate AI-powered conversation starters using OpenAI GPT-4
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Get API key from environment
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Create unique session ID for this request
        session_id = f"ai_starters_{uuid.uuid4()}"
        
        # Initialize LLM chat with GPT-4o-mini (fast and cost-effective)
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You are a witty, astrology-savvy dating coach."
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message with the prompt
        user_message = UserMessage(text=body.prompt)
        
        # Send message and get response
        response = await chat.send_message(user_message)
        
        # Parse the response to extract 3 starters
        starters = []
        lines = response.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            # Remove numbering like "1.", "2.", "3."
            if line and (line[0].isdigit() or line.startswith('-')):
                # Remove leading number/dash and dot
                cleaned = line.lstrip('0123456789.-) ').strip()
                if cleaned and len(cleaned) > 10:  # Valid starter
                    starters.append(cleaned)
        
        # Ensure we have exactly 3 starters
        if len(starters) < 3:
            # Fallback starters if parsing failed
            match_name = body.matchUser.get('name', 'there')
            match_sign = body.matchUser.get('sign', 'sign')
            starters = [
                f"Hey {match_name}! Fellow {match_sign}—what's your cosmic vibe today? ✨",
                f"Your {match_sign} energy is fascinating—what makes you you? 🌙",
                f"The stars suggest we'd vibe well—coffee to explore this? ☕"
            ]
        
        # Return only first 3
        starters = starters[:3]
        
        return {
            "success": True,
            "starters": starters,
            "model": "gpt-4o-mini"
        }
        
    except Exception as e:
        print(f"AI generation error: {e}")
        # Return fallback starters on any error
        match_name = body.matchUser.get('name', 'there')
        match_sign = body.matchUser.get('sign', 'sign')
        
        return {
            "success": True,
            "starters": [
                f"Hey {match_name}! Your {match_sign} energy caught my attention ✨",
                f"Fellow cosmic explorer—what's your story? 🌙",
                f"The universe brought us here—let's see where this goes ⭐"
            ],
            "model": "fallback"
        }

# ==================== CONVERSATION STARTERS FOR MESSAGING ====================

class ConversationStartersRequest(BaseModel):
    match_id: str
    conversation_stage: str = "first_message"  # first_message, stalled, active

@api_router.get("/conversation-starters/{match_id}")
async def get_conversation_starters(
    match_id: str,
    conversation_stage: str = "first_message",
    user: User = Depends(get_current_user)
):
    """
    Get personalized conversation starters for a specific match
    """
    try:
        # Get match data
        match_doc = await db.matches.find_one({"id": match_id})
        if not match_doc:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Determine the other user
        other_user_id = match_doc["user2_id"] if match_doc["user1_id"] == user.id else match_doc["user1_id"]
        other_user_doc = await db.users.find_one({"id": other_user_id})
        if not other_user_doc:
            raise HTTPException(status_code=404, detail="Match user not found")
        
        # Get message history to determine context
        messages_cursor = db.messages.find({"match_id": match_id}).sort("sent_at", 1).limit(10)
        messages = await messages_cursor.to_list(length=10)
        
        # Get or generate conversation starters
        starter_doc = await db.conversation_starters.find_one({
            "match_id": match_id,
            "user_id": user.id,
            "conversation_stage": conversation_stage
        })
        
        # Check if starters are recent (within 2 hours)
        if starter_doc and starter_doc.get("created_at"):
            created_at = starter_doc["created_at"]
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at)
            age = now_utc() - created_at
            if age < timedelta(hours=2):
                return {
                    "success": True,
                    "starters": starter_doc.get("starters", []),
                    "cached": True
                }
        
        # Generate new starters using AI
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            # Return fallback starters
            return generate_fallback_starters(user, other_user_doc, conversation_stage)
        
        # Build context for AI
        shared_interests = find_shared_interests(user, other_user_doc)
        
        prompt = build_starter_prompt(
            user,
            other_user_doc,
            shared_interests,
            conversation_stage,
            len(messages)
        )
        
        session_id = f"starters_{match_id}_{uuid.uuid4()}"
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You are a witty, empathetic dating coach who creates personalized, engaging conversation starters."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse starters
        starters = parse_ai_starters(response)
        
        # Store in database
        await db.conversation_starters.insert_one({
            "id": str(uuid.uuid4()),
            "match_id": match_id,
            "user_id": user.id,
            "conversation_stage": conversation_stage,
            "starters": starters,
            "created_at": now_utc(),
            "used": []
        })
        
        return {
            "success": True,
            "starters": starters,
            "cached": False
        }
        
    except Exception as e:
        print(f"Error generating conversation starters: {e}")
        # Return fallback starters on error
        try:
            other_user_doc = await db.users.find_one({"id": other_user_id})
            return generate_fallback_starters(user, other_user_doc, conversation_stage)
        except:
            return {
                "success": True,
                "starters": [
                    "Hey! I'd love to get to know you better. What brings you joy?",
                    "Your profile caught my attention! What's something you're passionate about?",
                    "Let's start with something fun—what's your go-to weekend activity?"
                ],
                "cached": False
            }

@api_router.post("/conversation-starters/{match_id}/track")
async def track_starter_usage(
    match_id: str,
    body: dict,
    user: User = Depends(get_current_user)
):
    """
    Track which conversation starters users actually use
    """
    try:
        starter_text = body.get("starter_text", "")
        starter_index = body.get("starter_index", -1)
        
        await db.conversation_starters.update_one(
            {
                "match_id": match_id,
                "user_id": user.id
            },
            {
                "$push": {
                    "used": {
                        "starter_text": starter_text,
                        "starter_index": starter_index,
                        "used_at": now_utc()
                    }
                }
            }
        )
        
        return {"success": True}
    except Exception as e:
        print(f"Error tracking starter usage: {e}")
        return {"success": False, "error": str(e)}

def find_shared_interests(user1, user2):
    """Find shared interests between two users"""
    interests1 = set(user1.interests or [])
    interests2 = set(user2.get("interests", []))
    shared = list(interests1 & interests2)
    return shared

def build_starter_prompt(user, other_user, shared_interests, conversation_stage, message_count):
    """Build AI prompt for conversation starters"""
    
    user1_name = user.first_name
    user2_name = other_user.get("first_name", "them")
    user1_sign = user.zodiac_sign or "Unknown"
    user2_sign = other_user.get("zodiac_sign", "Unknown")
    user1_interests = ", ".join(user.interests[:5]) if user.interests else "not specified"
    user2_interests = ", ".join(other_user.get("interests", [])[:5]) or "not specified"
    shared_text = ", ".join(shared_interests) if shared_interests else "none identified"
    
    if conversation_stage == "first_message":
        context = f"This is the very first message between {user1_name} and {user2_name}."
    elif conversation_stage == "stalled":
        context = f"{user1_name} and {user2_name} had {message_count} messages but the conversation has stalled."
    else:
        context = f"{user1_name} and {user2_name} have an active conversation with {message_count} messages."
    
    prompt = f"""Generate 3 personalized, engaging conversation starters for a dating app match.

CONTEXT: {context}

USER 1 ({user1_name}):
- Zodiac: {user1_sign}
- Interests: {user1_interests}

USER 2 ({user2_name}):
- Zodiac: {user2_sign}
- Interests: {user2_interests}

SHARED INTERESTS: {shared_text}

Create starters that are:
1. Personalized to their interests and signs
2. Open-ended questions that invite conversation
3. Natural, warm, and authentic (not cheesy)
4. 10-20 words each
5. Reference specific details when possible

Return ONLY 3 starters, one per line, numbered 1-3."""
    
    return prompt

def parse_ai_starters(response_text):
    """Parse AI response into list of starters"""
    starters = []
    lines = response_text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if line and (line[0].isdigit() or line.startswith('-')):
            cleaned = line.lstrip('0123456789.-) ').strip()
            if cleaned and len(cleaned) > 10:
                starters.append(cleaned)
    
    # Ensure we have exactly 3
    if len(starters) < 3:
        starters = [
            "Hey! What's something you're passionate about?",
            "Your profile caught my attention—tell me more about yourself!",
            "Let's start with something fun—what's your favorite way to spend a weekend?"
        ][:3]
    
    return starters[:3]

def generate_fallback_starters(user, other_user, conversation_stage):
    """Generate fallback starters when AI is unavailable"""
    name = other_user.get("first_name", "there")
    sign = other_user.get("zodiac_sign", "")
    interests = other_user.get("interests", [])
    
    if conversation_stage == "first_message":
        starters = [
            f"Hey {name}! Your profile caught my attention. What brings you here?",
            f"Hi {name}! I'd love to hear more about you. What are you passionate about?",
            f"Hey! Your vibe seems really cool. What's something that makes you smile?"
        ]
    elif conversation_stage == "stalled":
        starters = [
            f"Hey {name}! How has your week been going?",
            f"I was thinking about our conversation—how are you doing?",
            f"Hey! What's been the highlight of your week so far?"
        ]
    else:
        starters = [
            f"What's your take on this: {interests[0] if interests else 'your favorite hobby'}?",
            f"I'm curious—what's something you've always wanted to try?",
            f"If you could be anywhere right now, where would it be?"
        ]
    
    if sign:
        starters[0] = f"Hey {name}! As a {sign}, what's your vibe been like lately? ✨"
    
    return {
        "success": True,
        "starters": starters,
        "cached": False
    }

# ==================== COMPATIBILITY INSIGHTS AI ====================

class CompatibilityAnalysisRequest(BaseModel):
    user_a_id: str
    user_b_id: str
    context: str = "profile_view"  # profile_view, match_screen, conversation_starter
    depth: str = "standard"  # quick, standard, deep

@api_router.post("/analyze-compatibility")
async def analyze_compatibility(
    body: CompatibilityAnalysisRequest,
    user: User = Depends(get_current_user)
):
    """
    Generate AI-powered compatibility insights between two users
    """
    try:
        # Get both user profiles
        user_a_doc = await db.users.find_one({"id": body.user_a_id})
        user_b_doc = await db.users.find_one({"id": body.user_b_id})
        
        if not user_a_doc or not user_b_doc:
            raise HTTPException(status_code=404, detail="One or both users not found")
        
        # Check cache first
        cache_key = f"insights_{body.user_a_id}_{body.user_b_id}_{body.context}"
        cached_insights = await db.compatibility_insights.find_one({"cache_key": cache_key})
        
        # Check if cache is still valid (24 hours)
        if cached_insights and cached_insights.get("created_at"):
            created_at = cached_insights["created_at"]
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at)
            age = now_utc() - created_at
            if age < timedelta(hours=24):
                return {
                    "success": True,
                    "insights": cached_insights.get("insights", []),
                    "summary": cached_insights.get("summary", ""),
                    "cached": True
                }
        
        # Generate new insights using AI
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            # Return template-based insights as fallback
            return generate_template_insights(user_a_doc, user_b_doc)
        
        # Build analysis prompt
        prompt = build_compatibility_prompt(user_a_doc, user_b_doc, body.context, body.depth)
        
        session_id = f"compat_{body.user_a_id}_{body.user_b_id}_{uuid.uuid4()}"
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You are an expert relationship compatibility analyst. Generate insightful, personalized, and actionable compatibility insights for dating app users."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response into structured insights
        parsed_insights = parse_compatibility_insights(response)
        
        # Store in cache
        await db.compatibility_insights.insert_one({
            "cache_key": cache_key,
            "user_a_id": body.user_a_id,
            "user_b_id": body.user_b_id,
            "context": body.context,
            "insights": parsed_insights["insights"],
            "summary": parsed_insights["summary"],
            "created_at": now_utc()
        })
        
        return {
            "success": True,
            "insights": parsed_insights["insights"],
            "summary": parsed_insights["summary"],
            "cached": False
        }
        
    except Exception as e:
        print(f"Error analyzing compatibility: {e}")
        # Return template-based fallback
        try:
            return generate_template_insights(user_a_doc, user_b_doc)
        except:
            return {
                "success": False,
                "insights": [],
                "summary": "Unable to generate insights at this time",
                "cached": False
            }

def build_compatibility_prompt(user_a, user_b, context, depth):
    """Build AI prompt for compatibility analysis"""
    
    # Extract profile data
    user_a_name = user_a.get("first_name", "User A")
    user_b_name = user_b.get("first_name", "User B")
    
    user_a_interests = ", ".join(user_a.get("interests", [])[:5]) or "not specified"
    user_b_interests = ", ".join(user_b.get("interests", [])[:5]) or "not specified"
    
    user_a_bio = user_a.get("bio", "No bio")
    user_b_bio = user_b.get("bio", "No bio")
    
    user_a_lifestyle = user_a.get("lifestyle_factors", {})
    user_b_lifestyle = user_b.get("lifestyle_factors", {})
    
    user_a_goals = user_a.get("deal_breakers", {}).get("relationship_goals", "not specified")
    user_b_goals = user_b.get("deal_breakers", {}).get("relationship_goals", "not specified")
    
    user_a_music = user_a.get("preferences", {}).get("music", "not specified")
    user_b_music = user_b.get("preferences", {}).get("music", "not specified")
    
    user_a_occupation = user_a_lifestyle.get("occupation", "not specified")
    user_b_occupation = user_b_lifestyle.get("occupation", "not specified")
    
    # Find shared interests
    shared_interests = list(set(user_a.get("interests", [])) & set(user_b.get("interests", [])))
    shared_text = ", ".join(shared_interests) if shared_interests else "none identified"
    
    prompt = f"""Analyze these two dating app users and generate 3-4 personalized compatibility insights.

USER A ({user_a_name}):
- Interests: {user_a_interests}
- Bio: {user_a_bio}
- Occupation: {user_a_occupation}
- Relationship Goals: {user_a_goals}
- Music: {user_a_music}

USER B ({user_b_name}):
- Interests: {user_b_interests}
- Bio: {user_b_bio}
- Occupation: {user_b_occupation}
- Relationship Goals: {user_b_goals}
- Music: {user_b_music}

SHARED INTERESTS: {shared_text}

Generate 3-4 compatibility insights that:
1. Focus on LIFESTYLE COMPATIBILITY (daily routines, social preferences, work-life balance)
2. Highlight SHARED VALUES and outlooks on life
3. Suggest PRACTICAL dating scenarios they'd both enjoy
4. Are POSITIVE and encouraging (focus on opportunities, not problems)
5. Feel PERSONALIZED to these specific users (not generic)
6. Are concise and actionable

Format EXACTLY as follows (one insight per line):
[EMOJI] **[Title]**
[1-2 sentence explanation]

Example:
🎯 **Shared Adventure Spirit**
Both of you prioritize spontaneous experiences and exploring new places. Weekend getaways and trying new restaurants would be natural date ideas for you two.

Now generate 3-4 insights for {user_a_name} and {user_b_name}:"""
    
    return prompt

def parse_compatibility_insights(ai_response):
    """Parse AI response into structured insights"""
    insights = []
    lines = ai_response.strip().split('\n')
    
    current_insight = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line starts with emoji (indicates new insight)
        if line and (line[0] in ['🎯', '💫', '🌟', '✨', '🔥', '💝', '🎨', '🌈', '⭐', '💡', '🎭', '🎪'] or 
                     (len(line) > 1 and line[0:2] in ['🎯', '💫', '🌟'])):
            # Save previous insight if exists
            if current_insight:
                insights.append(current_insight)
            
            # Parse new insight
            parts = line.split('**')
            if len(parts) >= 2:
                icon = parts[0].strip()
                title = parts[1].strip()
                current_insight = {
                    "icon": icon,
                    "title": title,
                    "description": "",
                    "category": "lifestyle"
                }
        elif current_insight and line:
            # Add to description
            current_insight["description"] = (current_insight["description"] + " " + line).strip()
    
    # Add last insight
    if current_insight and current_insight.get("description"):
        insights.append(current_insight)
    
    # Generate summary
    summary = "Strong compatibility potential" if len(insights) >= 3 else "Good compatibility indicators"
    
    return {
        "insights": insights[:4],  # Max 4 insights
        "summary": summary
    }

def generate_template_insights(user_a, user_b):
    """Generate template-based insights when AI is unavailable"""
    insights = []
    
    # Check shared interests
    shared_interests = list(set(user_a.get("interests", [])) & set(user_b.get("interests", [])))
    if shared_interests:
        insights.append({
            "icon": "🎯",
            "title": "Shared Interests",
            "description": f"You both enjoy {', '.join(shared_interests[:3])}. This gives you natural conversation topics and date ideas.",
            "category": "interests"
        })
    
    # Check lifestyle factors
    user_a_lifestyle = user_a.get("lifestyle_factors", {})
    user_b_lifestyle = user_b.get("lifestyle_factors", {})
    
    if user_a_lifestyle and user_b_lifestyle:
        insights.append({
            "icon": "💼",
            "title": "Professional Connection",
            "description": "Your professional backgrounds suggest you'd understand each other's work-life balance needs.",
            "category": "lifestyle"
        })
    
    # Check relationship goals
    user_a_goals = user_a.get("deal_breakers", {}).get("relationship_goals", "")
    user_b_goals = user_b.get("deal_breakers", {}).get("relationship_goals", "")
    
    if user_a_goals and user_b_goals and user_a_goals == user_b_goals:
        insights.append({
            "icon": "💝",
            "title": "Aligned Relationship Goals",
            "description": f"You're both looking for {user_a_goals.replace('_', ' ')}. This alignment is a strong foundation.",
            "category": "goals"
        })
    
    # Default insight if none generated
    if not insights:
        insights.append({
            "icon": "✨",
            "title": "Potential Connection",
            "description": "Your profiles suggest interesting conversation possibilities. Take time to get to know each other!",
            "category": "general"
        })
    
    return {
        "success": True,
        "insights": insights[:4],
        "summary": "Good compatibility indicators",
        "cached": False
    }

app.include_router(api_router)
