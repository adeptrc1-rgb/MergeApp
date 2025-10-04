#!/usr/bin/env python3
"""
Create more diverse test users for matchmaking
"""
import sys
import os
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date, timezone, timedelta
import asyncio
import uuid

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.astrology_dating_db

# Placeholder image
PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

MORE_TEST_USERS = [
    {
        "email": "jessica.williams@test.com",
        "name": "Jessica Williams",
        "first_name": "Jessica",
        "last_name": "Williams",
        "birth_date": "1993-01-20",
        "zodiac_sign": "Aquarius",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Technology",
        "bio": "Tech startup founder. Love coding, hiking, and trying new coffee shops. Looking for someone ambitious who can keep up with my energy!",
        "interests": ["Coding", "Startups", "Hiking", "Coffee"],
        "relationship_goals": "casual",
        "lifestyle_sliders": {
            "fitness_health": 4,
            "career_ambition": 5,
            "social_energy": 4,
            "travel_adventure": 5,
            "nightlife_lifestyle": 3,
            "family_future": 2,
            "dating_approach": 4,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "ashley.thompson@test.com",
        "name": "Ashley Thompson",
        "first_name": "Ashley",
        "last_name": "Thompson",
        "birth_date": "1996-04-15",
        "zodiac_sign": "Aries",
        "gender_identity": "woman",
        "open_to_dating": ["men", "women"],
        "industry": "Finance",
        "bio": "Investment banker with a love for adventure sports. Weekends you'll find me rock climbing or skydiving. Seeking someone who's not afraid to take risks!",
        "interests": ["Rock Climbing", "Skydiving", "Investing", "Wine Tasting"],
        "relationship_goals": "serious",
        "lifestyle_sliders": {
            "fitness_health": 5,
            "career_ambition": 5,
            "social_energy": 4,
            "travel_adventure": 5,
            "nightlife_lifestyle": 4,
            "family_future": 3,
            "dating_approach": 4,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "rachel.green@test.com",
        "name": "Rachel Green",
        "first_name": "Rachel",
        "last_name": "Green",
        "birth_date": "1995-05-05",
        "zodiac_sign": "Taurus",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Creative/Arts",
        "bio": "Fashion designer and yoga instructor. I believe in living mindfully and sustainably. Looking for a genuine connection with someone who values authenticity.",
        "interests": ["Fashion Design", "Yoga", "Sustainability", "Meditation"],
        "relationship_goals": "serious",
        "lifestyle_sliders": {
            "fitness_health": 5,
            "career_ambition": 3,
            "social_energy": 3,
            "travel_adventure": 4,
            "nightlife_lifestyle": 2,
            "family_future": 4,
            "dating_approach": 2,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "amanda.clarke@test.com",
        "name": "Amanda Clarke",
        "first_name": "Amanda",
        "last_name": "Clarke",
        "birth_date": "1997-08-18",
        "zodiac_sign": "Leo",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Marketing",
        "bio": "Social media manager who loves creating content. Obsessed with brunch, beaches, and my dog Max. Let's grab tacos and see where it goes!",
        "interests": ["Social Media", "Photography", "Brunch", "Dogs"],
        "relationship_goals": "open",
        "lifestyle_sliders": {
            "fitness_health": 3,
            "career_ambition": 4,
            "social_energy": 5,
            "travel_adventure": 4,
            "nightlife_lifestyle": 4,
            "family_future": 3,
            "dating_approach": 3,
            "passions_hobbies": 4
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "lauren.hill@test.com",
        "name": "Lauren Hill",
        "first_name": "Lauren",
        "last_name": "Hill",
        "birth_date": "1994-09-23",
        "zodiac_sign": "Libra",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Healthcare",
        "bio": "Doctor with a heart for helping others. Love traveling to new places, trying new cuisines, and a good book. Looking for someone kind and thoughtful.",
        "interests": ["Medicine", "Travel", "Food", "Reading"],
        "relationship_goals": "serious",
        "lifestyle_sliders": {
            "fitness_health": 4,
            "career_ambition": 5,
            "social_energy": 3,
            "travel_adventure": 5,
            "nightlife_lifestyle": 2,
            "family_future": 5,
            "dating_approach": 2,
            "passions_hobbies": 4
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "natalie.brooks@test.com",
        "name": "Natalie Brooks",
        "first_name": "Natalie",
        "last_name": "Brooks",
        "birth_date": "1996-12-10",
        "zodiac_sign": "Sagittarius",
        "gender_identity": "woman",
        "open_to_dating": ["men", "women"],
        "industry": "Education",
        "bio": "High school teacher who loves making a difference. Passionate about music, theater, and spontaneous road trips. Let's make some memories!",
        "interests": ["Teaching", "Theater", "Music", "Road Trips"],
        "relationship_goals": "open",
        "lifestyle_sliders": {
            "fitness_health": 3,
            "career_ambition": 3,
            "social_energy": 5,
            "travel_adventure": 5,
            "nightlife_lifestyle": 3,
            "family_future": 4,
            "dating_approach": 3,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "melissa.parker@test.com",
        "name": "Melissa Parker",
        "first_name": "Melissa",
        "last_name": "Parker",
        "birth_date": "1995-10-28",
        "zodiac_sign": "Scorpio",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Legal",
        "bio": "Lawyer by day, fitness enthusiast by night. I love a good debate, working out, and exploring the city. Looking for someone intelligent and driven.",
        "interests": ["Law", "Fitness", "Debate", "City Life"],
        "relationship_goals": "serious",
        "lifestyle_sliders": {
            "fitness_health": 5,
            "career_ambition": 5,
            "social_energy": 4,
            "travel_adventure": 3,
            "nightlife_lifestyle": 3,
            "family_future": 4,
            "dating_approach": 3,
            "passions_hobbies": 4
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "victoria.adams@test.com",
        "name": "Victoria Adams",
        "first_name": "Victoria",
        "last_name": "Adams",
        "birth_date": "1993-02-14",
        "zodiac_sign": "Aquarius",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Consulting",
        "bio": "Management consultant who travels for work. Love trying new restaurants, wine bars, and live music. Looking for someone who enjoys the finer things in life.",
        "interests": ["Consulting", "Wine", "Live Music", "Fine Dining"],
        "relationship_goals": "serious",
        "lifestyle_sliders": {
            "fitness_health": 3,
            "career_ambition": 5,
            "social_energy": 4,
            "travel_adventure": 5,
            "nightlife_lifestyle": 4,
            "family_future": 3,
            "dating_approach": 3,
            "passions_hobbies": 4
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "hannah.lee@test.com",
        "name": "Hannah Lee",
        "first_name": "Hannah",
        "last_name": "Lee",
        "birth_date": "1998-06-30",
        "zodiac_sign": "Cancer",
        "gender_identity": "woman",
        "open_to_dating": ["men"],
        "industry": "Student",
        "bio": "Grad student studying environmental science. Passionate about sustainability, nature, and making the world a better place. Let's go on a hike!",
        "interests": ["Environment", "Hiking", "Science", "Volunteering"],
        "relationship_goals": "casual",
        "lifestyle_sliders": {
            "fitness_health": 4,
            "career_ambition": 4,
            "social_energy": 3,
            "travel_adventure": 5,
            "nightlife_lifestyle": 2,
            "family_future": 3,
            "dating_approach": 2,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    },
    {
        "email": "julia.morgan@test.com",
        "name": "Julia Morgan",
        "first_name": "Julia",
        "last_name": "Morgan",
        "birth_date": "1994-07-25",
        "zodiac_sign": "Leo",
        "gender_identity": "woman",
        "open_to_dating": ["men", "women"],
        "industry": "Creative/Arts",
        "bio": "Photographer and videographer capturing life's beautiful moments. Love art galleries, indie films, and deep conversations. Looking for a creative soul.",
        "interests": ["Photography", "Film", "Art", "Coffee"],
        "relationship_goals": "open",
        "lifestyle_sliders": {
            "fitness_health": 3,
            "career_ambition": 4,
            "social_energy": 4,
            "travel_adventure": 5,
            "nightlife_lifestyle": 3,
            "family_future": 2,
            "dating_approach": 3,
            "passions_hobbies": 5
        },
        "current_location": {"city": "Los Angeles", "country": "United States", "latitude": 34.0522, "longitude": -118.2437}
    }
]

async def create_more_users():
    """Create more test users in the database"""
    print("🚀 Creating more diverse profiles...")
    
    created_count = 0
    
    for user_data in MORE_TEST_USERS:
        # Check if user already exists
        existing = await db.users.find_one({"email": user_data["email"]})
        if existing:
            print(f"✓ User {user_data['name']} already exists")
            continue
        
        # Create user document
        user_id = str(uuid.uuid4())
        
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
            "age_range_min": 21,
            "age_range_max": 40,
            "max_distance_km": 80,
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
        created_count += 1
        print(f"✓ Created user: {user_data['name']} ({user_data['zodiac_sign']})")
    
    print(f"\n✅ Created {created_count} new profiles!\n")
    
    # Show total count
    total = await db.users.count_documents({"email": {"$ne": "testuser@asign.com"}})
    print(f"📊 Total potential matches: {total}")

async def main():
    """Main function"""
    try:
        await create_more_users()
        
        print("\n✨ All done! You now have TONS of profiles to swipe through!")
        print("\n💡 Click Test Login to start swiping!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
