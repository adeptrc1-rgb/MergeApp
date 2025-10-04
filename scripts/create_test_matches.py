#!/usr/bin/env python3
"""
Create test users with complete profiles for matchmaking demo
"""
import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date, timezone, timedelta
import asyncio
import uuid
from typing import Dict, Any

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.astrology_dating_db

# Sample base64 image placeholder (small 1x1 pixel)
PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

TEST_USERS = [
    {
        "email": "sarah.johnson@test.com",
        "name": "Sarah Johnson",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "birth_date": "1995-03-15",
        "zodiac_sign": "Pisces",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Marketing",
        "bio": "Adventure seeker, yoga enthusiast, and coffee connoisseur. Love traveling to new places and trying new restaurants. Looking for someone who can keep up with my energy!",
        "interests": ["Yoga", "Travel", "Photography", "Cooking"],
        "relationship_goals": "serious",
        "lifestyle_sliders": {
            "fitness_health": 5,
            "career_ambition": 4,
            "social_energy": 5,
            "travel_adventure": 5,
            "nightlife_lifestyle": 3,
            "family_future": 4,
            "dating_approach": 3,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437},
        "age_range_min": 25,
        "age_range_max": 38,
        "max_distance_km": 80
    },
    {
        "email": "emma.davis@test.com",
        "name": "Emma Davis",
        "first_name": "Emma",
        "last_name": "Davis",
        "birth_date": "1997-07-22",
        "zodiac_sign": "Cancer",
        "gender_identity": "woman",
        "open_to_dating": ["men", "women"],
        "industry": "Creative/Arts",
        "bio": "Artist and dreamer. I paint, design, and create. Looking for someone who appreciates art and deep conversations under the stars.",
        "interests": ["Painting", "Music", "Museums", "Reading"],
        "relationship_goals": "open",
        "lifestyle_sliders": {
            "fitness_health": 3,
            "career_ambition": 4,
            "social_energy": 3,
            "travel_adventure": 4,
            "nightlife_lifestyle": 2,
            "family_future": 3,
            "dating_approach": 2,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437},
        "age_range_min": 23,
        "age_range_max": 35,
        "max_distance_km": 80
    },
    {
        "email": "olivia.martinez@test.com",
        "name": "Olivia Martinez",
        "first_name": "Olivia",
        "last_name": "Martinez",
        "birth_date": "1994-11-08",
        "zodiac_sign": "Scorpio",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Healthcare",
        "bio": "Nurse with a heart of gold. I love helping others and making a difference. In my free time, I enjoy hiking and spending time with my dog.",
        "interests": ["Hiking", "Dogs", "Meditation", "Cooking"],
        "relationship_goals": "serious",
        "lifestyle_sliders": {
            "fitness_health": 4,
            "career_ambition": 4,
            "social_energy": 3,
            "travel_adventure": 4,
            "nightlife_lifestyle": 2,
            "family_future": 5,
            "dating_approach": 3,
            "passions_hobbies": 4
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437},
        "age_range_min": 26,
        "age_range_max": 40,
        "max_distance_km": 80
    },
    {
        "email": "sophia.chen@test.com",
        "name": "Sophia Chen",
        "first_name": "Sophia",
        "last_name": "Chen",
        "birth_date": "1996-05-30",
        "zodiac_sign": "Gemini",
        "gender_identity": "woman",
        "open_to_dating": ["men", "women"],
        "industry": "Technology",
        "bio": "Software engineer by day, gamer by night. Love building things and solving problems. Looking for someone smart and funny!",
        "interests": ["Gaming", "Coding", "Anime", "Board Games"],
        "relationship_goals": "casual",
        "lifestyle_sliders": {
            "fitness_health": 3,
            "career_ambition": 5,
            "social_energy": 4,
            "travel_adventure": 3,
            "nightlife_lifestyle": 3,
            "family_future": 2,
            "dating_approach": 4,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437},
        "age_range_min": 24,
        "age_range_max": 35,
        "max_distance_km": 80
    },
    {
        "email": "mia.rodriguez@test.com",
        "name": "Mia Rodriguez",
        "first_name": "Mia",
        "last_name": "Rodriguez",
        "birth_date": "1998-09-14",
        "zodiac_sign": "Virgo",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Education",
        "bio": "Teacher passionate about making a difference in kids' lives. Love reading, trying new recipes, and weekend road trips.",
        "interests": ["Reading", "Cooking", "Road Trips", "Photography"],
        "relationship_goals": "serious",
        "lifestyle_sliders": {
            "fitness_health": 4,
            "career_ambition": 3,
            "social_energy": 4,
            "travel_adventure": 4,
            "nightlife_lifestyle": 2,
            "family_future": 5,
            "dating_approach": 2,
            "passions_hobbies": 4
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437},
        "age_range_min": 24,
        "age_range_max": 35,
        "max_distance_km": 80
    }
]

async def create_test_users():
    """Create test users in the database"""
    print("🚀 Creating test users...")
    
    created_users = []
    
    for user_data in TEST_USERS:
        # Check if user already exists
        existing = await db.users.find_one({"email": user_data["email"]})
        if existing:
            print(f"✓ User {user_data['name']} already exists")
            created_users.append(existing)
            continue
        
        # Create user document
        user_id = str(uuid.uuid4())
        birth_date = datetime.strptime(user_data["birth_date"], "%Y-%m-%d").date()
        
        user = {
            "id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "first_name": user_data["first_name"],
            "last_name": user_data["last_name"],
            "picture": None,
            "birth_date": user_data["birth_date"],
            "birth_time": "12:00",
            "birth_location": user_data["current_location"],
            "hometown": user_data["current_location"],
            "current_location": user_data["current_location"],
            "zodiac_sign": user_data["zodiac_sign"],
            "gender_identity": user_data["gender_identity"],
            "gender_self_describe": None,
            "open_to_dating": user_data["open_to_dating"],
            "orientation_visible": True,
            "lifestyle_sliders": user_data["lifestyle_sliders"],
            "industry": user_data["industry"],
            "interests": user_data["interests"],
            "relationship_goals": user_data["relationship_goals"],
            "profile_photos": {
                "face_photo": PLACEHOLDER_IMAGE,
                "body_photo": PLACEHOLDER_IMAGE,
                "lifestyle_photo": PLACEHOLDER_IMAGE
            },
            "bio": user_data["bio"],
            "age_range_min": user_data["age_range_min"],
            "age_range_max": user_data["age_range_max"],
            "max_distance_km": user_data["max_distance_km"],
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "last_active": datetime.now(timezone.utc),
            "response_score": 100.0,
            "total_matches": 0,
            "responded_matches": 0,
            "avg_response_time": None,
            "profile_completed": True,
            "needs_onboarding": False
        }
        
        await db.users.insert_one(user)
        created_users.append(user)
        print(f"✓ Created user: {user_data['name']} ({user_data['zodiac_sign']})")
    
    print(f"\n✅ Created {len(created_users)} test users!\n")
    return created_users

async def main():
    """Main function"""
    try:
        users = await create_test_users()
        
        print("📊 Test Users Summary:")
        print("-" * 60)
        for user in users:
            print(f"👤 {user['name']} - {user['zodiac_sign']} - {user['email']}")
        print("-" * 60)
        
        print("\n✨ All done! Test users are ready for matchmaking!")
        print("\n💡 When you log in, you'll see these profiles in your match feed.")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
