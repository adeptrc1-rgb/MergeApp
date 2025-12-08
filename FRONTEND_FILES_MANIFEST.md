# 📱 Merge Dating App - Complete Frontend Architecture

## 📦 Project Structure

```
/app/frontend/
├── public/              # Static assets & PWA config
├── src/
│   ├── components/      # React components (98 files)
│   │   ├── ui/         # Shadcn UI components
│   │   ├── Home.jsx    # Main swipe screen
│   │   ├── ProfileNew.jsx  # Profile page
│   │   ├── Messages.jsx    # Chat interface
│   │   ├── Connections.jsx # Matches list
│   │   ├── Discover.jsx    # Trending users
│   │   ├── Store.jsx       # In-app purchases
│   │   ├── Settings.jsx    # User settings
│   │   ├── MergeOnboarding.jsx  # Onboarding flow
│   │   └── ... (many more)
│   ├── styles/         # CSS modules
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Helper functions
│   ├── services/       # API services
│   ├── App.js          # Main app router
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind CSS config
└── README.md
```

## 🎨 Tech Stack

**Core:**
- React 19.0.0
- React Router DOM 7.5.1
- Axios 1.8.4

**UI Framework:**
- Tailwind CSS 3.4.17
- Shadcn UI (Radix UI components)
- Lucide React (icons)

**Features:**
- Progressive Web App (PWA)
- Firebase integration
- Three.js (3D effects)
- Date-fns (date handling)

## 🗂️ Key Files Overview

### 1. Entry Points
- **src/index.js** - App initialization, PWA setup, service worker
- **src/App.js** - Router, auth context, main routes (1493 lines)

### 2. Core Pages
- **Home.jsx** - Swipe interface with animations
- **ProfileNew.jsx** - User profile with stats, wheel, settings
- **Messages.jsx** - Chat conversations list
- **Connections.jsx** - Matches and likes
- **Discover.jsx** - Trending users
- **Store.jsx** - Shop (boosts, coins, skins)

### 3. Onboarding
- **MergeOnboarding.jsx** - Multi-step onboarding flow
- **EnhancedOnboarding.jsx** - Alternative onboarding
- **TestOnboarding.jsx** - Testing version

### 4. UI Components (/components/ui/)
- buttons, cards, dialogs, modals
- form inputs, sliders, switches
- navigation, tabs, tooltips
- All from Shadcn UI library

### 5. Custom Components
- **CosmicWheel.jsx** - Spin wheel mechanic
- **BottomNav.jsx** - Navigation bar
- **LayoutWithNav.jsx** - Layout wrapper
- **MergeLogo.jsx** - App logo
- **TarotStreakCard.jsx** - Daily streak
- **PulseCubedHeader.jsx** - Profile boost UI

### 6. Styles (/styles/)
- **swipeAnimations.css** - Swipe card animations
- **swipeButtons.css** - Action button styles
- **zodiacAnimations.css** - Zodiac effects
- **premiumSkins.css** - Premium visual effects
- **theme.css** - CSS variables for theming

### 7. Utils & Services
- **utils/particleEffects.js** - Particle animations
- **utils/zodiacSeasonThemes.js** - Zodiac theming
- **services/aiConversationService.js** - AI chat

## 🎯 Core Features Implemented

### Authentication
- Google OAuth (Emergent managed)
- Facebook Login
- Test Login (development)
- Session management with cookies

### Swipe Mechanism
- Tinder-style card swiping
- Like / Pass / Super Like
- Undo functionality with VHS glitch animation
- Match detection & modal

### Profile Management
- Photo upload (up to 6 photos via Cloudinary)
- Bio, interests, lifestyle factors
- Music anthem (Spotify or Deezer)
- Premium skins & auras

### Gamification
- Infinity Wheel (daily spin)
- Pulse³ profile boosts
- Daily streak system
- Star Coins currency
- Super Likes

### Messaging
- Real-time chat interface
- Unread count badges
- Cosmic Coinflip (first message game)
- Message expiry (72 hours)

### Discovery
- Compatibility algorithm
- Trending users
- Match filters
- Photo verification badges

### Store
- Boost packs
- Super Likes bundles
- Skins & Auras
- Premium membership

## 🎨 Design System

### Colors (CSS Variables)
```css
--bg-primary: #0A0A0F          /* Dark purple-black */
--surface-default: #151520     /* Card backgrounds */
--accent-primary: #00D9FF      /* Cyan brand color */
--text-primary: #FFFFFF        /* White text */
--text-secondary: #A0A0B0      /* Gray text */
```

### Typography
- Font: System default (SF Pro, Segoe UI, etc.)
- H1: 48px (hero)
- H2: 32px (page title)
- Body: 16px
- Small: 14px

### Spacing
- Based on Tailwind's default scale
- Custom safe-area handling for iPhone

## 🔧 Build Configuration

### package.json Scripts
```json
{
  "start": "craco start",    // Dev server
  "build": "craco build",    // Production build
  "test": "craco test"       // Run tests
}
```

