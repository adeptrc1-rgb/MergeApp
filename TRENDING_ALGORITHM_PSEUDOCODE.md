# Trending Energies Algorithm - Pseudocode

## 🎯 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRENDING ENERGIES ENDPOINT                    │
│                 GET /api/users/trending-energies                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │  1. Get all users except current user       │
        │     (limit 100 for performance)             │
        └─────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │  2. For each user:                          │
        │     - Calculate Trending Energy Score       │
        │     - Calculate Zodiac Compatibility        │
        │     - Build user profile object             │
        └─────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │  3. Sort by trending_energy_score DESC      │
        └─────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │  4. Filter: keep only score >= 60          │
        └─────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │  5. Return top 20 trending users           │
        └─────────────────────────────────────────────┘
```

---

## 🧮 Trending Energy Score Calculation

```
FUNCTION calculate_trending_energy_score(user_id, user_doc):
    
    // Initialize time windows
    now = current_utc_time()
    thirty_days_ago = now - 30 days
    seven_days_ago = now - 7 days
    
    // ========================================
    // COMPONENT 1: ENGAGEMENT SCORE (35%)
    // ========================================
    
    // Query database for engagement metrics
    likes_received = COUNT(
        FROM likes 
        WHERE target_id = user_id 
        AND created_at >= thirty_days_ago
    )
    
    matches_count = COUNT(
        FROM matches 
        WHERE (user1_id = user_id OR user2_id = user_id)
        AND matched_at >= thirty_days_ago
    )
    
    replies_count = COUNT(
        FROM reply_events 
        WHERE replier_id = user_id 
        AND replied_at >= thirty_days_ago
    )
    
    // Calculate normalized engagement score (0-100)
    likes_points = MIN(likes_received, 50) / 50 * 40      // Max 40 points
    matches_points = MIN(matches_count, 20) / 20 * 35     // Max 35 points
    replies_points = MIN(replies_count, 30) / 30 * 25     // Max 25 points
    
    engagement_score = MIN(100, likes_points + matches_points + replies_points)
    
    
    // ========================================
    // COMPONENT 2: COMPATIBILITY RESONANCE (25%)
    // ========================================
    
    // Get average compatibility of recent matches
    recent_matches = AGGREGATE(
        FROM matches
        WHERE (user1_id = user_id OR user2_id = user_id)
        AND matched_at >= thirty_days_ago
        GROUP BY null
        AVERAGE compatibility_score
    )
    
    IF recent_matches.exists:
        avg_compatibility = recent_matches.avg_compatibility
    ELSE:
        avg_compatibility = 75.0  // Default if no matches
    
    // Apply 10% boost, cap at 100
    compatibility_score = MIN(100, avg_compatibility * 1.1)
    
    
    // ========================================
    // COMPONENT 3: BEHAVIOR & TRUST (25%)
    // ========================================
    
    // Extract existing scores from user document
    trust_score = user_doc.trust_score OR 70.0
    behavior_quality = user_doc.behavior_quality_30d OR 80.0
    responsiveness = user_doc.responsiveness_score OR 100.0
    
    // Weighted combination
    behavior_score = (
        trust_score * 0.5 +           // 50% weight on trust
        behavior_quality * 0.3 +      // 30% weight on behavior
        responsiveness * 0.2          // 20% weight on responsiveness
    )
    
    
    // ========================================
    // COMPONENT 4: RECENCY & ACTIVITY (15%)
    // ========================================
    
    // Part A: Last Activity Score (70%)
    last_activity = user_doc.last_spin_date OR user_doc.created_at
    
    IF last_activity.exists:
        days_since_activity = (now - last_activity).days
        
        IF days_since_activity < 1:
            activity_base_score = 100.0  // Active today
        ELSE IF days_since_activity < 3:
            activity_base_score = 85.0   // Last 3 days
        ELSE IF days_since_activity < 7:
            activity_base_score = 70.0   // This week
        ELSE IF days_since_activity < 14:
            activity_base_score = 50.0   // Last 2 weeks
        ELSE:
            activity_base_score = 30.0   // Inactive
    ELSE:
        activity_base_score = 50.0
    
    // Part B: Profile Completeness (30%)
    profile_completeness = 0
    
    IF user_doc.photos.length > 0:
        profile_completeness += 30
    
    IF user_doc.bio.exists:
        profile_completeness += 30
    
    IF user_doc.interests.length > 0:
        profile_completeness += 40
    
    // Combine both parts
    activity_score = (activity_base_score * 0.7) + (profile_completeness * 0.3)
    
    
    // ========================================
    // FINAL WEIGHTED CALCULATION
    // ========================================
    
    trending_energy_score = (
        engagement_score * 0.35 +         // 35%
        compatibility_score * 0.25 +      // 25%
        behavior_score * 0.25 +           // 25%
        activity_score * 0.15             // 15%
    )
    
    RETURN ROUND(trending_energy_score, 1)  // Round to 1 decimal

