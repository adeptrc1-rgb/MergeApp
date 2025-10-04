#!/usr/bin/env python3
"""
Create a test profile and session for immediate dashboard access
"""
import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date, timezone, timedelta
import asyncio
import uuid
import secrets

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.astrology_dating_db

# Placeholder image
PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

async def create_test_profile():
    """Create a test profile with session"""
    print("🚀 Creating your test profile...")
    
    user_id = str(uuid.uuid4())
    email = "testuser@asign.com"
    
    # Check if user exists
    existing = await db.users.find_one({"email": email})
    if existing:
        user_id = existing["id"]
        print(f"✓ Found existing profile: {email}")
    else:
        # Create user
        user = {
            "id": user_id,
            "email": email,
            "name": "Test User",
            "first_name": "Test",
            "last_name": "User",
            "picture": None,
            "birth_date": "1995-06-15",
            "birth_time": "14:30",
            "birth_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437},
            "hometown": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437},
            "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437},
            "zodiac_sign": "Gemini",
            "gender_identity": "man",
            "gender_self_describe": None,
            "open_to_dating": ["women"],
            "orientation_visible": True,
            "lifestyle_sliders": {
                "fitness_health": 4,
                "career_ambition": 4,
                "social_energy": 4,
                "travel_adventure": 5,
                "nightlife_lifestyle": 3,
                "family_future": 4,
                "dating_approach": 3,
                "passions_hobbies": 5
            },
            "industry": "Technology",
            "interests": ["Travel", "Technology", "Music", "Fitness"],
            "relationship_goals": "serious",
            "profile_photos": {
                "face_photo": PLACEHOLDER_IMAGE,
                "body_photo": PLACEHOLDER_IMAGE,
                "lifestyle_photo": PLACEHOLDER_IMAGE
            },
            "bio": "Tech enthusiast and adventure seeker. Love exploring new places and trying new things!",
            "age_range_min": 21,
            "age_range_max": 35,
            "max_distance_km": 80,
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "last_active": datetime.now(timezone.utc),
            "response_score": 100.0,
            "total_matches": 0,
            "responded_matches": 0,
            "avg_response_time": None,
            "profile_completed": True,
            "needs_onboarding": False,
            # Angel number and free features
            "angel_number": "666",  # Born June 15 = 6+1+5+1+9+9+5=36 -> 3+6=9 -> 999
            "profile_boosts_remaining": 4,
            "super_likes_remaining": 4,
            "direct_messages_remaining": 4
        }
        
        await db.users.insert_one(user)
        print(f"✓ Created profile: {email}")
    
    # Create session token
    session_token = secrets.token_urlsafe(32)
    
    # Check if session exists
    await db.sessions.delete_many({"user_id": user_id})
    
    session = {
        "session_token": session_token,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7)
    }
    
    await db.sessions.insert_one(session)
    print(f"✓ Created session token")
    
    print(f"\n✅ Profile ready!")
    print(f"\n📋 Session Token: {session_token}")
    print(f"\n🔗 Use this URL to login:")
    print(f"http://localhost:3000/dashboard?session={session_token}")
    
    return session_token

async def main():
    try:
        token = await create_test_profile()
        
        print(f"\n" + "="*60)
        print(f"🎉 SUCCESS! Your test profile is ready!")
        print(f"="*60)
        print(f"\n👤 Profile: Test User (Gemini ♊)")
        print(f"📧 Email: testuser@asign.com")
        print(f"🎯 Looking for: Women (Serious relationship)")
        print(f"\n💡 You'll see 5 potential matches in your feed!")
        print(f"="*60)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
