#!/usr/bin/env python3

import asyncio
import os
from datetime import datetime, timezone, date
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

async def create_test_data():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Test users with different zodiac signs
    test_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "aries.test@example.com",
            "name": "Alex Aries",
            "birth_date": "1995-04-01",  # Aries
            "zodiac_sign": "aries",
            "bio": "Adventurous fire sign who loves spontaneous trips and new experiences!",
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "last_active": datetime.now(timezone.utc),
            "picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
        },
        {
            "id": str(uuid.uuid4()),
            "email": "leo.test@example.com", 
            "name": "Luna Leo",
            "birth_date": "1993-08-10",  # Leo
            "zodiac_sign": "leo",
            "bio": "Creative Leo who loves art, theater, and making people laugh. Looking for someone who appreciates the dramatic side of life!",
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "last_active": datetime.now(timezone.utc),
            "picture": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
        },
        {
            "id": str(uuid.uuid4()),
            "email": "sagittarius.test@example.com",
            "name": "Sam Sagittarius", 
            "birth_date": "1992-12-05",  # Sagittarius
            "zodiac_sign": "sagittarius",
            "bio": "Wanderlust-filled Sagittarius seeking a travel companion and deep conversations under the stars.",
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "last_active": datetime.now(timezone.utc),
            "picture": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
        },
        {
            "id": str(uuid.uuid4()),
            "email": "gemini.test@example.com",
            "name": "Gina Gemini",
            "birth_date": "1996-06-15",  # Gemini
            "zodiac_sign": "gemini",
            "bio": "Curious Gemini who loves learning new things, witty conversations, and intellectual debates!",
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "last_active": datetime.now(timezone.utc),
            "picture": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
        },
        {
            "id": str(uuid.uuid4()),
            "email": "libra.test@example.com",
            "name": "Liam Libra",
            "birth_date": "1994-10-10",  # Libra
            "zodiac_sign": "libra",
            "bio": "Balanced Libra who appreciates beauty, harmony, and meaningful relationships. Let's find our perfect equilibrium!",
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "last_active": datetime.now(timezone.utc),
            "picture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face"
        }
    ]
    
    # Insert test users
    try:
        for user in test_users:
            existing = await db.users.find_one({"email": user["email"]})
            if not existing:
                await db.users.insert_one(user)
                print(f"✅ Created test user: {user['name']} ({user['zodiac_sign']})")
            else:
                print(f"⚠️  User {user['name']} already exists")
        
        print(f"\n✅ Test data creation completed!")
        print(f"📊 Total users in database: {await db.users.count_documents({})}")
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_test_data())