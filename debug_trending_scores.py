#!/usr/bin/env python3
"""
Debug script to check trending energy scores calculation
"""
import asyncio
import requests
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

load_dotenv('backend/.env')
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'astrology_dating_db')

def now_utc():
    return datetime.now(timezone.utc)

async def calculate_trending_energy_score(user_id: str, user_doc: dict, db) -> float:
    """
    Calculate Trending Energy Score (0-100) based on:
    - Engagement (35%): likes received, matches, message responses, profile saves
    - Compatibility Resonance (25%): average compatibility of recent matches
    - Behavior & Trust (25%): responsiveness, low ghost rate, trust score
    - Recency & Activity (15%): logged in recently, updated profile
    """
    now = now_utc()
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)
    
    print(f"  Calculating for user {user_id} ({user_doc.get('email', 'no-email')})")
    
    # === ENGAGEMENT SCORE (35%) ===
    # Count likes received in last 30 days
    likes_received = await db.likes.count_documents({
        "target_id": user_id,
        "created_at": {"$gte": thirty_days_ago.isoformat()}
    })
    
    # Count matches in last 30 days
    matches_count = await db.matches.count_documents({
        "$or": [{"user1_id": user_id}, {"user2_id": user_id}],
        "matched_at": {"$gte": thirty_days_ago.isoformat()}
    })
    
    # Count message responses (replied events)
    replies_count = await db.reply_events.count_documents({
        "replier_id": user_id,
        "replied_at": {"$gte": thirty_days_ago.isoformat()}
    })
    
    # Normalize engagement metrics (0-100)
    engagement_score = min(100, (
        (min(likes_received, 50) / 50 * 40) +  # likes: 0-40 points
        (min(matches_count, 20) / 20 * 35) +   # matches: 0-35 points
        (min(replies_count, 30) / 30 * 25)     # replies: 0-25 points
    ))
    
    print(f"    Engagement: likes={likes_received}, matches={matches_count}, replies={replies_count} -> {engagement_score:.1f}")
    
    # === COMPATIBILITY RESONANCE (25%) ===
    # Get average compatibility score of recent matches
    pipeline = [
        {
            "$match": {
                "$or": [{"user1_id": user_id}, {"user2_id": user_id}],
                "matched_at": {"$gte": thirty_days_ago.isoformat()}
            }
        },
        {
            "$group": {
                "_id": None,
                "avg_compatibility": {"$avg": "$compatibility_score"}
            }
        }
    ]
    
    compat_result = await db.matches.aggregate(pipeline).to_list(1)
    avg_compatibility = compat_result[0]["avg_compatibility"] if compat_result else 75.0
    compatibility_score = min(100, avg_compatibility * 1.1)  # Boost slightly, cap at 100
    
    print(f"    Compatibility: avg={avg_compatibility:.1f} -> {compatibility_score:.1f}")
    
    # === BEHAVIOR & TRUST (25%) ===
    # Use existing trust score and behavior metrics from user doc
    trust_score = user_doc.get("trust_score", 70.0)
    behavior_quality = user_doc.get("behavior_quality_30d", 80.0)
    responsiveness = user_doc.get("responsiveness_score", 100.0)
    
    behavior_score = (trust_score * 0.5 + behavior_quality * 0.3 + responsiveness * 0.2)
    
    print(f"    Behavior: trust={trust_score:.1f}, quality={behavior_quality:.1f}, resp={responsiveness:.1f} -> {behavior_score:.1f}")
    
    # === RECENCY & ACTIVITY (15%) ===
    # Check last login (we'll simulate with last_spin_date or use a new field)
    last_activity_str = user_doc.get("last_spin_date") or user_doc.get("created_at")
    activity_score = 50.0  # default
    
    if last_activity_str:
        try:
            last_activity = datetime.fromisoformat(last_activity_str.replace("Z", "+00:00"))
            days_since_activity = (now - last_activity).days
            
            if days_since_activity < 1:
                activity_score = 100.0  # Active today
            elif days_since_activity < 3:
                activity_score = 85.0   # Active in last 3 days
            elif days_since_activity < 7:
                activity_score = 70.0   # Active this week
            elif days_since_activity < 14:
                activity_score = 50.0   # Active in last 2 weeks
            else:
                activity_score = 30.0   # Less active
        except:
            activity_score = 50.0
    
    # Check profile completeness
    profile_completeness = 0
    if user_doc.get("photos") and len(user_doc.get("photos", [])) > 0:
        profile_completeness += 30
    if user_doc.get("bio"):
        profile_completeness += 30
    if user_doc.get("interests") and len(user_doc.get("interests", [])) > 0:
        profile_completeness += 40
    
    activity_score = (activity_score * 0.7 + profile_completeness * 0.3)
    
    print(f"    Activity: last_activity={last_activity_str}, profile_complete={profile_completeness} -> {activity_score:.1f}")
    
    # === FINAL WEIGHTED SCORE ===
    trending_energy_score = (
        engagement_score * 0.35 +
        compatibility_score * 0.25 +
        behavior_score * 0.25 +
        activity_score * 0.15
    )
    
    print(f"    FINAL SCORE: {trending_energy_score:.1f} (threshold: 60.0)")
    
    return round(trending_energy_score, 1)

async def debug_trending_scores():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🔍 Debugging Trending Energy Scores")
    print("=" * 50)
    
    # Get all users
    users = await db.users.find({}).limit(10).to_list(length=10)
    print(f"Found {len(users)} users to analyze")
    
    scores = []
    for user in users:
        user_id = user.get("id")
        if user_id:
            score = await calculate_trending_energy_score(user_id, user, db)
            scores.append((user.get("email", "no-email"), score))
            print()
    
    print("=" * 50)
    print("SUMMARY:")
    scores.sort(key=lambda x: x[1], reverse=True)
    
    above_threshold = [s for s in scores if s[1] >= 60.0]
    below_threshold = [s for s in scores if s[1] < 60.0]
    
    print(f"Users with score >= 60: {len(above_threshold)}")
    for email, score in above_threshold:
        print(f"  ✅ {email}: {score}")
    
    print(f"Users with score < 60: {len(below_threshold)}")
    for email, score in below_threshold[:5]:  # Show first 5
        print(f"  ❌ {email}: {score}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_trending_scores())