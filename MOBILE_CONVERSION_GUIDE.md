# MERGE DATING APP - MOBILE AGENT CONVERSION GUIDE

## 📱 PROJECT OVERVIEW

**App Name:** Merge  
**Type:** AI-Powered Dating App  
**Current Stack:** React + FastAPI + MongoDB (Web App)  
**Target:** React Native (Expo) Mobile App  
**Backend:** Keep existing FastAPI + MongoDB (NO CHANGES NEEDED)

---

## 🎯 APP DESCRIPTION

Merge is a sophisticated dating app featuring:
- AI-powered compatibility matching (AMI Score)
- Tinder-style swipe interface
- Premium subscription tiers (Free & Elite)
- Gamification (Infinity Wheel, Pulse³ boosts)
- Real-time messaging
- Profile customization with Auras

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────┐
│   MOBILE APP (React Native/Expo)   │
│   - Swipe UI                        │
│   - Profile Management              │
│   - Messages                        │
│   - Infinity Wheel                  │
│   - Pulse³ System                   │
└─────────────┬───────────────────────┘
              │ HTTPS/REST API
              ↓
┌─────────────────────────────────────┐
│   BACKEND (FastAPI - KEEP AS IS)   │
│   - Authentication                  │
│   - Matching Algorithm              │
│   - Subscription Management         │
│   - Store/Rewards                   │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│   DATABASE (MongoDB - KEEP AS IS)  │
│   - Users                           │
│   - Matches                         │
│   - Messages                        │
│   - Store Items                     │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN-BY-SCREEN BREAKDOWN

### **1. Explore Tab (Main Swipe Screen)**

**Layout:**
- Fixed header: "Merge" logo (left), "Pulse³" button with badge (right)
- Swipe cards: Edge-to-edge, 76% viewport height
- Card info (bottom): Name, age, AMI score, occupation, location
- Action buttons (bottom): Undo (48px), Pass (60px), Like (70px), Super Like (56px)

**Functionality:**
- Fetch: `GET /api/users/potential-matches`
- Swipe left → `POST /api/users/pass/{user_id}`
- Swipe right → `POST /api/users/like/{user_id}`
- Swipe up → `POST /api/users/super-like/{user_id}`
- Undo → Restore previous card from history
- Pulse³ click → Activate boost (localStorage timer)

**Key Details:**
- Cards use z-index 100 (animate over header z-10)
- Navigation z-index 200 (always clickable)
- Card padding top: 42px (just under header)
- Info section: pb-8 pt-8 at card bottom

---

### **2. Trending Tab**

**Layout:**
- Header: "Merge" logo
- Scrollable list of high-AMI matches
- Each item: Photo, name, AMI score, brief info

**Functionality:**
- Fetch: `GET /api/users/trending`
- Tap user → Navigate to profile detail
- Show AMI score for each

---

### **3. Connections Tab**

**Layout:**
- Header: "Merge" logo
- Grid/list of users who liked you
- Shows AMI compatibility

**Functionality:**
- Filter matches where user was liked
- Tap to view full profile or match

---

### **4. Messages Tab**

**Layout:**
- Header: "Merge" logo
- Conversation list
- Each: Avatar, name, last message, AMI score

**Functionality:**
- Fetch: `GET /api/matches`
- Fetch messages: `GET /api/matches/{match_id}/messages`
- Send: `POST /api/matches/{match_id}/send`
- Real-time updates (optional: WebSocket)

---

### **5. Profile Tab**

**Layout (Vertical Scroll):**

1. **Header:**
   - "Merge" logo (left)
   - Settings icon (right)

2. **Profile Summary:**
   - Circular progress ring (SVG) around photo
   - Shows completion %
   - Name, age, verification
   - Small "Complete profile" button (translucent pill)

3. **Try Infinity Wheel Card:**
   - Dark background card
   - Infinity icon in gradient circle
   - "Try Infinity Wheel" text
   - Tap → Open Infinity Wheel modal