### Environment Variables Required
```env
REACT_APP_BACKEND_URL=https://your-api.com
```

### PWA Configuration
- **manifest.json** - App metadata
- **service-worker.js** - Offline caching
- **icons** - Multiple sizes (16px to 512px)

## 📲 Mobile-First Features

### iPhone Safe Area
```css
padding-bottom: env(safe-area-inset-bottom);
```

### Viewport Height Fix
```javascript
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
```

### Touch Gestures
- Swipe left/right on cards
- Pull-to-refresh (in some views)
- Touch-optimized button sizes

## 🎭 Animations

### Swipe Animations
- **Like**: Green glow, heart particles, rotate right
- **Pass**: Red glow, X particles, rotate left  
- **Super Like**: Blue starburst, fly up
- **Undo**: VHS glitch effect with RGB split

### Other Animations
- Match celebration with confetti
- Wheel spin physics
- Loading skeletons
- Page transitions

## 🔌 API Integration

### Base Configuration
```javascript
const API_BASE = process.env.REACT_APP_BACKEND_URL;
axios.defaults.withCredentials = true;
```

### Key Endpoints Used
```javascript
// Auth
POST /api/auth/test-login
POST /api/auth/session
GET  /api/auth/me

// Users
GET  /api/users/me
PUT  /api/users/me
POST /api/users/like/:id
POST /api/users/pass/:id
POST /api/users/super-like/:id
DELETE /api/users/undo-swipe/:id

// Matches
GET  /api/users/potential-matches
GET  /api/matches
GET  /api/users/trending

// Messages
GET  /api/messages/:matchId
POST /api/messages
GET  /api/messages/unread-count

// Store
GET  /api/store/items
POST /api/store/purchase
POST /api/users/spin
```

## 📝 Component File Sizes

**Largest Components:**
- Home.jsx: ~2000+ lines (swipe logic)
- ProfileNew.jsx: ~1800+ lines (profile features)
- Store.jsx: ~1200+ lines (shop interface)
- MergeOnboarding.jsx: ~1000+ lines (onboarding)

## 🚀 Getting Started

### Install Dependencies
```bash
cd /app/frontend
yarn install
```

### Run Development Server
```bash
yarn start
# Opens on http://localhost:3000
```

### Build for Production
```bash
yarn build
# Output in /build directory
```

## 🧪 Testing

### Test Login
Use the test login button on landing page:
- Email: test@example.com
- Auto-creates user with 50,000 coins

### Testing Tools
- React DevTools
- Chrome Lighthouse (PWA audit)
- Mobile device emulation

## 🔐 Authentication Flow

1. User clicks "Continue with Google" or "Test Login"
2. Google OAuth redirects to `/session` with session_id
3. Backend validates session and creates cookie
4. Frontend checks `/auth/me` for user data
5. If `needs_onboarding: true`, redirect to `/onboarding`
6. Otherwise, redirect to `/home`

## 📱 Navigation Structure

```
/ (Landing Page)
├── /session (OAuth handler)
├── /onboarding (First-time setup)
└── /home (Main app - protected)
    ├── /home (Swipe)
    ├── /discover (Trending)
    ├── /connections (Matches)
    ├── /messages (Chat)
    ├── /profile (User profile)
    ├── /store (Shop)
    ├── /settings (Account settings)
    └── /chat/:matchId (Conversation)
```

## 🎯 Responsive Design

### Breakpoints
- Mobile: < 768px (default, mobile-first)
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Optimizations
- Touch targets >= 44px
- Viewport meta tag configured
- Safe area insets for iPhone
- No hover states on mobile

## 🌟 Premium Features

### Skins/Auras (CSS-based)
- Cosmic Glow
- Fire Aura
- Ice Crystal
- Electric Storm
- Shadow Phantom

### Boosts
- Pulse³: 30-min profile visibility boost
- Super Likes: Priority like notification
- Rewind: Undo last swipe

## 📊 State Management

### AuthContext (Global)
- User data
- Login/logout methods
- Loading states
- Onboarding flag

### Component State (Local)
- Swipe cards stack
- Message threads
- Store items
- User preferences

## 🔄 Data Flow

```
User Action → Component → API Call → Backend → MongoDB
                ↓                        ↓
              Local State ← Update UI ← Response
```

## 🎨 Styling Approach

1. **Tailwind CSS** - Utility classes
2. **CSS Modules** - Component-specific styles
3. **CSS Variables** - Theme customization
4. **Inline Styles** - Dynamic styling

## 🐛 Known Issues (From Handoff)

1. **Profile navigation bug** - Navigation from Profile tab unreliable on some devices
2. **Facebook Login** - Requires user credentials
3. **Cache issues** - Service worker may need manual clear

## ✅ Complete File List

Run this to see all files:
```bash
cd /app/frontend && find src -type f | sort
```

Total: **98 component files** + config files
