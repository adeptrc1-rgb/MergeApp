# 🚀 Merge Dating App - React Native Rebuild Specification

## Executive Summary

**Current State:** Fully functional PWA (React web app) with FastAPI backend and MongoDB
**Target:** Native iOS/Android app using React Native (Expo)
**Backend:** Keep existing FastAPI + MongoDB (no changes needed)
**Timeline:** Full rebuild required

---

## 📱 App Overview

**Name:** Merge Dating App
**Description:** AI-powered dating app with advanced compatibility matching, featuring:
- AMI (Astrology, Myers-Briggs, Interests) compatibility algorithm
- "Infinity Wheel" spin mechanic for daily profile boosts
- Pulse³ profile boost system
- Real-time messaging
- Trending score algorithm
- Aura/skin customization system

**Target Platforms:** iOS and Android
**Authentication:** Email-based + Google OAuth + Facebook Login (pending credentials)

---

## 🎯 Core Features (Priority Order)

### 1. Authentication & Onboarding (P0 - Critical)

**Login Options:**
- Email/Password (test login available)
- Google OAuth integration
- Facebook Login (technical integration complete, needs credentials)

**Onboarding Flow:**
- Multi-step questionnaire (personality, interests, preferences)
- Photo upload (multiple photos)
- Profile creation with:
  - Name, age, gender
  - Birth date (for astrology compatibility)
  - Location
  - Bio/description
  - Interests/hobbies
  - Myers-Briggs type
  - Social preferences

**Data Collected:**
```javascript
{
  id: string,
  email: string,
  name: string,
  age: number,
  gender: string,
  birth_date: string,
  location: string,
  bio: string,
  photos: [url1, url2, ...],
  interests: [array],
  mbti_type: string,
  social_preference: string,
  relationship_goals: string
}
```

### 2. Main Swipe Screen - "Explore" (P0 - Critical)

**Core Functionality:**
- Tinder-style swipe interface
- Large profile cards with:
  - Name, age
  - Main photo (swipeable carousel for multiple photos)
  - Compatibility score (0-100%)
  - Merge Score indicator with breakdown
  - Distance/location

**Swipe Actions:**
- **Swipe Right / Heart Button:** Like
- **Swipe Left / X Button:** Pass/Dislike
- **Swipe Up / Star Button:** Super Like (limited quantity)
- **Undo Button:** Take back last swipe (with VHS glitch animation)

**Animations (Critical for UX):**
- Card exit animations for each swipe direction
- Like: Green glow, heart particles, card rotates right and exits
- Dislike: Red glow, X particles, card rotates left and exits
- Super Like: Blue starburst, card flies up and exits
- Undo: VHS glitch effect with RGB split, scan lines, previous card slides in from right

**Merge Score Breakdown Modal:**
- Tap the compatibility score to see detailed breakdown:
  - Astrology compatibility
  - Myers-Briggs compatibility
  - Shared interests
  - Social compatibility
  - Relationship goals alignment

**Pulse³ Feature:**
- Profile boost mechanic in header
- Shows available boosts (count)
- Countdown timer when active (30 minutes)
- Cooldown period after use (6 hours)
- State persists in localStorage (for web) / AsyncStorage (for React Native)

**API Endpoints:**
- `GET /api/matches` - Fetch potential matches
- `POST /api/users/like/{user_id}` - Record like
- `POST /api/users/pass/{user_id}` - Record pass
- `POST /api/users/super-like/{user_id}` - Record super like (decrements counter)
- `DELETE /api/users/undo-swipe/{user_id}` - Undo last swipe
- `GET /api/users/check-match/{user_id}` - Check if mutual like (creates match)

### 3. Connections/Likes Screen (P0 - Critical)

**Two Tabs:**
1. **Matches:** Users who liked you back (mutual matches)
2. **Liked You:** Users who liked you but you haven't swiped yet

**Display:**
- Grid of profile cards (3 columns on mobile)
- Each card shows:
  - Photo
  - Name, age
  - Compatibility score badge
  - "New" indicator for recent likes

**Actions:**
- Tap card to view full profile
- Can message from here (opens Messages screen)

**API Endpoints:**
- `GET /api/users/connections` - Fetch mutual matches
- `GET /api/users/liked-by` - Fetch users who liked you

### 4. Messages/Chat (P0 - Critical)