4. **Action Cards (Horizontal Scroll):**
   - **Super Likes**: Purple heart gradient, "5 Super Likes", "GET MORE"
   - **Pulse³**: Cyan "P³" gradient, "Exponential boost", "GET MORE"
   - **Auras**: Pink sparkles gradient, "Auras", "EXPLORE" → Navigate to Store Skins

5. **Tier Comparison (Swipeable Carousel):**
   - **Merge Free Card** (square 360x360):
     - Black gradient background
     - White text
     - Features: 1 spin/72h, standard rewards, no stacking
   - **Merge Elite Card** (square 360x360):
     - Pale yellow gold gradient
     - Black text
     - "Upgrade" button (top-right)
     - Features: 5 spins, 12h cooldown, 2x multiplier, +2 monthly
     - Collapsible "MORE BENEFITS"

6. **Account Actions:**
   - Safety & Privacy button
   - Logout button

---

## 🎨 DESIGN SYSTEM

### **Colors:**
```javascript
{
  primary: '#00D9FF',        // Cyan
  secondary: '#667eea',      // Purple
  accent: '#764ba2',         // Dark Purple
  background: '#000000',     // Black
  surfaceLight: 'rgba(255,255,255,0.05)',
  surfaceDark: 'rgba(10,10,10,0.6)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.8)',
  textTertiary: 'rgba(255,255,255,0.6)',
  border: 'rgba(255,255,255,0.1)'
}
```

### **Typography:**
```javascript
{
  fontFamily: 'Inter, SF Pro Display, -apple-system',
  sizes: {
    title: 28,
    heading: 22,
    body: 14,
    caption: 12,
    tiny: 10
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
}
```

### **Spacing:**
```javascript
{
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  xxl: 32
}
```

### **Border Radius:**
```javascript
{
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999
}
```

---

## 🔐 AUTHENTICATION FLOW

```
1. Launch Screen
   ↓
2. Login/Signup
   ↓
3. Onboarding (if new user)
   ↓
4. Explore Tab (Main Screen)
```

**Test Login:**
- POST `/api/auth/test-login` with any email
- Returns user object
- Store auth token (if using sessions/cookies)

---

## 💾 KEY DATA STRUCTURES

### **User Object:**
```javascript
{
  id: "uuid",
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  birth_date: "1995-01-15",
  photos: ["url1", "url2"],
  bio: "...",
  location: "New York",
  job_title: "Engineer",
  industry: "Technology",
  interests: ["hiking", "music"],
  super_likes: 5,
  profile_boosts: 2,
  star_coins: 150,
  is_premium: false,
  age_preference_min: 25,
  age_preference_max: 35,
  max_distance: 50
}
```

### **Match Object:**
```javascript
{
  id: "match_uuid",
  user1_id: "user_uuid",
  user2_id: "user_uuid",
  matched_at: "2024-01-15T10:30:00Z",
  compatibility_score: 75,
  user1: { User object },
  user2: { User object }
}
```

---

## 🔌 API ENDPOINTS (Backend Stays Same!)

**Base URL:** `https://your-backend-url.com/api`

### **Auth:**
- POST `/auth/test-login` - Body: `{ email }`
- GET `/auth/me` - Get current user

### **Swipe:**
- GET `/users/potential-matches` - Returns array of users with `compatibility_score`
- POST `/users/like/{user_id}` - Like user
- POST `/users/pass/{user_id}` - Pass on user
- POST `/users/super-like/{user_id}` - Super like

### **Matches:**
- GET `/matches` - Get all matches
- GET `/matches/{match_id}/messages` - Get conversation
- POST `/matches/{match_id}/send` - Body: `{ content }`

### **Profile:**
- PUT `/users/me` - Update profile
- GET `/users/trending` - Get trending users

### **Subscription:**
- POST `/subscription/upgrade-to-elite` - Upgrade to Elite
- GET `/subscription/status` - Get tier info

### **Store:**
- GET `/store/items` - Get items
- POST `/store/purchase` - Body: `{ item_id }`
- POST `/store/activate` - Body: `{ item_id, item_type }`

