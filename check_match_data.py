#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def check_match_data():
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client.dating_app
    
    # Get first 3 users to check their data
    users = await db.users.find().limit(3).to_list(length=3)
    
    for i, user in enumerate(users, 1):
        print(f"\n{'='*60}")
        print(f"User {i}: {user.get('first_name', 'Unknown')} - {user.get('email')}")
        print(f"{'='*60}")
        print(f"Bio: {user.get('bio', 'NO BIO')}")
        print(f"Interests ({len(user.get('interests', []))}): {user.get('interests', [])}")
        print(f"Lifestyle factors: {user.get('lifestyle_factors', {})}")
        print(f"Deal breakers: {user.get('deal_breakers', {})}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_match_data())
