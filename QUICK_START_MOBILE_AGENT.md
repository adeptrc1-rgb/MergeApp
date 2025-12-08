# 🚀 Quick Start Guide for Mobile Agent

## What You're Getting

A fully documented **Merge Dating App** ready for React Native rebuild.

---

## 📁 Files Included

### Documentation
- **`MOBILE_AGENT_HANDOFF.md`** ← START HERE
  - Complete feature specifications
  - API endpoints (all working)
  - Design system
  - Algorithms
  - User flows
  - Everything you need!

### Backend (Ready to Use)
- **`/app/backend/server.py`**
  - FastAPI backend (keep as-is)
  - All endpoints implemented and tested
  - MongoDB integration
  - Just point your React Native app to this API

### Frontend Reference (Web App)
- `/app/frontend/src/components/Home.jsx` - Swipe screen logic
- `/app/frontend/src/components/ProfileNew.jsx` - Profile screen
- `/app/frontend/src/components/Messages.jsx` - Chat interface
- `/app/frontend/src/components/Likes.jsx` - Connections screen
- `/app/frontend/src/components/Discover.jsx` - Trending screen
- `/app/frontend/src/styles/` - CSS (convert to React Native styles)

---

## 🎯 Your Task

**Rebuild the frontend in React Native/Expo while keeping the backend**

### What to Keep:
✅ Backend API (FastAPI + MongoDB)
✅ All endpoints and logic
✅ Database schema
✅ Authentication flow
✅ Compatibility algorithms

### What to Rebuild:
🔨 Frontend → React Native/Expo
🔨 React components → React Native components
🔨 CSS → React Native StyleSheet
🔨 React Router → React Navigation
🔨 Web APIs → React Native APIs

---

## 📋 Step-by-Step Process

### 1. Read the Main Document
Open **`MOBILE_AGENT_HANDOFF.md`** and read:
- [ ] Executive Summary
- [ ] Core Features (all 8 sections)
- [ ] API Endpoints
- [ ] Design System
- [ ] Algorithms

### 2. Set Up React Native Project
```bash
npx create-expo-app MergeApp
cd MergeApp
```

### 3. Install Key Dependencies
```bash
npx expo install react-navigation
npx expo install @react-navigation/native
npx expo install @react-navigation/stack
npx expo install @react-navigation/bottom-tabs
npx expo install react-native-gesture-handler
npx expo install react-native-reanimated
npx expo install axios
npx expo install @react-native-async-storage/async-storage
npx expo install expo-image-picker
```

### 4. Start with Priority Order

**Week 1: Authentication & Core**
- [ ] Login/Register screens
- [ ] API connection test
- [ ] Token storage (AsyncStorage)
- [ ] Basic navigation structure

**Week 2: Swipe Screen**
- [ ] Card component
- [ ] Swipe gestures
- [ ] Like/Pass/Super Like buttons
- [ ] Fetch matches from API
- [ ] Basic animations

**Week 3: Social Features**
- [ ] Matches screen
- [ ] Messages list
- [ ] Chat interface
- [ ] Profile screen

**Week 4: Advanced Features**
- [ ] Trending screen
- [ ] Store/Shop
- [ ] Infinity Wheel
- [ ] Settings

**Week 5: Polish**
- [ ] Animations (VHS glitch, particles)
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

### 5. Reference the Web Components

When building each screen, look at the corresponding `.jsx` file for:
- State management patterns
- API calls
- Data structures
- Business logic

**Example:**
Building swipe screen? Look at `Home.jsx`:
- See how matches are fetched
- How swipe actions are handled
- Compatibility calculation
- Undo logic

### 6. API Integration

**Base URL:** Point to the existing backend
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

**All endpoints are documented in the main doc!**

Each section has:
- Endpoint URL
- Request method
- Request body (if any)
- Response format
- Example usage

### 7. Test with Existing Backend

The backend is **LIVE and WORKING**. You can test immediately:
```bash
# Test login
curl -X POST https://backend-url/api/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test fetch matches
curl https://backend-url/api/matches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Design System Summary

**Colors:**
- Primary: `#00D9FF` (cyan)
- Background: `#0A0A0F` (dark purple-black)
- Text: `#FFFFFF`
- Success: `#4CAF50`
- Error: `#EF4444`

**Typography:**
- Hero: 48px
- Title: 32px
- Body: 16px
- Small: 14px

**All details in main document!**

---

## 🔑 Critical Features

### Must Work on Day 1:
1. ✅ Login/Register
2. ✅ Swipe screen
3. ✅ Like/Pass functionality
4. ✅ View matches
5. ✅ Basic messaging

### Can Come Later:
- Trending algorithm
- Infinity Wheel
- Store/purchases
- Advanced animations

---

## 🐛 Common Issues & Solutions

### "API not responding"
- Check backend is running
- Verify API URL is correct
- Check CORS settings if needed

### "Authentication failing"
- Token format: `Bearer {token}`
- Store token in AsyncStorage
- Pass in headers for protected routes

### "Swipe not working"
- Use `react-native-gesture-handler`
- Follow Expo docs for gesture setup
- Test on real device (simulator gestures are different)

### "Images not loading"
- Use Expo's `Image` component
- Compress images before upload
- Add fallback image

---

## 📞 Need Help?

### Check These First:
1. **Main doc** (`MOBILE_AGENT_HANDOFF.md`) - Has everything
2. **Backend code** (`server.py`) - See exact API implementation
3. **Web components** - Reference logic and patterns

### Backend API:
- Location: `/app/backend/server.py`
- All endpoints listed in main doc
- MongoDB queries shown in code

### Frontend Patterns:
- Look at existing React components
- Convert web patterns to React Native
- Similar logic, different rendering

---

## ✅ Success Criteria

Your React Native app should:
- [ ] Login and register users
- [ ] Fetch and display matches
- [ ] Allow swiping (like/pass)
- [ ] Show compatibility scores
- [ ] Create matches on mutual likes
- [ ] Send and receive messages
- [ ] Display user profile
- [ ] Navigate between screens smoothly

---

## 🚀 Ready to Start!

1. Open **`MOBILE_AGENT_HANDOFF.md`**
2. Read features section
3. Set up React Native project
4. Start with authentication
5. Build swipe screen
6. Add messaging
7. Polish and test

**The backend is done. Just build the mobile frontend!**

---

## 📦 What's NOT Included

These need external services (get credentials):
- Google OAuth (need Google client ID)
- Facebook Login (need Facebook app ID)
- Payment processing (need Stripe keys)
- Push notifications (need Firebase)

Everything else is ready to go! 🎉