**Conversation List:**
- List of all active conversations
- Shows:
  - Match's photo and name
  - Last message preview
  - Timestamp
  - Unread indicator (badge count)
  - Compatibility score

**Chat Interface:**
- Standard messaging UI
- Real-time messages (WebSocket or polling)
- Message bubbles (sent vs received)
- Timestamp on each message
- Text input with send button
- Photo sharing (future enhancement)

**Features:**
- Send text messages
- See when message was sent
- Unread count updates in real-time

**API Endpoints:**
- `GET /api/messages/{match_id}` - Fetch conversation history
- `POST /api/messages` - Send new message
- `GET /api/messages/unread-count` - Get total unread count

**Data Model:**
```javascript
{
  id: string,
  match_id: string,
  sender_id: string,
  content: string,
  sent_at: ISO timestamp,
  read: boolean
}
```

### 5. Trending/Discover Screen (P1 - Important)

**Purpose:** Show "hot" profiles based on trending algorithm

**Trending Score Algorithm:**
- Combines multiple signals:
  - Recent likes received (weighted by time)
  - Recent activity (logins, swipes)
  - Average match compatibility with others
  - Profile completeness
  - Photo quality score (if implemented)

**Display:**
- Scrollable list of profiles
- Large cards with:
  - Photos
  - Name, age
  - Trending score indicator (🔥 flame icon + number)
  - Compatibility with you
  - Quick action buttons (Like/Pass)

**API Endpoints:**
- `GET /api/users/trending` - Fetch trending users

### 6. Profile Screen (P0 - Critical)

**User's Own Profile View:**

**Header Section:**
- Profile photo (large)
- Name, age
- Edit profile button
- Settings gear icon
- Logout button

**Stats Cards (Horizontal Scroll):**
1. **Super Likes Card:**
   - Icon: Star
   - Count: Shows remaining super likes
   - "GET MORE" button → navigates to Store

2. **Pulse³ Card:**
   - Icon: Lightning bolt
   - Count: Available boosts
   - "GET MORE" button → navigates to Store
   - Shows active countdown if boost is running

3. **Auras Card:**
   - Icon: Sparkles
   - Preview of current aura/skin
   - "EXPLORE" button → navigates to Store (Skins tab)

**Infinity Wheel Section:**
- Large spinning wheel graphic
- "Spin for Daily Boost" button
- Shows when next spin is available
- Free spin every 24 hours
- Rewards:
  - Profile visibility boost
  - Super likes
  - Pulse³ boosts

**Merge Elite vs Free Comparison:**
- Swipeable cards comparing features
- Upgrade button if on free tier

