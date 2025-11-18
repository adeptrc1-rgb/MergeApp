#!/usr/bin/env python3
"""
Test trending energies endpoint with sample data to verify algorithm
"""
import asyncio
import requests
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
import uuid

load_dotenv('backend/.env')
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'astrology_dating_db')
BASE_URL = "https://datemerge.preview.emergentagent.com"

def now_utc():
    return datetime.now(timezone.utc)

async def create_high_engagement_user(db):
    """Create a user with high engagement to test the algorithm"""
    user_id = str(uuid.uuid4())
    now = now_utc()
    thirty_days_ago = now - timedelta(days=30)
    
    # Create user with complete profile
    user_doc = {
        "id": user_id,
        "email": f"trending_test_{user_id[:8]}@test.com",
        "first_name": "TrendingStar",
        "last_name": "User",
        "zodiac_sign": "Leo",
        "birth_date": "1995-08-15",
        "photos": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
        "bio": "I'm a trending user with high engagement!",
        "interests": ["astrology", "dating", "cosmic energy"],
        "profile_completed": True,
        "trust_score": 95.0,
        "behavior_quality_30d": 95.0,
        "responsiveness_score": 100.0,
        "last_spin_date": now.isoformat(),
        "created_at": now.isoformat()
    }
    
    await db.users.insert_one(user_doc)
    print(f"✅ Created trending user: {user_doc['email']}")
    
    # Create likes received (high engagement)
    for i in range(25):  # 25 likes received in last 30 days
        like_doc = {
            "liker_id": str(uuid.uuid4()),
            "target_id": user_id,
            "created_at": (now - timedelta(days=i)).isoformat()
        }
        await db.likes.insert_one(like_doc)
    
    # Create matches (high engagement)
    for i in range(10):  # 10 matches in last 30 days
        match_doc = {
            "id": str(uuid.uuid4()),
            "user1_id": user_id,
            "user2_id": str(uuid.uuid4()),
            "matched_at": (now - timedelta(days=i*2)).isoformat(),
            "compatibility_score": 90.0 + (i % 5)  # High compatibility scores
        }
        await db.matches.insert_one(match_doc)
    
    # Create reply events (high engagement)
    for i in range(15):  # 15 replies in last 30 days
        reply_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "conversation_id": str(uuid.uuid4()),
            "delivered_at": (now - timedelta(days=i*2)).isoformat(),
            "replied_at": (now - timedelta(days=i*2, hours=1)).isoformat(),
            "reply_seconds": 3600.0,  # 1 hour response time
            "created_at": (now - timedelta(days=i*2)).isoformat()
        }
        await db.reply_events.insert_one(reply_doc)
    
    print(f"✅ Added engagement data: 25 likes, 10 matches, 15 replies")
    return user_id

async def test_trending_energies_with_data():
    """Test the trending energies endpoint with high-engagement sample data"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🚀 Testing Trending Energies with Sample Data")
    print("=" * 60)
    
    # Create a high-engagement user
    trending_user_id = await create_high_engagement_user(db)
    
    # Test the API endpoint
    print("\n🔐 Step 1: Login to get session cookies")
    login_url = f"{BASE_URL}/api/auth/test-login"
    login_data = {"email": "testuser@asign.com"}
    
    login_response = requests.post(login_url, json=login_data, timeout=10)
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return
    
    session_cookies = login_response.cookies
    print("✅ Login successful, cookies captured")
    
    # Test trending energies endpoint
    print("\n🌟 Step 2: Test trending energies endpoint")
    trending_url = f"{BASE_URL}/api/users/trending-energies"
    
    trending_response = requests.get(trending_url, cookies=session_cookies, timeout=10)
    print(f"Status: {trending_response.status_code}")
    
    if trending_response.status_code == 200:
        trending_data = trending_response.json()
        print(f"✅ Response received: {len(trending_data)} trending users")
        
        if len(trending_data) > 0:
            print("\n📊 Trending Users:")
            for i, user in enumerate(trending_data[:5]):  # Show first 5
                score = user.get("trending_energy_score", 0)
                name = user.get("first_name", "Unknown")
                print(f"  {i+1}. {name}: {score} (ID: {user.get('id', 'no-id')[:8]}...)")
                
                # Check if our test user is in the results
                if user.get("id") == trending_user_id:
                    print(f"     🎯 Found our test user with score {score}!")
            
            # Verify algorithm requirements
            print("\n🔍 Algorithm Verification:")
            
            # Check all users have trending_energy_score >= 60
            all_above_threshold = all(user.get("trending_energy_score", 0) >= 60 for user in trending_data)
            print(f"✅ All users >= 60 threshold: {all_above_threshold}")
            
            # Check sorting (descending)
            scores = [user.get("trending_energy_score", 0) for user in trending_data]
            is_sorted = scores == sorted(scores, reverse=True)
            print(f"✅ Users sorted by score (desc): {is_sorted}")
            
            # Check required fields
            required_fields = ["id", "first_name", "trending_energy_score"]
            all_have_fields = all(
                all(field in user for field in required_fields) 
                for user in trending_data
            )
            print(f"✅ All users have required fields: {all_have_fields}")
            
            if all_above_threshold and is_sorted and all_have_fields:
                print("\n🎉 TRENDING ENERGIES ALGORITHM: WORKING CORRECTLY!")
            else:
                print("\n❌ TRENDING ENERGIES ALGORITHM: ISSUES FOUND")
        else:
            print("⚠️  No trending users returned (still below threshold)")
    else:
        print(f"❌ API call failed: {trending_response.status_code}")
        print(f"Response: {trending_response.text}")
    
    # Cleanup - remove test data
    print(f"\n🧹 Cleaning up test data...")
    await db.users.delete_one({"id": trending_user_id})
    await db.likes.delete_many({"target_id": trending_user_id})
    await db.matches.delete_many({"user1_id": trending_user_id})
    await db.reply_events.delete_many({"user_id": trending_user_id})
    print("✅ Test data cleaned up")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_trending_energies_with_data())