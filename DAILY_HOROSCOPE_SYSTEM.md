# Daily Horoscope Notification System 🌟

## Overview
A comprehensive daily horoscope notification system that sends personalized zodiac energy readings to users via Firebase Cloud Messaging (FCM) push notifications.

## Features Implemented

### ✅ Backend
1. **Horoscope Generator** (`horoscope_service.py`)
   - 60+ unique messages across 12 zodiac signs
   - Consistent daily message per sign using date-based seeding
   - Zodiac emojis and symbols

2. **Firebase Integration** (`firebase_service.py`)
   - Firebase Admin SDK initialization
   - Push notification sending via FCM HTTP v1 API
   - Web push configuration with deep linking

3. **Automated Scheduler** (`horoscope_scheduler.py`)
   - Runs every 5 minutes to check for pending notifications
   - Timezone-aware delivery (respects user's local time)
   - Quiet hours enforcement (no notifications 10 PM - 7 AM)
   - Deduplication (one notification per day per user)

4. **API Endpoints** (in `server.py`)
   - `GET /api/horoscope/today` - Get today's horoscope
   - `GET /api/horoscope/preferences` - Get user's notification settings
   - `POST /api/horoscope/preferences` - Update notification settings
   - `POST /api/horoscope/test-send` - Send test notification

5. **User Model Updates**
   - Added `horoscope_preferences` field:
     ```python
     {
       "opt_in": bool,
       "time": "HH:MM",
       "timezone": "America/New_York",
       "frequency": "daily",
       "last_sent": "YYYY-MM-DD",
       "fcm_token": "..."
     }
     ```

### ✅ Frontend
1. **Firebase Configuration** (`utils/firebase.js`)
   - Firebase SDK initialization
   - FCM token registration
   - Notification permission handling
   - Foreground message listener

2. **Settings UI** (in `Settings.jsx`)
   - Toggle for opt-in/opt-out
   - Time picker for delivery preference
   - Test notification button
   - Auto-detects user's timezone

3. **Daily Horoscope Ticker** (in `Discover.jsx`)
   - Displays at top of Discover page
   - Animated fade-in effect
   - Shows zodiac emoji + daily message
   - Minimal, elegant design

4. **Service Worker** (`firebase-messaging-sw.js`)
   - Handles background push notifications
   - Deep-linking when notification clicked
   - Custom notification styling

## How It Works

### 1. User Opt-In Flow
```
1. User navigates to Settings
2. Clicks "Daily Energy Reading" toggle
3. Browser requests notification permission
4. If granted, FCM token is obtained
5. Token + preferences saved to backend
6. User is now opted in
```

### 2. Daily Notification Delivery
```
1. Scheduler runs every 5 minutes
2. Queries users with opt_in=true and fcm_token set
3. For each user:
   - Check if already sent today (skip if yes)
   - Get user's timezone and preferred time
   - Calculate if current time matches preferred time (±5 min window)
   - Check quiet hours (skip if 10 PM - 7 AM)
   - Generate horoscope message for user's zodiac sign
   - Send FCM push notification
   - Update last_sent timestamp
```

### 3. Notification Click Handling
```
1. User clicks notification
2. Deep link opens app at /discover
3. Daily horoscope ticker shows at top of page
4. User sees their full message
```

## Configuration

### Backend Environment Variables (`.env`)
```bash
FIREBASE_PROJECT_ID=a-sign-73d1b
FIREBASE_PRIVATE_KEY_ID=d86ffa5c...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...
FIREBASE_WEB_PUSH_CERT=BDSZc3aqqQfaCOm...
```

### Frontend Environment Variables (`.env`)
```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyBlxN3dpxTG0BtdIXLuXOWP1hZErxU1K1E
REACT_APP_FIREBASE_AUTH_DOMAIN=a-sign-73d1b.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=a-sign-73d1b
REACT_APP_FIREBASE_STORAGE_BUCKET=a-sign-73d1b.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=8541191647
REACT_APP_FIREBASE_APP_ID=1:8541191647:web:83bf4a40f22fd59db2586a
REACT_APP_FIREBASE_VAPID_KEY=BDSZc3aqqQfaCOm...
```

## Testing

### Manual Testing Steps
1. **Enable Notifications:**
   - Login to app
   - Navigate to Profile → Settings (gear icon)
   - Scroll to "Daily Horoscope" section
   - Toggle "Daily Energy Reading" to ON
   - Allow browser notification permission
   - Set desired delivery time

2. **Test Notification:**
   - Click "✨ Send Test Notification" button
   - Check browser notifications
   - Click notification to verify deep-link works

3. **View Ticker:**
   - Navigate to Discover tab
   - See horoscope ticker at top of page

### Backend Testing
```bash
# Test horoscope generation
curl https://starswipe.preview.emergentagent.com/api/horoscope/today \
  -H "Cookie: session_token=YOUR_TOKEN"

# Test preferences update
curl -X POST https://starswipe.preview.emergentagent.com/api/horoscope/preferences \
  -H "Cookie: session_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"opt_in": true, "time": "09:00", "fcm_token": "YOUR_FCM_TOKEN"}'

# Send test notification
curl -X POST https://starswipe.preview.emergentagent.com/api/horoscope/test-send \
  -H "Cookie: session_token=YOUR_TOKEN"
```

## Scheduler Status
The horoscope scheduler starts automatically with the backend and runs every 5 minutes.

**Check scheduler status:**
```bash
tail -f /var/log/supervisor/backend.*.log | grep Horoscope
```

**Expected output:**
```
🌟 Running horoscope scheduler at 2025-...
✅ Sent horoscope to user@example.com (Leo)
📊 Horoscope scheduler complete: 3 sent, 0 errors
```

## Architecture

### File Structure
```
backend/
├── server.py              # Main API with horoscope endpoints
├── horoscope_service.py   # Message generation
├── firebase_service.py    # FCM push notification sending
├── horoscope_scheduler.py # Automated daily scheduler
└── .env                   # Firebase credentials

frontend/
├── src/
│   ├── utils/firebase.js  # Firebase SDK setup
│   └── components/
│       ├── Settings.jsx   # Notification settings UI
│       └── Discover.jsx   # Horoscope ticker display
└── public/
    └── firebase-messaging-sw.js  # Service worker
```

### Dependencies Added
**Backend:**
- `firebase-admin==7.1.0` - Firebase Admin SDK
- `APScheduler==3.11.0` - Job scheduler
- `pytz==2025.2` - Timezone handling

**Frontend:**
- `firebase@12.4.0` - Firebase JavaScript SDK

## Customization

### Adding New Horoscope Messages
Edit `backend/horoscope_service.py`:
```python
HOROSCOPE_TEMPLATES = {
    "Leo": [
        "✨ Your confidence draws others in — speak your truth.",
        # Add more messages here
    ],
    # ... other signs
}
```

### Changing Scheduler Frequency
Edit `backend/horoscope_scheduler.py`:
```python
scheduler.add_job(
    send_daily_horoscopes,
    'interval',
    minutes=5,  # Change this value
    ...
)
```

### Modifying Quiet Hours
Edit `backend/horoscope_scheduler.py`:
```python
# Respect quiet hours (10 PM - 7 AM)
if current_time.hour >= 22 or current_time.hour < 7:
    continue  # Modify these hour values
```

## Troubleshooting

### Notifications Not Sending
1. Check Firebase credentials in backend `.env`
2. Verify FCM token is stored for user:
   ```bash
   # In MongoDB shell
   db.users.findOne({email: "user@example.com"}, {horoscope_preferences: 1})
   ```
3. Check scheduler logs:
   ```bash
   tail -f /var/log/supervisor/backend.*.log | grep horoscope
   ```

### Permission Denied in Browser
- User must manually enable notifications in browser settings
- Check browser console for errors

### Service Worker Not Loading
- Verify `/firebase-messaging-sw.js` is accessible
- Check browser console for service worker errors
- Ensure HTTPS is enabled (required for push notifications)

## Future Enhancements
- [ ] Weekly horoscope summaries
- [ ] Compatibility horoscopes for matches
- [ ] Lunar phase notifications
- [ ] Mercury retrograde alerts
- [ ] Custom notification frequency (3x/week, weekdays only)
- [ ] Analytics dashboard (opt-in rate, open rate, click-through rate)

## Firebase Pricing
- **FCM Push Notifications:** Unlimited free
- **Cloud Functions:** 125,000 invocations/day (free tier)
- **Cloud Messaging:** Always free

## Support
For issues or questions:
1. Check backend logs: `/var/log/supervisor/backend.*.log`
2. Check frontend console for errors
3. Verify Firebase configuration is correct
4. Test with a single user first before scaling

---

**Status:** ✅ Production Ready
**Last Updated:** January 2025
