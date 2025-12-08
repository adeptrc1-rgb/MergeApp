# 🎯 Key Frontend Files - Priority List for React Native Migration

## 🔴 CRITICAL (Must Convert First)

### 1. Authentication & Routing
- `/src/App.js` (1493 lines) - Main router, auth context, protected routes
- `/src/index.js` (58 lines) - Entry point, PWA setup
- `/src/components/LoginApp.jsx` - Login UI
- `/src/components/FacebookLoginButton.jsx` - Facebook OAuth

### 2. Onboarding Flow
- `/src/components/MergeOnboarding.jsx` (~1000 lines) - Complete onboarding
  - Birth date, personality test, MBTI, lifestyle
  - Deal breakers, photo upload
  - Multi-step form logic

### 3. Main Swipe Screen
- `/src/components/Home.jsx` (~2000 lines) - **MOST IMPORTANT**
  - Swipe card interface
  - Like/Pass/Super Like logic
  - Undo functionality
  - Match detection
  - Compatibility score display
  - Animation triggers

### 4. Profile Screen
- `/src/components/ProfileNew.jsx` (~1800 lines)
  - User stats cards
  - Infinity Wheel integration
  - Pulse³ boost UI
  - Photo editor modal
  - Settings access

### 5. Matches & Connections
- `/src/components/Connections.jsx` - Matches list
- `/src/components/Likes.jsx` - Users who liked you

### 6. Messaging
- `/src/components/Messages.jsx` - Conversation list
- `/src/components/AstroChat.jsx` - Chat interface
- `/src/components/SynchronizedCosmicFlip.jsx` - First message game

### 7. Discovery
- `/src/components/Discover.jsx` - Trending users screen

### 8. Store/Shop
- `/src/components/Store.jsx` (~1200 lines) - In-app purchases
  - Boost packs
  - Super Likes
  - Skins/Auras
  - Premium membership

### 9. Navigation
- `/src/components/BottomNav.jsx` - Tab bar navigation
- `/src/components/LayoutWithNav.jsx` - Layout wrapper

## 🟡 IMPORTANT (Convert Second)

### 10. Gamification Features
- `/src/components/CosmicWheel.jsx` - Spin wheel
- `/src/components/QuantumInfinityWheel.jsx` - Enhanced wheel
- `/src/components/TarotStreakCard.jsx` - Daily streak UI
- `/src/components/PulseCubedHeader.jsx` - Profile boost header

### 11. Profile Components
- `/src/components/EditProfileModal.jsx` - Edit profile
- `/src/components/PhotoEditorModal.jsx` - Photo management
- `/src/components/MusicConnect.jsx` - Music anthem selector
- `/src/components/SpotifyConnect.jsx` - Spotify integration

### 12. Settings
- `/src/components/Settings.jsx` - Account settings
  - Discovery preferences
  - Notifications
  - Privacy settings

## 🟢 NICE TO HAVE (Convert Later)

### 13. Alternative Dashboards (testing/alternatives)
- `/src/components/EnhancedDashboard.jsx`
- `/src/components/ModernDashboard.jsx`
- `/src/components/AstroMatchDashboard.jsx`
- `/src/components/MainDashboard.jsx`

### 14. Visual Effects
- `/src/components/CosmicStarfield.jsx` - Background effects
- `/src/components/PremiumSkinRenderer.jsx` - Skin rendering
- `/src/components/LightEffectRenderer.jsx` - Light effects
- `/src/components/AnimatedProfileText.jsx` - Text animations

### 15. UI Components (Shadcn/Radix)
**All files in `/src/components/ui/`**
- button.jsx
- card.jsx
- dialog.jsx
- input.jsx
- slider.jsx
- toast.jsx
- (40+ more components)

*Note: For React Native, use native equivalents or React Native UI library*

## 📱 Styles to Convert

### Critical CSS Files
1. `/src/styles/swipeAnimations.css` - **MUST CONVERT**
   - Card swipe animations
   - Like/Pass/Super Like effects
   - VHS glitch undo animation

2. `/src/styles/swipeButtons.css` - Button styles

3. `/src/index.css` - Global styles, CSS variables

4. `/src/App.css` - App-level styles