**API Endpoints:**
- `GET /api/users/me` - Fetch own profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/upgrade-to-elite` - Upgrade to premium

### 7. Store/Shop (P1 - Important)

**Three Tabs:**

**Tab 1: Boosts**
- Pulse³ packs (boost visibility)
- Super Likes packs
- Pricing tiers

**Tab 2: Skins/Auras**
- Visual customization for profile
- Different aura effects
- Preview before purchase
- Some free, some premium

**Tab 3: Elite Membership**
- Monthly/yearly subscription
- Features:
  - Unlimited super likes
  - See who liked you
  - Advanced filters
  - Rewind unlimited times
  - No ads

**API Endpoints:**
- `GET /api/store/items` - Fetch all store items
- `POST /api/store/purchase` - Process purchase (would need payment integration)

### 8. Settings (P1 - Important)

**Sections:**

**Account:**
- Email
- Password change
- Delete account

**Discovery Preferences:**
- Age range slider
- Distance radius
- Gender preference
- Show me to: Everyone / Only people I've liked

**Notifications:**
- New matches
- New messages
- New likes
- App updates

**Privacy:**
- Profile visibility
- Photo privacy settings
- Block list

**About:**
- Terms of service
- Privacy policy
- App version
- Logout

**API Endpoints:**
- `PUT /api/users/preferences` - Update discovery preferences
- `PUT /api/users/settings` - Update other settings

---

## 🎨 Design System

### Color Palette

**Primary Colors:**
```javascript
accent: '#00D9FF'  // Cyan - primary brand color
accentDark: '#0091B8'
accentLight: '#33E5FF'
```

**Neutrals:**
```javascript
bgPrimary: '#0A0A0F'  // Very dark purple-black
bgSecondary: '#151520'
bgTertiary: '#1F1F2E'
textPrimary: '#FFFFFF'
textSecondary: '#A0A0B0'
border: '#2A2A3A'
```

**Status Colors:**
```javascript
success: '#4CAF50'  // Green
error: '#EF4444'    // Red
warning: '#F59E0B'  // Amber
info: '#3B82F6'     // Blue
```

**Gradient:**
```javascript
primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
```

### Typography

**Font Sizes:**
- H1 (Hero): 48px
- H2 (Page Title): 32px
- H3 (Section): 24px
- Body: 16px
- Small: 14px
- Tiny: 12px

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- full: 9999px (circular)

### Shadows
```javascript
small: '0 2px 4px rgba(0, 0, 0, 0.1)'
medium: '0 4px 12px rgba(0, 0, 0, 0.15)'
large: '0 8px 24px rgba(0, 0, 0, 0.2)'
glow: '0 0 20px rgba(0, 217, 255, 0.3)'
```

---

## 🏗️ Architecture

### Frontend (React Native/Expo)

**Navigation:**
- React Navigation (Stack + Tab Navigator)
- Bottom tab navigation with 5 tabs:
  1. Explore (swipe screen)
  2. Trending (discover)
  3. Connections (likes/matches)
  4. Messages (chat)
  5. Profile (user profile)

**State Management:**
- React Context API for global state (user, auth)
- AsyncStorage for persistence (tokens, settings)
- React Query or SWR for API data fetching

**Key Libraries Needed:**
- `react-navigation` - Navigation
- `react-native-gesture-handler` - Swipe gestures
- `react-native-reanimated` - Smooth animations
- `expo-image-picker` - Photo uploads
- `axios` - API requests
- `@react-native-async-storage/async-storage` - Local storage
- `react-native-svg` - Icons and graphics

### Backend (FastAPI - Keep As-Is)

**Already Built - Use These Endpoints:**

Base URL: `{REACT_APP_BACKEND_URL}/api`

**Auth:**
- `POST /auth/register` - Create account
- `POST /auth/login` - Email/password login
- `POST /auth/google-login` - Google OAuth
- `POST /auth/facebook-login` - Facebook login
- `POST /auth/test-login` - Test/dev login
- `GET /auth/me` - Get current user

**Users:**
- `GET /users/me` - Get own profile
- `PUT /users/me` - Update profile
- `POST /users/like/{user_id}` - Like user
- `POST /users/pass/{user_id}` - Pass user
- `POST /users/super-like/{user_id}` - Super like
- `DELETE /users/undo-swipe/{user_id}` - Undo swipe
- `GET /users/check-match/{user_id}` - Check for match
- `GET /users/connections` - Get matches
- `GET /users/liked-by` - Get likes received
- `POST /users/upgrade-to-elite` - Upgrade to premium

**Matches:**
- `GET /matches` - Get potential matches
- `GET /matches/trending` - Get trending users

**Messages:**
- `GET /messages/{match_id}` - Get conversation
- `POST /messages` - Send message
- `GET /messages/unread-count` - Get unread count

**Store:**
- `GET /store/items` - Get store items
- `POST /store/purchase` - Purchase item

**Infinity Wheel:**
- `POST /users/spin` - Spin the wheel
- `GET /users/spin-status` - Check spin availability

### Database (MongoDB - Keep As-Is)

**Collections:**

**users:**
```javascript
{
  id: string,
  email: string,
  password_hash: string,
  name: string,
  age: number,
  gender: string,
  birth_date: string,
  location: string,
  bio: string,
  photos: [urls],
  interests: [strings],
  mbti_type: string,
  social_preference: string,
  relationship_goals: string,
  liked_users: [user_ids],
  disliked_users: [user_ids],
  super_liked_users: [user_ids],
  liked_by: [user_ids],
  super_liked_by: [user_ids],
  is_premium: boolean,
  super_likes: number,
  pulse_boosts: number,
  created_at: timestamp,
  last_active: timestamp
}
```

**matches:**
```javascript
{
  id: string,
  user1_id: string,
  user2_id: string,
  matched_at: timestamp,
  compatibility_score: number
}
```

**messages:**
```javascript
{
  id: string,
  match_id: string,
  sender_id: string,
  content: string,
  sent_at: timestamp,
  read: boolean
}
```

---

## 🧮 Algorithms

### 1. Compatibility Score (0-100)

**Formula:**
```
Base Score (60 points):
  - Astrology: 20 points
  - Myers-Briggs: 20 points
  - Shared Interests: 15 points
  - Social Compatibility: 5 points

