import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import uuid

load_dotenv('/app/backend/.env')

MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'astrology_dating_db')

async def create_trending_users():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    trending_users = [
        {
            "id": str(uuid.uuid4()),
            "email": f"trending_user_{i}@test.com",
            "first_name": f"TrendingStar{i}",
            "last_name": "Active",
            "zodiac_sign": ["Aries", "Leo", "Sagittarius", "Gemini", "Aquarius", "Libra"][i % 6],
            "photos": ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"],
            "bio": f"Active and responsive user #{i}",
            "interests": ["music", "travel", "fitness", "coffee"],
            "profile_completed": True,
            "responsiveness_score": 85.0 + (i * 2),  # 85-95%
            "low_ghosting_rate": 80.0 + (i * 3),  # 80-95%
            "likes_received_30d": 20 + (i * 5),
            "matches_created_30d": 10 + i,
            "message_replies_30d": 15 + (i * 2),
            "trust_score": 85.0 + i,
            "last_active_days": 0,
            "profile_completeness": 90.0 + i,
            "star_coins": 1000,
            "is_premium": False
        }
        for i in range(10)
    ]
    
    for user in trending_users:
        existing = await db.users.find_one({"email": user["email"]})
        if existing:
            await db.users.update_one({"email": user["email"]}, {"$set": user})
            print(f"Updated: {user['first_name']}")
        else:
            await db.users.insert_one(user)
            print(f"Created: {user['first_name']}")
    
    print("\n✅ Created 10 trending users with high engagement!")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_trending_users())
