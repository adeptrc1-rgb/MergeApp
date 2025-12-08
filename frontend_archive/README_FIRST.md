# 🚀 Merge Dating App - Frontend Complete Package

## What's Included

This archive contains the **complete frontend** of the Merge dating app PWA.

### 📁 Directory Structure
- **/src** - All React components, hooks, utils
- **/public** - Static assets, PWA manifest, service worker
- **package.json** - All dependencies
- **tailwind.config.js** - Tailwind CSS configuration
- **All other config files**

### 📋 Quick Reference Documents
- **MOBILE_AGENT_HANDOFF.md** - Complete feature specs for React Native
- **QUICK_START_MOBILE_AGENT.md** - Quick start guide
- **FRONTEND_FILES_MANIFEST.md** - Architecture overview

### 🎯 For React Native Migration

**What to Keep:**
- Business logic from components
- State management patterns
- API integration approach
- Data structures

**What to Convert:**
- JSX → React Native components
- CSS/Tailwind → StyleSheet
- React Router → React Navigation
- Web APIs → React Native APIs

### 🔑 Key Components to Review

1. **Home.jsx** - Swipe mechanism
2. **ProfileNew.jsx** - Profile features
3. **Messages.jsx** - Chat interface
4. **MergeOnboarding.jsx** - Onboarding flow
5. **Store.jsx** - In-app purchases

### 📡 Backend API

Point your React Native app to:
```
BASE_URL/api/*
```

All endpoints documented in MOBILE_AGENT_HANDOFF.md

### 🎨 Design System

**Colors:**
- Primary: #00D9FF (cyan)
- Background: #0A0A0F (dark)
- Text: #FFFFFF

**Spacing:** Tailwind scale (4, 8, 16, 24, 32px)

**Components:** Based on Radix UI primitives

### 🚀 Next Steps

1. Read **MOBILE_AGENT_HANDOFF.md** thoroughly
2. Set up React Native/Expo project
3. Install dependencies from their equivalents
4. Start with authentication flow
5. Build swipe screen
6. Implement remaining features

### 📞 Support

Reference the backend at `/app/backend/server.py` for API details.

Happy building! 🎉