---

## ⚡ SPECIAL FEATURES TO IMPLEMENT

### **1. Pulse³ System**

**State Management (AsyncStorage):**
```javascript
{
  pulseBoosts: 1,
  isPulsing: false,
  pulseTimeLeft: 0,      // seconds
  cooldownTime: 0,       // seconds
  lastUpdate: timestamp
}
```

**Logic:**
- Free users: 1 boost per 24 hours
- Boost duration: 30 minutes
- Persist state across app restarts
- Calculate elapsed time on app open

**UI States:**
- Available: Cyan "Pulse³" + badge with count
- Active: Brighter cyan + countdown timer
- Cooldown: Faded white + cooldown timer

### **2. Infinity Wheel Animation**

**Style: "Liquid Mathematics"**

**Sequence:**
1. Show purple-pink gradient circle (180px)
2. Display white serif ∞ symbol
3. Subtle liquid ripple rings
4. On activate: Elegant 2160° spin (2.5s)
5. Dissolve wheel, reveal clean white reward card
6. Card shows: reward name (black), amount (purple gradient)

**NO:**
- ❌ Particles, explosions, flashy effects
- ❌ Rainbow colors, casino aesthetics
- ❌ Loud sounds

**YES:**
- ✅ Smooth, sophisticated
- ✅ Minimal, elegant
- ✅ Premium banking app feel

### **3. Tier Comparison Carousel**

**Implementation:**
- Horizontal ScrollView/FlatList
- 2 square cards (full width - 32px)
- Aspect ratio 1:1
- Snap to card center
- No scroll indicators

**Merge Free Card:**
- Background: `linear-gradient(180deg, #1A1A1A, #000000)`
- Text: White
- Content: 4 feature bullets with dots

**Merge Elite Card:**
- Background: `linear-gradient(180deg, #FFF8DC, #FFE4B5)`
- Text: Black
- "Upgrade" button: Black bg, white text, top-right
- Collapsible "MORE BENEFITS" (chevron icon)

---

## 🎯 CRITICAL UX BEHAVIORS

### **Swipe Cards:**
- Must be edge-to-edge (no horizontal padding on mobile)
- Cards animate OVER fixed header (not under)
- Smooth drag gestures
- Visual feedback: "LIKE" / "NOPE" overlays during drag
- Haptic feedback on swipe complete

### **Navigation:**
- Bottom tab bar always visible
- Current tab highlighted in cyan
- Smooth tab transitions
- Tab bar transparent on Explore/Messages, dark on others

### **Profile Header:**
- Circular progress uses SVG (not image)
- Progress calculation: 10 fields × 10% each
- Gradient: `linearGradient(#00D9FF, #6C63FF)`

### **Action Cards:**
- All center-aligned
- Icons: w-6 h-6 (24px)
- Text labels: Horizontally aligned (18px fixed height containers)
- Buttons: 2px margin-top, all aligned
- Cards width: 140px

---

## 📦 ASSETS NEEDED

### **Images:**
- Merge logo: Use existing asset URL
- App icon: 1024x1024 (for app stores)
- Splash screen: 2048x2732 (iPad Pro)

### **Fonts:**
- Inter (Google Fonts or bundled)
- Times New Roman (for ∞ symbol in wheel)

### **Icons:**
- Use React Native Vector Icons or custom SVGs
- Lucide React Native (if available) for UI icons

---

## 🔧 REACT NATIVE SPECIFIC NOTES

### **Libraries to Use:**
```bash
expo install expo-font
expo install @react-navigation/native @react-navigation/bottom-tabs
expo install react-native-gesture-handler react-native-reanimated
expo install @react-native-async-storage/async-storage
expo install react-native-svg
expo install expo-haptics
```

### **Key Components:**

**Swipe Cards:**
- Use `react-native-gesture-handler` for swipe detection
- Use `react-native-reanimated` for smooth animations
- Implement `PanGestureHandler`

**Bottom Navigation:**
- Use `@react-navigation/bottom-tabs`
- Custom tab bar component
- Icons change on active state

