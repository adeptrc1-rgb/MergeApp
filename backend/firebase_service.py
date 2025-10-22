"""
Firebase Cloud Messaging Service
Handles push notification sending
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, messaging
from typing import Optional

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials"""
    if not firebase_admin._apps:
        try:
            # Create credentials dict from environment variables
            cred_dict = {
                "type": "service_account",
                "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
                "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": os.environ.get("FIREBASE_PRIVATE_KEY"),
                "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "universe_domain": "googleapis.com"
            }
            
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK initialized successfully")
        except Exception as e:
            print(f"❌ Firebase initialization error: {e}")
            raise

# Initialize on import
try:
    initialize_firebase()
except Exception as e:
    print(f"Warning: Firebase not initialized: {e}")

async def send_push_notification(
    fcm_token: str,
    title: str,
    body: str,
    deep_link: Optional[str] = None,
    data: Optional[dict] = None
) -> bool:
    """
    Send push notification to a user via FCM
    
    Args:
        fcm_token: User's FCM device token
        title: Notification title
        body: Notification body/message
        deep_link: Optional deep link URL
        data: Optional additional data payload
    
    Returns:
        True if sent successfully, False otherwise
    """
    try:
        # Build notification payload
        notification_data = data or {}
        if deep_link:
            notification_data["deep_link"] = deep_link
        
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=notification_data,
            token=fcm_token,
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    title=title,
                    body=body,
                    icon="/logo-192.png",
                    badge="/logo-96.png"
                ),
                fcm_options=messaging.WebpushFCMOptions(
                    link=deep_link if deep_link else "https://cosmic-match-11.preview.emergentagent.com"
                )
            )
        )
        
        # Send message
        response = messaging.send(message)
        print(f"✅ Successfully sent notification: {response}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending push notification: {e}")
        return False

async def send_horoscope_notification(
    fcm_token: str,
    zodiac_sign: str,
    horoscope_message: str,
    date_str: str
) -> bool:
    """
    Send daily horoscope notification
    
    Args:
        fcm_token: User's FCM device token
        zodiac_sign: User's zodiac sign
        horoscope_message: The horoscope message
        date_str: Date string (YYYY-MM-DD)
    
    Returns:
        True if sent successfully
    """
    from horoscope_service import get_zodiac_emoji
    
    emoji = get_zodiac_emoji(zodiac_sign)
    title = f"{emoji} {zodiac_sign} Energy Today"
    
    return await send_push_notification(
        fcm_token=fcm_token,
        title=title,
        body=horoscope_message,
        deep_link="https://cosmic-match-11.preview.emergentagent.com/discover",
        data={
            "type": "daily_horoscope",
            "sign": zodiac_sign,
            "date": date_str,
            "analytics_id": f"horoscope_{date_str}_{zodiac_sign.lower()}"
        }
    )
