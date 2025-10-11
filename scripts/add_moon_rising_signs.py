#!/usr/bin/env python3
"""
Add moon_sign and rising_sign to existing test users for polarity testing.
Creates diverse combinations to test the polarity bonus system.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import random

load_dotenv('/app/backend/.env')

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "astrology_dating_db")

# All zodiac signs
ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

# Polarity pairs for testing
POLAR_PAIRS = {
    "Aries": "Libra", "Taurus": "Scorpio", "Gemini": "Sagittarius",
    "Cancer": "Capricorn", "Leo": "Aquarius", "Virgo": "Pisces",
    "Libra": "Aries", "Scorpio": "Taurus", "Sagittarius": "Gemini",
    "Capricorn": "Cancer", "Aquarius": "Leo", "Pisces": "Virgo"
}


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🌙 Adding Moon and Rising signs to test users...\n")
    
    # Get all users
    users = await db.users.find({}).to_list(length=None)
    
    if not users:
        print("❌ No users found in database")
        return
    
    print(f"Found {len(users)} users\n")
    
    # Create some users with polar pair relationships for testing
    updated_count = 0
    polar_pairs_created = 0
    
    for i, user in enumerate(users):
        sun_sign = user.get("zodiac_sign", "Aries")
        
        # Strategy: Create diverse combinations
        # 25% chance of having polar moon sign (emotional connection)
        # 25% chance of having polar rising sign (first impression connection)
        # 10% chance of having both (jackpot!)
        # Rest get random signs
        
        roll = random.random()
        
        if roll < 0.10:  # 10% - Both moon and rising are polar
            moon_sign = POLAR_PAIRS[sun_sign]
            rising_sign = POLAR_PAIRS[sun_sign]
            combo_type = "🎯 JACKPOT (Both Polar)"
            polar_pairs_created += 2
        elif roll < 0.35:  # 25% - Moon is polar
            moon_sign = POLAR_PAIRS[sun_sign]
            rising_sign = random.choice(ZODIAC_SIGNS)
            combo_type = "🌙 Moon Polar"
            polar_pairs_created += 1
        elif roll < 0.60:  # 25% - Rising is polar
            moon_sign = random.choice(ZODIAC_SIGNS)
            rising_sign = POLAR_PAIRS[sun_sign]
            combo_type = "⬆️  Rising Polar"
            polar_pairs_created += 1
        else:  # 40% - Random
            moon_sign = random.choice(ZODIAC_SIGNS)
            rising_sign = random.choice(ZODIAC_SIGNS)
            combo_type = "🎲 Random"
        
        # Update user
        result = await db.users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "moon_sign": moon_sign,
                    "rising_sign": rising_sign
                }
            }
        )
        
        if result.modified_count > 0:
            updated_count += 1
            print(f"✅ {user.get('first_name', 'User')} ({user['id'][:8]}...)")
            print(f"   ☀️  Sun: {sun_sign}")
            print(f"   🌙 Moon: {moon_sign}")
            print(f"   ⬆️  Rising: {rising_sign}")
            print(f"   Type: {combo_type}\n")
    
    print(f"\n{'='*60}")
    print(f"✅ Updated {updated_count} users")
    print(f"🎯 Created {polar_pairs_created} polar pair relationships")
    print(f"{'='*60}\n")
    
    # Show some example polarity matches
    print("🔍 Example Polarity Matches:\n")
    
    # Find a user with Aries sun
    aries_user = await db.users.find_one({"zodiac_sign": "Aries"})
    if aries_user:
        print(f"Example User: {aries_user.get('first_name')} (Aries Sun)")
        print(f"  🌙 Moon: {aries_user.get('moon_sign')}")
        print(f"  ⬆️  Rising: {aries_user.get('rising_sign')}\n")
        
        # Find potential polar matches
        libra_users = await db.users.find({"zodiac_sign": "Libra"}).to_list(length=3)
        
        if libra_users:
            print("Potential Libra (Polar) Matches:")
            for libra in libra_users:
                print(f"\n  👤 {libra.get('first_name')} (Libra Sun)")
                print(f"     🌙 Moon: {libra.get('moon_sign')}")
                print(f"     ⬆️  Rising: {libra.get('rising_sign')}")
                
                # Calculate potential bonuses
                bonuses = []
                if POLAR_PAIRS.get(aries_user['zodiac_sign']) == libra['zodiac_sign']:
                    bonuses.append("☀️  Sun polarity")
                if POLAR_PAIRS.get(aries_user.get('moon_sign')) == libra.get('moon_sign'):
                    bonuses.append("🌙 Moon polarity")
                if POLAR_PAIRS.get(aries_user.get('rising_sign')) == libra.get('rising_sign'):
                    bonuses.append("⬆️  Rising polarity")
                
                if bonuses:
                    print(f"     ⚡ Bonuses: {', '.join(bonuses)}")
                else:
                    print(f"     ⚡ Bonuses: None")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