### Optional CSS
- `/src/styles/zodiacAnimations.css` - Zodiac effects
- `/src/styles/premiumSkins.css` - Premium visual effects
- `/src/styles/cosmicStarfield.css` - Background effects
- `/src/styles/theme.css` - Theme variables

## 🛠️ Utils & Helpers

### Essential Utils
- `/src/utils/particleEffects.js` - Particle animations
- `/src/utils/zodiacSeasonThemes.js` - Theming logic
- `/src/utils/cosmicTemplates.js` - Templates
- `/src/lib/utils.js` - Helper functions

### Services
- `/src/services/aiConversationService.js` - AI chat (optional)

### Hooks
- `/src/hooks/use-toast.js` - Toast notifications

## 📋 Configuration Files

### Build Config
- `package.json` - Dependencies (convert to React Native equivalents)
- `tailwind.config.js` - Design tokens (convert to theme object)
- `jsconfig.json` - Path aliases
- `craco.config.js` - Build customization

### PWA Config (Not Needed for React Native)
- `/public/manifest.json`
- `/public/service-worker.js`

## 🎨 Assets

### Icons & Images
- `/public/logo-*.png` - App icons (various sizes)
- `/public/favicon-*.png` - Web favicons (skip for native)

## 📊 File Size Reference

**Largest Files (Lines of Code):**
1. Home.jsx: ~2000 lines
2. ProfileNew.jsx: ~1800 lines
3. App.js: 1493 lines
4. Store.jsx: ~1200 lines
5. MergeOnboarding.jsx: ~1000 lines

**Total Component Files:** 96 JSX files

## 🚀 Migration Priority Order

### Week 1: Foundation
1. App.js → App.tsx (navigation structure)
2. Auth context → React Navigation auth flow
3. LoginApp.jsx → Login screen
4. MergeOnboarding.jsx → Onboarding screens

### Week 2: Core Features
5. Home.jsx → Swipe screen (MOST COMPLEX)
6. BottomNav.jsx → Tab navigator
7. Connections.jsx → Matches list
8. ProfileNew.jsx → Profile screen

### Week 3: Social Features
9. Messages.jsx → Chat list
10. AstroChat.jsx → Chat screen
11. Discover.jsx → Trending screen

### Week 4: Gamification & Store
12. CosmicWheel.jsx → Wheel component
13. Store.jsx → Shop screens
14. Settings.jsx → Settings screen

### Week 5: Polish
15. All animations
16. Premium features
17. Error handling
18. Testing

## 💡 Conversion Tips

### JSX → React Native
```javascript
// Web (JSX)
<div className="container">
  <h1 className="text-2xl">Title</h1>
  <button onClick={handleClick}>Click</button>
</div>

// React Native
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
  <TouchableOpacity onPress={handleClick}>
    <Text>Click</Text>
  </TouchableOpacity>
</View>
```

### CSS → StyleSheet
```javascript
// Web (Tailwind)
className="bg-blue-500 rounded-lg p-4"

// React Native
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16
  }
});
```

### React Router → React Navigation
```javascript
// Web
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/profile');

// React Native
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();
navigation.navigate('Profile');
```

## 📞 Where to Find What

**Looking for swipe logic?** → Home.jsx (lines 1-500)
**Looking for animations?** → styles/swipeAnimations.css
**Looking for API calls?** → App.js (axios setup)
**Looking for auth flow?** → App.js (AuthContext, lines 51-140)
**Looking for compatibility calc?** → Home.jsx (uses backend API)
**Looking for match modal?** → Home.jsx (showMatchModal state)
**Looking for profile stats?** → ProfileNew.jsx (top section)
**Looking for wheel spin?** → CosmicWheel.jsx
**Looking for chat UI?** → AstroChat.jsx

## ✅ Checklist for Each File

When converting a component:
- [ ] Replace HTML elements with React Native components
- [ ] Convert CSS classes to StyleSheet
- [ ] Replace React Router with React Navigation
- [ ] Update event handlers (onClick → onPress)
- [ ] Handle image sources (require vs URL)
- [ ] Test on iOS and Android
- [ ] Verify animations work
- [ ] Check responsive layout

