#!/usr/bin/env python3
"""
Reset Cosmic Wheel cooldown for testing purposes
This script allows immediate testing of the Cosmic Wheel functionality
"""

import asyncio
import os
import sys
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

async def reset_cosmic_wheel_cooldown():
    """Reset cosmic wheel cooldown for all test users"""
    
    # Get MongoDB connection
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.astrology_dating
    
    try:
        # Update all users to reset their cosmic wheel cooldown
        result = await db.users.update_many(
            {},  # Update all users
            {
                "$unset": {
                    "next_spin_time": "",  # Remove cooldown
                },
                "$set": {
                    "spins_today": 0,  # Reset daily spin count
                    "spin_reset_date": datetime.now(timezone.utc).date().isoformat(),
                    "spin_streak": 0  # Reset streak for fresh testing
                }
            }
        )
        
        print(f"✅ Successfully reset cosmic wheel cooldown for {result.modified_count} users")
        print("🎡 All users can now spin the Cosmic Wheel immediately!")
        
        # Show current user status
        users = await db.users.find({}).to_list(length=None)
        print(f"\n📊 Current user status:")
        for user in users:
            name = user.get('name', 'Unknown')
            spins_today = user.get('spins_today', 0)
            is_premium = user.get('is_premium', False)
            max_spins = 3 if is_premium else 1
            print(f"   • {name}: {spins_today}/{max_spins} spins used today {'(Premium)' if is_premium else '(Free)'}")
        
    except Exception as e:
        print(f"❌ Error resetting cosmic wheel cooldown: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(reset_cosmic_wheel_cooldown())