Bonus Points (40 points):
  - Profile completeness
  - Photo quality
  - Activity level
  - Response rate
```

**Astrology Matching:**
- Fire signs (Aries, Leo, Sagittarius) → Fire + Air = Good
- Earth signs (Taurus, Virgo, Capricorn) → Earth + Water = Good
- Air signs (Gemini, Libra, Aquarius) → Air + Fire = Good
- Water signs (Cancer, Scorpio, Pisces) → Water + Earth = Good
- Same element: Moderate compatibility
- Opposite elements: Lower compatibility

**MBTI Matching:**
- Complementary pairs (e.g., INFJ + ENTP)
- Shared functions
- Cognitive stack alignment

### 2. Trending Score Algorithm

**Components:**
```javascript
trendingScore = (
  recentLikesWeight * 0.4 +
  activityScore * 0.2 +
  avgCompatibility * 0.2 +
  profileQuality * 0.2
) * decayFactor
```

**Recent Likes (time-weighted):**
- Likes in last hour: 1.0x weight
- Likes in last 6 hours: 0.8x weight
- Likes in last 24 hours: 0.5x weight
- Older likes: exponential decay

**Decay Factor:**
- Prevents users from staying trending forever
- Reduces score by 10% every 12 hours

### 3. Infinity Wheel Probabilities

**Spin Rewards:**
- 2 Super Likes: 40% chance
- 1 Pulse³ Boost: 30% chance
- 3 Super Likes: 20% chance
- 2 Pulse³ Boosts: 8% chance
- Premium Trial (24h): 2% chance

---

## 🎭 Animations & Interactions

### Critical Animations

**1. Swipe Card Animations:**
- **Like (Right):**
  - Card rotates 12° clockwise
  - Translates right + scales up slightly
  - Green glow around card
  - Heart particles burst from center
  - Duration: 400ms
  
- **Dislike (Left):**
  - Card rotates 12° counter-clockwise
  - Translates left + scales down
  - Red glow
  - X particles
  - Duration: 400ms

- **Super Like (Up):**
  - Card shoots up with scale
  - Blue starburst particles
  - Star icon follows card
  - Duration: 500ms

- **Undo (VHS Glitch):**
  - RGB split chromatic aberration
  - Scan line overlay
  - Previous card slides from right
  - Glitch distortion effects
  - Duration: 500ms

**2. Match Animation:**
- When mutual like happens
- Full-screen modal
- Both profile photos appear
- "It's a Match!" text
- Confetti/particle effects
- Options: Message now / Keep swiping

**3. Pulse³ Activation:**
- Button press → ripple effect
- Countdown timer starts
- Profile gets glow effect
- Notification: "Your profile is boosted!"

**4. Infinity Wheel Spin:**
- Wheel rotates with physics
- Slows down gradually
- Lands on reward
- Reward notification popup

### Micro-interactions
- Button press feedback (scale down)
- Tab switch animations
- Pull-to-refresh on lists
- Skeleton loaders while fetching data
- Toast notifications for actions

---

## 🔐 Authentication Flow

### Login Flow
1. User opens app
2. If no token → Show login screen
3. Options: Email, Google, Facebook, Test Login
4. On success → Store token in AsyncStorage
5. Fetch user profile
6. Navigate to main app

### Registration Flow
1. Email/password entry
2. Basic info (name, age, gender)
3. Photo upload (min 1, max 6)
4. Onboarding questionnaire (10-15 questions)
5. Create profile
6. Navigate to main app

### Session Management
- Store JWT token in AsyncStorage
- Include in Authorization header: `Bearer {token}`
- Refresh token on 401 responses
- Logout clears token and navigates to login

---

## 📡 API Integration Notes

### Base Configuration
```javascript
const API_BASE_URL = 'YOUR_BACKEND_URL/api';