END FUNCTION
```

---

## 🎨 Frontend Flow

```
COMPONENT TrendingEnergiesTab:
    
    STATE:
        - trendingUsers = []
        - loading = true
        - activeFilter = "compatible" | "trending"
    
    ON_MOUNT:
        loadTrendingEnergies()
    
    FUNCTION loadTrendingEnergies():
        TRY:
            response = HTTP_GET("/api/users/trending-energies")
            trendingUsers = response.data
        CATCH error:
            console.error("Failed to load trending energies")
    
    RENDER:
        IF activeFilter == "trending":
            IF trendingUsers.length == 0:
                SHOW EmptyState("No trending energies yet")
            ELSE:
                FOR EACH user IN trendingUsers:
                    RENDER TrendingUserCard(
                        user,
                        showEnergyBadge = true,
                        energyScore = user.trending_energy_score
                    )
        ELSE:
            RENDER CompatibleTodayView()

END COMPONENT
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│  Frontend    │
│  (Discover)  │
└──────┬───────┘
       │
       │ HTTP GET /api/users/trending-energies
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                        Backend                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ trending_energies() endpoint                           │ │
│  │  1. Authenticate user                                  │ │
│  │  2. Get all users except current                       │ │
│  │  3. For each user:                                     │ │
│  │     └─> calculate_trending_energy_score()             │ │
│  │         ┌─────────────────────────────────────────┐   │ │
│  │         │  Query likes collection                 │   │ │
│  │         │  Query matches collection               │   │ │
│  │         │  Query reply_events collection          │   │ │
│  │         │  Read user document fields              │   │ │
│  │         │  Calculate weighted score               │   │ │
│  │         └─────────────────────────────────────────┘   │ │
│  │  4. Sort by score DESC                                 │ │
│  │  5. Filter score >= 60                                 │ │
│  │  6. Return top 20                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
       │
       │ JSON Response:
       │ [
       │   {
       │     id, name, photos, compatibility_score,
       │     trending_energy_score: 77.1
       │   },
       │   ...
       │ ]
       │
       ▼
┌──────────────┐
│  Frontend    │
│  Renders     │
│  Trending    │
│  Cards       │
└──────────────┘
```

---

## 🔄 Proposed Enhanced Flow (With Caching)

```
┌────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOB (Hourly)                      │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │  FOR EACH user IN active_users:           │
        │    score = calculate_trending_energy()    │
        │    UPDATE users SET:                      │
        │      trending_energy_score = score        │
        │      score_updated_at = now               │
        └───────────────────────────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │  CREATE INDEX on:                         │
        │    - users.trending_energy_score         │
        │    - users.score_updated_at              │
        └───────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────┐
│                   API ENDPOINT (Fast)                           │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │  GET /api/users/trending-energies         │
        │                                           │
        │  SELECT * FROM users                      │
        │  WHERE trending_energy_score >= 60       │
        │  AND score_updated_at >= now - 2 hours   │
        │  ORDER BY trending_energy_score DESC     │
        │  LIMIT 20                                │
        └───────────────────────────────────────────┘
```

**Benefits:**
- ✅ No real-time calculation (instant response)
- ✅ Single database query (not 4-5 per user)
- ✅ Scales to millions of users
- ✅ Scores update hourly (good enough for "trending")

---

## 🧪 Test Cases

### Test Case 1: High Engagement User
```
INPUT:
  - likes_received: 50
  - matches_count: 20
  - replies_count: 30
  - avg_compatibility: 90
  - trust_score: 85
  - behavior_quality: 90
  - responsiveness: 95
  - last_activity: today
  - profile: complete