**Infinity Wheel:**
- Use `react-native-svg` for infinity symbol
- Use `Animated` API for rotation
- CSS-like animations with Reanimated

**Pulse³ Timer:**
- Use `AsyncStorage` instead of localStorage
- Use `setInterval` for countdown
- Calculate elapsed time on app resume

---

## 🎨 STYLING APPROACH

**Use StyleSheet.create for performance:**

```javascript
const styles = StyleSheet.create({
  swipeCard: {
    width: '100%',
    height: '76%',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  }
});
```

**Gradients:**
- Use `react-native-linear-gradient` or `expo-linear-gradient`
- Example: `<LinearGradient colors={['#00D9FF', '#667eea']} />`

---

## 🔄 STATE MANAGEMENT

### **Recommended: Context API + AsyncStorage**

```javascript
// AuthContext
- currentUser
- login()
- logout()

// SwipeContext
- matches []
- currentIndex
- swipeHistory []
- handleLike()
- handlePass()
- handleUndo()

// PulseContext
- pulseBoosts
- isPulsing
- pulseTimeLeft
- activatePulse()
```

---

## ⚙️ BACKEND CONFIGURATION

**Environment Variables (.env):**
```
API_BASE_URL=https://merge-elite-app.preview.emergentagent.com/api
```

**Axios Setup:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

---

## 📊 ANALYTICS EVENTS TO TRACK

```javascript
- app_opened
- profile_viewed
- user_swiped_right
- user_swiped_left
- match_created
- message_sent
- pulse3_activated
- infinity_wheel_spun
- reward_claimed
- elite_upgrade_clicked
- elite_subscribed
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **iOS (App Store):**
- [ ] App icon (1024x1024)
- [ ] Splash screens (all sizes)
- [ ] App Store screenshots
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] App description & keywords
- [ ] Age rating (17+ for dating)
- [ ] Apple Developer account ($99/year)

### **Android (Play Store):**
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone & tablet)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Google Play Developer account ($25 one-time)

---

## 🎯 PRIORITY ORDER FOR MOBILE AGENT

**Phase 1 (Core Functionality):**
1. Authentication + Login
2. Explore tab with swipe cards
3. Profile tab (basic)
4. Bottom navigation

**Phase 2 (Engagement Features):**
5. Trending tab
6. Connections tab
7. Messages/Chat
8. AMI score modal

**Phase 3 (Premium Features):**
9. Pulse³ system with timers
10. Infinity Wheel animation
11. Subscription flow (Elite upgrade)
12. Tier comparison UI

**Phase 4 (Monetization):**
13. Store integration
14. In-app purchases setup
15. Auras/Cosmetics

---

## 📝 IMPORTANT NOTES

### **Keep Backend Unchanged:**
- All FastAPI endpoints work as-is
- MongoDB schema doesn't change
- Only frontend is rebuilt in React Native

### **Data Persistence:**
- Use `AsyncStorage` for:
  - Pulse³ timer state
  - Infinity Wheel state
  - User preferences
  - Cached profile data

### **Performance:**
- Lazy load images with `expo-image`
- Implement pagination for matches list
- Use `FlatList` with `windowSize` optimization
- Memoize components with `React.memo`

### **Testing:**
- Test on both iOS and Android simulators
- Test Pulse³ timer across app backgrounding
- Test swipe gestures on real devices
- Verify all API calls work

---

## 🎬 READY TO START

**Mobile Agent Should:**
1. Create new Expo project
2. Implement navigation structure (5 tabs)
3. Build each screen following this spec
4. Connect to existing backend APIs
5. Implement Pulse³ and Infinity Wheel
6. Add subscription flow
7. Test and deploy

**This document contains everything needed to rebuild the frontend in React Native while keeping the backend intact!**

---

**Backend URL:** `https://merge-elite-app.preview.emergentagent.com`  
**Current Web App:** Fully functional and tested  
**Mobile Port:** Ready to begin with Mobile Agent
