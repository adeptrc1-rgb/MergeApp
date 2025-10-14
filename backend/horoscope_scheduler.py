"""
Daily Horoscope Scheduler
Sends personalized horoscope notifications at user's preferred time
"""

import asyncio
import os
from datetime import datetime, time as dt_time
from motor.motor_asyncio import AsyncIOMotorClient
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import pytz
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "astrology_dating_db")

scheduler = AsyncIOScheduler()


async def send_daily_horoscopes():
    """
    Main function to send horoscope notifications
    Runs every 5 minutes to check for users who need notifications
    """
    from horoscope_service import get_daily_horoscope
    from firebase_service import send_horoscope_notification
    
    print(f"🌟 Running horoscope scheduler at {datetime.now()}")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        now_utc = datetime.now(pytz.UTC)
        today_str = now_utc.date().isoformat()
        
        # Find users who opted in and have FCM tokens
        cursor = db.users.find({
            "horoscope_preferences.opt_in": True,
            "horoscope_preferences.fcm_token": {"$exists": True, "$ne": None},
            "zodiac_sign": {"$exists": True, "$ne": None}
        })
        
        sent_count = 0
        error_count = 0
        
        async for user_doc in cursor:
            try:
                prefs = user_doc.get("horoscope_preferences", {})
                
                # Skip if already sent today
                last_sent = prefs.get("last_sent")
                if last_sent and last_sent == today_str:
                    continue
                
                # Get user's timezone and preferred time
                user_tz_str = prefs.get("timezone", "America/New_York")
                preferred_time_str = prefs.get("time", "08:00")  # Format: "HH:MM"
                
                try:
                    user_tz = pytz.timezone(user_tz_str)
                except:
                    user_tz = pytz.timezone("America/New_York")  # Fallback
                
                # Parse preferred time
                try:
                    hour, minute = map(int, preferred_time_str.split(":"))
                    preferred_time = dt_time(hour, minute)
                except:
                    preferred_time = dt_time(8, 0)  # Default 8:00 AM
                
                # Get current time in user's timezone
                now_user = now_utc.astimezone(user_tz)
                current_time = now_user.time()
                
                # Check if current time is within 5-minute window of preferred time
                preferred_datetime = datetime.combine(now_user.date(), preferred_time)
                preferred_datetime = user_tz.localize(preferred_datetime)
                time_diff = abs((now_utc - preferred_datetime).total_seconds())
                
                # Send if within 5-minute window (300 seconds)
                if time_diff <= 300:
                    # Respect quiet hours (10 PM - 7 AM)
                    if current_time.hour >= 22 or current_time.hour < 7:
                        print(f"⏰ Skipping {user_doc['email']} - quiet hours")
                        continue
                    
                    # Get horoscope
                    zodiac_sign = user_doc.get("zodiac_sign")
                    horoscope = get_daily_horoscope(zodiac_sign, today_str)
                    
                    # Send notification
                    fcm_token = prefs.get("fcm_token")
                    success = await send_horoscope_notification(
                        fcm_token=fcm_token,
                        zodiac_sign=zodiac_sign,
                        horoscope_message=horoscope["message"],
                        date_str=today_str
                    )
                    
                    if success:
                        # Update last_sent timestamp
                        await db.users.update_one(
                            {"id": user_doc["id"]},
                            {"$set": {"horoscope_preferences.last_sent": today_str}}
                        )
                        sent_count += 1
                        print(f"✅ Sent horoscope to {user_doc.get('email', 'Unknown')} ({zodiac_sign})")
                    else:
                        error_count += 1
                        print(f"❌ Failed to send to {user_doc.get('email', 'Unknown')}")
                        
            except Exception as e:
                error_count += 1
                print(f"❌ Error processing user {user_doc.get('id')}: {e}")
        
        print(f"📊 Horoscope scheduler complete: {sent_count} sent, {error_count} errors")
        
    except Exception as e:
        print(f"❌ Horoscope scheduler error: {e}")
    finally:
        client.close()


def start_scheduler():
    """Start the horoscope notification scheduler"""
    print("🚀 Starting horoscope scheduler...")
    
    # Run every 5 minutes
    scheduler.add_job(
        send_daily_horoscopes,
        'interval',
        minutes=5,
        id='horoscope_notifications',
        replace_existing=True
    )
    
    scheduler.start()
    print("✅ Horoscope scheduler started - running every 5 minutes")


def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
    print("🛑 Horoscope scheduler stopped")


if __name__ == "__main__":
    # For standalone testing
    start_scheduler()
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        stop_scheduler()