EXPECTED:
  - engagement_score: 100
  - compatibility_score: 99 (90 * 1.1, capped)
  - behavior_score: 88.5
  - activity_score: 100
  - FINAL: ~95+ (well above threshold)
```

### Test Case 2: Inactive User
```
INPUT:
  - likes_received: 5
  - matches_count: 2
  - replies_count: 1
  - avg_compatibility: 75
  - trust_score: 70
  - behavior_quality: 80
  - responsiveness: 100
  - last_activity: 20 days ago
  - profile: incomplete (no bio)

EXPECTED:
  - engagement_score: ~15
  - compatibility_score: 82.5
  - behavior_score: 79
  - activity_score: ~40
  - FINAL: ~50 (below threshold, filtered out)
```

### Test Case 3: New User
```
INPUT:
  - likes_received: 0
  - matches_count: 0
  - replies_count: 0
  - avg_compatibility: 75 (default)
  - trust_score: 70 (default)
  - behavior_quality: 80 (default)
  - responsiveness: 100 (default)
  - last_activity: today
  - profile: complete

EXPECTED:
  - engagement_score: 0
  - compatibility_score: 82.5
  - behavior_score: 79
  - activity_score: 100
  - FINAL: ~54 (below threshold, needs engagement)
```

---

## 📝 Decision Logic

### Why These Weights?

```
Engagement (35%) - Largest weight
  └─> Reason: Direct measure of user popularity and attractiveness
  └─> Strong signal of "trending" status

Compatibility (25%) - Second weight
  └─> Reason: Quality over quantity - high-compatibility matches indicate good fit
  └─> Prevents showing popular but incompatible users

Behavior (25%) - Equal to compatibility
  └─> Reason: Rewards good app citizens, penalizes ghosters
  └─> Important for user experience and retention

Activity (15%) - Smallest weight
  └─> Reason: Ensures user is currently active, but not most important
  └─> Complete profiles get bonus, but doesn't override engagement
```

### Why Threshold of 60?

```
Score Distribution Expected:
  - 90-100: Superstar users (very rare)
  - 70-89: Highly engaged, good behavior (trending material)
  - 60-69: Active, decent engagement (borderline trending)
  - 40-59: Average users (not trending)
  - 0-39: New or inactive users

Threshold = 60:
  ✅ Ensures only above-average users appear
  ✅ Filters out ~80% of user base
  ✅ Makes "Trending" feel exclusive
  ❌ May show empty list if no users meet criteria (acceptable)
```

---

## 🎯 Missing Components - Implementation Priority

### 🔴 High Priority (Core Missing):

```
1. PROFILE VIEWS TRACKING
   - Add table: profile_views (viewer_id, viewed_id, viewed_at)
   - Count in last 30 days
   - Add to engagement: +15 points (max 100 views)
   
2. GHOST RATE CALCULATION
   - expired_matches = matches with no messages after 7 days
   - ghost_rate = expired_matches / total_matches
   - Reduce behavior score: behavior_score * (1 - ghost_rate * 0.3)
   
3. LAST LOGIN FIELD
   - Add to User model: last_login_at
   - Update on every API call (middleware)
   - Replace last_spin_date usage
```

### 🟡 Medium Priority (Enhancements):

```
4. WEIGHTED COMPATIBILITY AVERAGE
   - Recent matches count more
   - weight = exp(-days_ago / 15)
   - weighted_avg = sum(score * weight) / sum(weights)
   
5. ACTIVE CONVERSATIONS
   - conversations_with_replies_last_3_days
   - Add to engagement: +10 points per active chat (max 5)
   
6. SUPER LIKE BOOST
   - Count super likes received
   - super_like_points = super_likes * 2  (double value)
   - Add to likes_points in engagement
```

### 🟢 Low Priority (Nice to Have):

```
7. MESSAGE QUALITY
   - avg_message_length
   - IF avg_message_length < 10: responsiveness *= 0.9
   - IF avg_message_length > 50: responsiveness *= 1.1
   
8. MULTIPLE PHOTO BONUS
   - 1 photo: +0
   - 3-4 photos: +10
   - 5+ photos: +20
```

---

## End of Pseudocode
