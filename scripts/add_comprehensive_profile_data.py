#!/usr/bin/env python3
"""
Add comprehensive profile data including bio, interests, relationship goals, lifestyle, and multiple photos
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import random

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "astrology_dating_db")

# Sample data
SAMPLE_BIOS = [
    "Adventure seeker with a passion for life. Love exploring new places and meeting interesting people. Always up for spontaneous trips! ✈️✨",
    "Coffee enthusiast, bookworm, and stargazer. Looking for someone to share meaningful conversations with over a good latte. 📚☕",
    "Fitness lover and foodie. Believer in living life to the fullest. Let's make memories together while trying new restaurants! 💪🍕",
    "Creative soul who loves art, music, and spontaneous adventures. Life's too short for boring moments. Let's paint the town! 🎨🎵",
    "Yoga instructor by day, Netflix binger by night. Looking for someone who can balance both worlds with me. 🧘‍♀️📺",
    "Tech geek with a love for hiking and nature. Enjoy deep conversations under the stars. Let's connect both online and offline! 💻⛰️",
    "Traveler, dreamer, and hopeless romantic. Searching for my partner in crime for life's greatest adventures. ✈️❤️",
    "Music lover and concert goer. Life is better with a good playlist and great company. What's your favorite band? 🎧🎤",
    "Nature enthusiast who loves camping and outdoor activities. Let's explore the world together, one trail at a time! 🏕️🌲",
    "Foodie, wine lover, and amateur chef. Looking for someone to share culinary adventures with. Dinner at my place? 🍷👨‍🍳"
]

INTERESTS_POOL = [
    "Yoga", "Hiking", "Photography", "Cooking", "Travel", "Music",
    "Art", "Reading", "Gaming", "Sports", "Dancing", "Movies",
    "Theatre", "Foodie", "Wine", "Coffee", "Meditation", "Fitness",
    "Fashion", "Tech", "DIY", "Volunteering", "Pets", "Nature",
    "Concerts", "Museums", "Beach", "Mountains", "Camping", "Surfing"
]

MUSIC_PREFERENCES = [
    "Indie, Alternative Rock, and Chill Vibes",
    "Hip-Hop, R&B, and Soul",
    "Electronic, House, and Techno",
    "Pop, Top 40, and Dance Music",
    "Rock, Classic Rock, and Metal",
    "Jazz, Blues, and Classical",
    "Country, Folk, and Americana",
    "Reggae, Latin, and World Music",
    "Everything from Mozart to Drake",
    "Live music lover - all genres!"
]

RELATIONSHIP_GOALS = [
    "long_term_relationship",
    "casual_dating",
    "friendship_first",
    "not_sure_yet"
]

# Sample placeholder photos (using diverse placeholder images)
PHOTO_SETS = [
    [
        "https://i.pravatar.cc/400?img=1",
        "https://i.pravatar.cc/400?img=2",
        "https://i.pravatar.cc/400?img=3"
    ],
    [
        "https://i.pravatar.cc/400?img=5",
        "https://i.pravatar.cc/400?img=6",
        "https://i.pravatar.cc/400?img=7"
    ],
    [
        "https://i.pravatar.cc/400?img=8",
        "https://i.pravatar.cc/400?img=9",
        "https://i.pravatar.cc/400?img=10"
    ],
    [
        "https://i.pravatar.cc/400?img=11",
        "https://i.pravatar.cc/400?img=12",
        "https://i.pravatar.cc/400?img=13"
    ],
    [
        "https://i.pravatar.cc/400?img=14",
        "https://i.pravatar.cc/400?img=15",
        "https://i.pravatar.cc/400?img=16"
    ]
]

async def add_comprehensive_data():
    """Add comprehensive profile data to all users"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Find all users
        cursor = db.users.find({})
        updated_count = 0
        total_count = 0
        
        async for user in cursor:
            total_count += 1
            print(f"\n📋 Processing user: {user.get('email', user.get('first_name', 'Unknown'))}")
            
            update_data = {}
            
            # Add bio
            update_data["bio"] = random.choice(SAMPLE_BIOS)
            print(f"  ✓ Adding bio")
            
            # Add interests (4-8 random interests)
            num_interests = random.randint(4, 8)
            update_data["interests"] = random.sample(INTERESTS_POOL, num_interests)
            print(f"  ✓ Adding {num_interests} interests")
            
            # Add lifestyle_factors
            update_data["lifestyle_factors"] = {
                "fitness_health": random.randint(2, 5),
                "career_ambition": random.randint(2, 5),
                "social_energy": random.randint(2, 5),
                "travel_adventure": random.randint(2, 5),
                "nightlife_lifestyle": random.randint(1, 4),
                "family_future": random.randint(3, 5),
                "dating_approach": random.randint(2, 4),
                "passions_hobbies": random.randint(3, 5)
            }
            print(f"  ✓ Adding lifestyle factors")
            
            # Add deal_breakers including relationship goals
            if not user.get("deal_breakers"):
                update_data["deal_breakers"] = {}
            else:
                update_data["deal_breakers"] = user.get("deal_breakers", {})
            
            update_data["deal_breakers"]["relationship_goals"] = random.choice(RELATIONSHIP_GOALS)
            print(f"  ✓ Adding relationship goal: {update_data['deal_breakers']['relationship_goals']}")
            
            # Add music preference
            if not user.get("preferences"):
                update_data["preferences"] = {"music": random.choice(MUSIC_PREFERENCES)}
            else:
                update_data["preferences"] = {**user.get("preferences", {}), "music": random.choice(MUSIC_PREFERENCES)}
            print(f"  ✓ Adding music preferences")
            
            # Add multiple photos (2-3 photos per user)
            if not user.get("photos") or len(user.get("photos", [])) < 2:
                photo_set = random.choice(PHOTO_SETS)
                num_photos = random.randint(2, 3)
                update_data["photos"] = photo_set[:num_photos]
                print(f"  ✓ Adding {num_photos} photos")
            
            # Update user
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": update_data}
            )
            updated_count += 1
            print(f"  ✅ Successfully updated!")
        
        print(f"\n🎉 Successfully updated {updated_count}/{total_count} users with comprehensive profile data!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    print("🚀 Adding comprehensive profile data to users...\n")
    asyncio.run(add_comprehensive_data())