// Example request with auth
axios.get(`${API_BASE_URL}/users/me`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Error Handling
- 401: Token expired → Re-authenticate
- 404: Resource not found → Show error message
- 500: Server error → Show retry option
- Network error: Show offline indicator

### Request Timeout
- Set timeout: 30 seconds
- Show loading indicator after 1 second
- Cancel on user navigation

---

## 🚀 React Native Specific Considerations

### Platform Differences

**iOS:**
- Use `SafeAreaView` for top/bottom safe areas
- Handle iPhone notch/home indicator
- Use iOS-specific gestures (swipe from edge)
- Test on different screen sizes (iPhone SE, Pro Max, etc.)

**Android:**
- Handle back button behavior
- Status bar color
- Different screen densities
- Permissions for camera/storage

### Performance
- Use `FlatList` for long lists (not ScrollView)
- Optimize images (compress, lazy load)
- Use `React.memo` for expensive components
- Implement virtualization for chat messages

### Permissions
- Camera (for photo uploads)
- Photo library (for selecting photos)
- Location (optional, for distance filtering)
- Notifications (for new messages/matches)

### Offline Support
- Cache user profile in AsyncStorage
- Queue actions when offline (likes, messages)
- Sync when connection restored
- Show offline indicator

---

## 🧪 Testing Checklist

### Critical User Flows
- [ ] Complete registration flow
- [ ] Login with email
- [ ] Swipe through 10 profiles
- [ ] Like a user → Check if match created
- [ ] Send a message
- [ ] Receive a message (test with another account)
- [ ] Use Super Like
- [ ] Undo a swipe
- [ ] Spin Infinity Wheel
- [ ] Activate Pulse³
- [ ] Edit profile
- [ ] Change settings
- [ ] Logout and login again

### Edge Cases
- [ ] No internet connection
- [ ] Empty states (no matches, no messages)
- [ ] Run out of profiles to swipe
- [ ] Run out of super likes
- [ ] Expired token
- [ ] Invalid credentials
- [ ] Upload large photo (>10MB)

---

## 📦 Deliverables Checklist

### Must Have (P0)
- [ ] Authentication (login/register)
- [ ] Swipe screen with animations
- [ ] Like/Pass/Super Like functionality
- [ ] Matches screen
- [ ] Basic messaging
- [ ] Profile screen
- [ ] Bottom tab navigation
- [ ] Compatibility scoring

### Should Have (P1)
- [ ] Trending screen
- [ ] Pulse³ boost feature
- [ ] Infinity Wheel
- [ ] Store/Shop
- [ ] Settings
- [ ] Edit profile
- [ ] Photo upload

### Nice to Have (P2)
- [ ] Facebook login
- [ ] Google OAuth
- [ ] Auras/Skins
- [ ] Push notifications
- [ ] Match animation
- [ ] Advanced filters

---

## 🎯 Success Metrics

### User Engagement
- Daily active users (DAU)
- Swipes per session
- Match rate (matches / right swipes)
- Message response rate
- Time spent in app

### Technical Metrics
- App load time < 2 seconds
- API response time < 500ms
- Crash rate < 1%
- Successful swipe rate (no errors)

---

## 📞 Support & Questions

### Backend API Issues
- Endpoint not working? Check backend logs
- Authentication errors? Verify token format
- 500 errors? Check MongoDB connection

### Known Backend Quirks
- `/api/users/undo-swipe` - Must have swipe history
- `/api/users/super-like` - Checks counter, returns 400 if none left
- `/api/matches` - Excludes already swiped users
- Compatibility calculation is CPU-intensive, may be slow with large user base

---

## 🔄 Migration Strategy

### Phase 1: Core Features (Week 1-2)
- Auth & onboarding
- Basic swipe screen
- Profile display
- API integration

### Phase 2: Social Features (Week 3)
- Matches screen
- Messaging
- Bottom navigation

### Phase 3: Advanced Features (Week 4)
- Trending
- Store
- Infinity Wheel
- Settings

### Phase 4: Polish (Week 5)
- Animations
- Error handling
- Offline support
- Performance optimization

---

## ✅ Ready to Build!

This document contains everything needed to rebuild the Merge dating app in React Native. The backend is ready and working - just need to build the mobile frontend!

**Next Steps:**
1. Set up React Native/Expo project
2. Implement authentication
3. Build swipe screen
4. Integrate with existing API
5. Test thoroughly
6. Deploy to TestFlight/Play Store beta

**Questions?** Refer to backend code at `/app/backend/server.py` for API implementation details.
