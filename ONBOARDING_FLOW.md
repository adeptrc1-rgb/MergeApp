# Merge Onboarding Flow - Complete Integration

## Overview
The streamlined 18-question onboarding is now fully connected to create user profiles in the database.

## Flow Architecture

### Frontend → Backend → Database

```
User completes onboarding
    ↓
MergeOnboarding.jsx (Frontend)
    ↓
POST /api/onboarding/complete (Backend)
    ↓
MongoDB users collection (Database)
    ↓
Redirect to /home (Profile Complete)
```

## Endpoint Details

### POST /api/onboarding/complete

**Authentication:** Cookie-based (user_id)

**Request Body:**
```json
{
  "first_name": "John",
  "birth_date": "1995-06-15",
  "hometown": "New York, NY",
  
  "personality_type": "ENFP",
  "social_energy_source": "extroversion",
  "information_processing": "intuition",
  "decision_making": "feeling",
  "mbti_sliders": {
    "energy": 4,
    "information": 3,
    "decision": 4,
    "planning": 2,
    "expression": 5
  },
  "mbti_scores": {
    "E": 80,
    "N": 60,
    "F": 80,
    "P": 40
  },
  
  "deal_breakers": {
    "relationship_goals": "long_term",
    "want_kids": "want_someday"
  },
  "interests": ["Hiking", "Music", "Cooking"],
  "lifestyle_factors": {
    "social_energy": 4,
    "occupation": ""
  },
  
  "preferences": {
    "conflict_style": "talk_immediately",
    "love_language": "balanced",
    "texting_style": "quick_frequent"
  },
  
  "photos": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,..."
  ],
  
  "profile_completed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "user_id": "uuid-here"
}
```

## Database Schema Update

When a user completes onboarding, their profile is updated with:

```javascript
{
  // Identity
  "first_name": "John",
  "birth_date": "1995-06-15",
  "age": 29,  // Calculated automatically
  "zodiac_sign": "Gemini",  // Calculated automatically
  "hometown": "New York, NY",
  
  // Personality
  "personality_type": "ENFP",
  "mbti_scores": {
    "E": 80,
    "N": 60,
    "F": 80,
    "P": 40
  },
  "mbti_answers": {
    "social_energy_source": "extroversion",
    "information_processing": "intuition",
    "decision_making": "feeling",
    "sliders": {
      "energy": 4,
      "information": 3,
      "decision": 4,
      "planning": 2,
      "expression": 5
    }
  },
  
  // Lifestyle & Values
  "deal_breakers": {
    "relationship_goals": "long_term",
    "want_kids": "want_someday"
  },
  "interests": ["Hiking", "Music", "Cooking"],
  "lifestyle_factors": {
    "social_energy": 4,
    "occupation": ""
  },
  
  // Communication
  "preferences": {
    "conflict_style": "talk_immediately",
    "love_language": "balanced",
    "texting_style": "quick_frequent"
  },
  
  // Photos
  "photos": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,..."
  ],
  
  // Metadata
  "profile_completed": true,
  "updated_at": "2025-11-16T00:08:00.000Z"
}
```

## Automatic Calculations

The backend automatically calculates:

1. **Age** - From birth_date
2. **Zodiac Sign** - From birth_date (month/day)
3. **MBTI Scores** - From scenarios + sliders (0-100 scale)

## User Flow Examples

### New User (First Time)
1. Login with Test Login or Google
2. Auto-redirected to `/onboarding`
3. Complete 18 questions + 3 photos
4. Click "Complete ✨"
5. Profile saved to database
6. Redirected to `/home` (ready to match)

### Returning User
1. Login with Test Login or Google
2. Profile already completed (profile_completed: true)
3. Direct redirect to `/home`

## Data Usage in App

The onboarding data feeds into:

✅ **Profile Display** - Name, age, hometown, photos, interests
✅ **Matching Algorithm** - MBTI scores, deal-breakers, lifestyle factors
✅ **Compatibility Insights** - AI analyzes personality + communication style
✅ **Conversation Starters** - Based on interests and communication preferences
✅ **Connection Matrix** - Uses all data for pattern analysis

## Testing the Flow

### Manual Test:
1. Go to http://localhost:3000
2. Click "Preview Onboarding" or login as new user
3. Complete all 18 questions
4. Upload 3 photos
5. Click "Complete ✨"
6. Check browser console for submission logs
7. Verify redirect to /home
8. Check MongoDB for updated profile

### Test User Credentials:
```
Test Login → Uses existing test user
Google Login → Creates new user on first login
```

## Error Handling

**Frontend:**
- Validates each step before allowing continue
- Shows alert if submission fails
- Logs errors to console

**Backend:**
- Validates user authentication
- Calculates age and zodiac automatically
- Logs all operations with [ONBOARDING] prefix
- Returns detailed error messages

## Backend Logs

Example successful completion:
```
[ONBOARDING] Completing profile for user: uuid-here
[ONBOARDING] Data received: dict_keys(['first_name', 'birth_date', ...])
[ONBOARDING] Profile completed successfully for uuid-here
```

## Next Steps for Enhancement

1. Add occupation field collection (future step)
2. Add education field collection (future step)
3. Add music preferences collection (future step)
4. Implement photo upload to cloud storage (currently base64)
5. Add email verification flow
6. Add profile edit functionality

## Files Modified

**Backend:**
- `/app/backend/server.py`
  - Added `/api/onboarding/complete` endpoint
  - Calculates age and zodiac sign
  - Stores structured personality data

**Frontend:**
- `/app/frontend/src/components/MergeOnboarding.jsx`
  - Complete 18-question flow
  - Data submission to backend
  - Error handling and logging

**Database:**
- MongoDB `users` collection updated with full profile data
