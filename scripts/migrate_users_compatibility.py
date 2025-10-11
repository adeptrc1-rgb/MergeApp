#!/usr/bin/env python3
"""
Migration script to add deal_breakers and preferences fields to existing users.
Adds default values so existing users can still match with new compatibility algorithm.
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "astrology_dating_db")

async def migrate_users():
    """Add deal_breakers and preferences to all existing users"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Default values for existing users
    default_deal_breakers = {
        "relationship_goals": "figuring_out",
        "has_kids": False,
        "want_kids": "maybe",
        "smoking": "no"
    }
    
    default_preferences = {
        "religion": "not_religious",
        "politics": "moderate",
        "diet": "no_preference",
        "exercise": "occasional"
    }
    
    # Count users that need migration
    users_without_db = await db.users.count_documents({"deal_breakers": {"$exists": False}})
    users_without_prefs = await db.users.count_documents({"preferences": {"$exists": False}})
    
    print(f"Found {users_without_db} users without deal_breakers")
    print(f"Found {users_without_prefs} users without preferences")
    
    if users_without_db == 0 and users_without_prefs == 0:
        print("All users already migrated!")
        return
    
    # Update users without deal_breakers
    if users_without_db > 0:
        result = await db.users.update_many(
            {"deal_breakers": {"$exists": False}},
            {"$set": {"deal_breakers": default_deal_breakers}}
        )
        print(f"✅ Added deal_breakers to {result.modified_count} users")
    
    # Update users without preferences
    if users_without_prefs > 0:
        result = await db.users.update_many(
            {"preferences": {"$exists": False}},
            {"$set": {"preferences": default_preferences}}
        )
        print(f"✅ Added preferences to {result.modified_count} users")
    
    # Add personality_type field if missing (optional)
    users_without_type = await db.users.count_documents({"personality_type": {"$exists": False}})
    if users_without_type > 0:
        result = await db.users.update_many(
            {"personality_type": {"$exists": False}},
            {"$set": {"personality_type": None}}
        )
        print(f"✅ Added personality_type field to {result.modified_count} users")
    
    print("\n✨ Migration complete!")
    
    # Show sample updated user
    sample = await db.users.find_one({})
    if sample:
        print(f"\nSample user fields:")
        print(f"  - deal_breakers: {sample.get('deal_breakers', 'NOT SET')}")
        print(f"  - preferences: {sample.get('preferences', 'NOT SET')}")
        print(f"  - personality_type: {sample.get('personality_type', 'NOT SET')}")
    
    client.close()

if __name__ == "__main__":
    print("🚀 Starting user migration for new compatibility algorithm...")
    asyncio.run(migrate_users())
