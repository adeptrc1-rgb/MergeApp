#!/usr/bin/env python3

import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

async def create_more_test_users():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Locations for variety
    locations = [
        {'city': 'New York', 'state': 'NY', 'country': 'USA', 'latitude': 40.7128, 'longitude': -74.0060},
        {'city': 'Los Angeles', 'state': 'CA', 'country': 'USA', 'latitude': 34.0522, 'longitude': -118.2437},
        {'city': 'Chicago', 'state': 'IL', 'country': 'USA', 'latitude': 41.8781, 'longitude': -87.6298},
        {'city': 'Miami', 'state': 'FL', 'country': 'USA', 'latitude': 25.7617, 'longitude': -80.1918},
        {'city': 'San Francisco', 'state': 'CA', 'country': 'USA', 'latitude': 37.7749, 'longitude': -122.4194},
    ]
    
    # Sample photos from Unsplash
    male_photos = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
    ]
    
    female_photos = [
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
    ]
    
    # Comprehensive test users for all zodiac signs
    test_users = [
        {
            "first_name": "Olivia",
            "last_name": "Martinez",
            "email": f"olivia.pisces{random.randint(1000,9999)}@example.com",
            "birth_date": "1995-03-15",
            "zodiac_sign": "Pisces",
            "photos": random.sample(female_photos, 3),
        },
        {
            "first_name": "Sophia",
            "last_name": "Anderson",
            "email": f"sophia.taurus{random.randint(1000,9999)}@example.com",
            "birth_date": "1994-05-08",
            "zodiac_sign": "Taurus",
            "photos": random.sample(female_photos, 3),
        },
        {
            "first_name": "Emma",
            "last_name": "Wilson",
            "email": f"emma.cancer{random.randint(1000,9999)}@example.com",
            "birth_date": "1996-07-12",
            "zodiac_sign": "Cancer",
            "photos": random.sample(female_photos, 3),
        },
        {
            "first_name": "Ava",
            "last_name": "Taylor",
            "email": f"ava.virgo{random.randint(1000,9999)}@example.com",
            "birth_date": "1993-09-18",
            "zodiac_sign": "Virgo",
            "photos": random.sample(female_photos, 3),
        },
        {
            "first_name": "Isabella",
            "last_name": "Brown",
            "email": f"isabella.scorpio{random.randint(1000,9999)}@example.com",
            "birth_date": "1997-11-03",
            "zodiac_sign": "Scorpio",
            "photos": random.sample(female_photos, 3),
        },
        {
            "first_name": "Mia",
            "last_name": "Davis",
            "email": f"mia.capricorn{random.randint(1000,9999)}@example.com",
            "birth_date": "1995-01-20",
            "zodiac_sign": "Capricorn",
            "photos": random.sample(female_photos, 3),
        },
        {
            "first_name": "Liam",
            "last_name": "Johnson",
            "email": f"liam.aries{random.randint(1000,9999)}@example.com",
            "birth_date": "1992-04-10",
            "zodiac_sign": "Aries",
            "photos": random.sample(male_photos, 3),
        },
        {
            "first_name": "Noah",
            "last_name": "Williams",
            "email": f"noah.gemini{random.randint(1000,9999)}@example.com",
            "birth_date": "1994-06-21",
            "zodiac_sign": "Gemini",
            "photos": random.sample(male_photos, 3),
        },
        {
            "first_name": "Ethan",
            "last_name": "Miller",
            "email": f"ethan.leo{random.randint(1000,9999)}@example.com",
            "birth_date": "1993-08-05",
            "zodiac_sign": "Leo",
            "photos": random.sample(male_photos, 3),
        },
        {
            "first_name": "Mason",
            "last_name": "Garcia",
            "email": f"mason.libra{random.randint(1000,9999)}@example.com",
            "birth_date": "1996-10-15",
            "zodiac_sign": "Libra",
            "photos": random.sample(male_photos, 3),
        },
        {
            "first_name": "James",
            "last_name": "Rodriguez",
            "email": f"james.sagittarius{random.randint(1000,9999)}@example.com",
            "birth_date": "1995-12-10",
            "zodiac_sign": "Sagittarius",
            "photos": random.sample(male_photos, 3),
        },
        {
            "first_name": "Oliver",
            "last_name": "Martinez",
            "email": f"oliver.aquarius{random.randint(1000,9999)}@example.com",
            "birth_date": "1994-02-14",
            "zodiac_sign": "Aquarius",
            "photos": random.sample(male_photos, 3),
        },
        # Add more variety
        {
            "first_name": "Charlotte",
            "last_name": "Lee",
            "email": f"charlotte.aries{random.randint(1000,9999)}@example.com",
            "birth_date": "1995-03-25",
            "zodiac_sign": "Aries",
            "photos": random.sample(female_photos, 3),
        },
        {
            "first_name": "Amelia",
            "last_name": "White",
            "email": f"amelia.gemini{random.randint(1000,9999)}@example.com",
            "birth_date": "1996-06-10",
            "zodiac_sign": "Gemini",
            "photos": random.sample(female_photos, 3),
        },
        {
            "first_name": "Harper",
            "last_name": "Clark",
            "email": f"harper.leo{random.randint(1000,9999)}@example.com",
            "birth_date": "1994-07-28",
            "zodiac_sign": "Leo",
            "photos": random.sample(female_photos, 3),
        },
    ]
    
    # Insert test users with complete profiles
    try:
        created_count = 0
        for user_data in test_users:
            existing = await db.users.find_one({"email": user_data["email"]})
            if not existing:
                # Create complete user profile
                user = {
                    "id": str(uuid.uuid4()),
                    "email": user_data["email"],
                    "first_name": user_data["first_name"],
                    "last_name": user_data["last_name"],
                    "birth_date": user_data["birth_date"],
                    "zodiac_sign": user_data["zodiac_sign"],
                    "photos": user_data["photos"],
                    "current_location": random.choice(locations),
                    "gender_identity": random.choice(["Man", "Woman"]),
                    "open_to_dating": random.sample(["Men", "Women"], k=random.randint(1,2)),
                    "relationship_goals": random.choice(["serious", "casual", "friends", "open"]),
                    "lifestyle_sliders": {
                        "fitness_health": random.randint(1, 5),
                        "career_ambition": random.randint(1, 5),
                        "social_energy": random.randint(1, 5),
                        "travel_adventure": random.randint(1, 5),
                        "nightlife_lifestyle": random.randint(1, 5),
                        "family_future": random.randint(1, 5),
                        "dating_approach": random.randint(1, 5),
                        "passions_hobbies": random.randint(1, 5),
                    },
                    "profile_boosts": 0,
                    "super_likes": 0,
                    "direct_messages": 0,
                    "created_at": datetime.now(timezone.utc),
                    "is_active": True,
                    "last_active": datetime.now(timezone.utc),
                }
                
                await db.users.insert_one(user)
                created_count += 1
                print(f"✅ Created: {user['first_name']} {user['last_name']} ({user['zodiac_sign']})")
            else:
                print(f"⚠️  User {user_data['first_name']} already exists")
        
        print(f"\n✅ Created {created_count} new test users!")
        print(f"📊 Total users in database: {await db.users.count_documents({})}")
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_more_test_users())
