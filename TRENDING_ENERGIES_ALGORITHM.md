# Trending Energies Algorithm - Complete Documentation

## 🎯 Purpose
Show users whose "energy" is trending based on engagement, compatibility, and positive behavior within the app. Unlike popularity-driven algorithms (e.g., Tinder's Top Picks), this reflects both **activity and cosmic alignment**.

---

## 📊 Algorithm Overview

### Final Score Formula
```
Trending Energy Score (0-100) = 
    (Engagement Score × 35%) + 
    (Compatibility Resonance × 25%) + 
    (Behavior & Trust × 25%) + 
    (Recency & Activity × 15%)
```

### Minimum Threshold
- Only users with `Trending Energy Score >= 60` appear in results
- Results sorted in descending order (highest energy first)
- Maximum 20 users returned

---

## 🔢 Component Breakdown

### 1️⃣ ENGAGEMENT SCORE (35% Weight)

**Purpose:** Measure user popularity and interaction within the app

**Data Sources:**
- `db.likes` collection (likes received in last 30 days)
- `db.matches` collection (matches created in last 30 days)
- `db.reply_events` collection (message responses in last 30 days)

**Current Implementation:**
```python
# Time window
thirty_days_ago = now - timedelta(days=30)

# Query 1: Likes received
likes_received = await db.likes.count_documents({
    "target_id": user_id,
    "created_at": {"$gte": thirty_days_ago.isoformat()}
})

# Query 2: Matches
matches_count = await db.matches.count_documents({
    "$or": [{"user1_id": user_id}, {"user2_id": user_id}],
    "matched_at": {"$gte": thirty_days_ago.isoformat()}
})

# Query 3: Message responses
replies_count = await db.reply_events.count_documents({
    "replier_id": user_id,
    "replied_at": {"$gte": thirty_days_ago.isoformat()}
})

# Calculate normalized score (0-100)
engagement_score = min(100, (
    (min(likes_received, 50) / 50 * 40) +  # Max 40 points from likes
    (min(matches_count, 20) / 20 * 35) +   # Max 35 points from matches
    (min(replies_count, 30) / 30 * 25)     # Max 25 points from replies
))
```

**Point Distribution:**
- Likes: 0-40 points (capped at 50 likes)
- Matches: 0-35 points (capped at 20 matches)
- Replies: 0-25 points (capped at 30 replies)

**What's Missing/Could Be Added:**
- ❌ Profile saves/bookmarks (not implemented)
- ❌ Super likes received (could add extra weight)
- ❌ Profile views count (not tracked)
- ❌ Direct message usage (not factored in)

---

### 2️⃣ COMPATIBILITY RESONANCE (25% Weight)

**Purpose:** Measure quality of connections (not just quantity)

**Data Sources:**
- `db.matches` collection (compatibility scores from recent matches)

**Current Implementation:**
```python
# MongoDB aggregation pipeline
pipeline = [
    {
        "$match": {
            "$or": [{"user1_id": user_id}, {"user2_id": user_id}],
            "matched_at": {"$gte": thirty_days_ago.isoformat()}
        }
    },
    {
        "$group": {
            "_id": None,
            "avg_compatibility": {"$avg": "$compatibility_score"}
        }
    }
]

compat_result = await db.matches.aggregate(pipeline).to_list(1)
avg_compatibility = compat_result[0]["avg_compatibility"] if compat_result else 75.0

# Apply 10% boost and cap at 100
compatibility_score = min(100, avg_compatibility * 1.1)
```

**Logic:**
- Average compatibility score of all matches in last 30 days
- Default to 75.0 if no matches
- 10% boost to reward high compatibility
- Capped at 100

**What's Missing/Could Be Added:**
- ❌ Weighted average (recent matches count more)
- ❌ Bonus for consistently high compatibility (e.g., all matches > 85%)
- ❌ Penalty for low-compatibility matches that expired
- ❌ Consider zodiac element harmony trends

---

### 3️⃣ BEHAVIOR & TRUST (25% Weight)

**Purpose:** Reward good behavior and penalize ghosting/negative actions

**Data Sources:**
- `User.trust_score` (field in user document)
- `User.behavior_quality_30d` (field in user document)
- `User.responsiveness_score` (field in user document)

**Current Implementation:**
```python
# Extract scores from user document
trust_score = user_doc.get("trust_score", 70.0)
behavior_quality = user_doc.get("behavior_quality_30d", 80.0)
responsiveness = user_doc.get("responsiveness_score", 100.0)

# Weighted combination
behavior_score = (
    trust_score * 0.5 +           # 50% weight
    behavior_quality * 0.3 +      # 30% weight
    responsiveness * 0.2          # 20% weight
)
```

**Sub-components:**

**Trust Score (50% of Behavior):**
- Base: 70.0
- Adjusted by: match completion rate, penalties, positive feedback
- **Fields used:** `trust_score`

**Behavior Quality (30% of Behavior):**
- Base: 80.0
- Measures: ghosting rate, negative reports, blocking behavior
- **Fields used:** `behavior_quality_30d`

**Responsiveness (20% of Behavior):**
- Base: 100.0
- Measures: reply speed, conversation engagement
- **Fields used:** `responsiveness_score`

**What's Missing/Could Be Added:**
- ❌ Ghost rate calculation (not actively computed)
- ❌ Report/block count (not factored in)
- ❌ Message quality indicators (one-word replies vs meaningful)
- ❌ Redemption opportunities after penalties

---

### 4️⃣ RECENCY & ACTIVITY (15% Weight)

**Purpose:** Prioritize active, recently-engaged users with complete profiles

**Data Sources:**
- `User.last_spin_date` or fallback to `created_at` (last activity timestamp)
- `User.photos`, `User.bio`, `User.interests` (profile completeness)

**Current Implementation:**

**Part A: Last Activity Score (70% of Activity)**
```python
last_activity_str = user_doc.get("last_spin_date") or user_doc.get("created_at")
activity_score = 50.0  # default

if last_activity_str:
    last_activity = datetime.fromisoformat(last_activity_str.replace("Z", "+00:00"))
    days_since_activity = (now - last_activity).days
    
    if days_since_activity < 1:
        activity_score = 100.0  # Active today
    elif days_since_activity < 3:
        activity_score = 85.0   # Active in last 3 days
    elif days_since_activity < 7:
        activity_score = 70.0   # Active this week
    elif days_since_activity < 14:
        activity_score = 50.0   # Active in last 2 weeks
    else:
        activity_score = 30.0   # Less active
```

**Part B: Profile Completeness (30% of Activity)**
```python
profile_completeness = 0
if user_doc.get("photos") and len(user_doc.get("photos", [])) > 0:
    profile_completeness += 30
if user_doc.get("bio"):
    profile_completeness += 30
if user_doc.get("interests") and len(user_doc.get("interests", [])) > 0:
    profile_completeness += 40

# Combine both parts
activity_score = (activity_score * 0.7 + profile_completeness * 0.3)
```

**Profile Completeness Breakdown:**
- Photos: 30 points
- Bio: 30 points
- Interests: 40 points
- Total possible: 100 points

**What's Missing/Could Be Added:**
- ❌ Dedicated `last_login` timestamp (currently using `last_spin_date`)
- ❌ Recent profile updates (new photos, bio edits)
- ❌ Multiple photo bonus (1 photo vs 5+ photos)
- ❌ Prompt completion (if you have astrology prompts)
- ❌ Active conversation count (currently messaging)
- ❌ Recent swipe activity (active browsing)

---

## 📋 Database Collections Used

### Required Collections:
1. **`users`** - User profiles with all score fields
2. **`likes`** - Tracks who liked whom (with `created_at`)
3. **`matches`** - Tracks successful matches (with `matched_at`, `compatibility_score`)
4. **`reply_events`** - Tracks message responses (with `replied_at`)

### Collection Schemas:

```javascript
// likes collection
{
    liker_id: "uuid",
    target_id: "uuid",
    created_at: "ISO timestamp"
}

// matches collection
{
    id: "uuid",
    user1_id: "uuid",
    user2_id: "uuid",
    matched_at: "ISO timestamp",
    compatibility_score: 85.2  // 0-100
}

// reply_events collection
{
    replier_id: "uuid",
    match_id: "uuid",
    replied_at: "ISO timestamp",
    response_time_seconds: 3600
}
```

---

## 🎨 Frontend Integration

**Endpoint:** `GET /api/users/trending-energies`

**Response Format:**
```json
[
    {
        "id": "uuid",
        "first_name": "Alex",
        "last_name": "Smith",
        "zodiac_sign": "Aries",
        "birth_date": "1995-03-21",
        "photos": ["https://..."],
        "current_location": {"latitude": 34.05, "longitude": -118.24},
        "compatibility_score": 86.5,
        "trending_energy_score": 77.1  // NEW FIELD
    },
    ...
]
```

**UI Features:**
- Filter toggle: "Compatible Today" vs "Trending Energies"
- Golden "⚡ X% Energy" badge on cards
- Golden ring around profile photos
- "✨ Trending" indicator
- Sorted by energy score (highest first)

---

## 🔍 What's Currently Working

✅ **Engagement tracking** (likes, matches, replies in 30 days)
✅ **Compatibility resonance** (average of recent match compatibility)
✅ **Behavior scores** (trust, quality, responsiveness from user fields)
✅ **Activity recency** (days since last spin/login)
✅ **Profile completeness** (photos, bio, interests)
✅ **Threshold filtering** (only score >= 60 shown)
✅ **Sorting** (descending by energy score)
✅ **Top 20 limit**

---

## 🚧 What's Missing / Could Be Enhanced

### High-Impact Additions:

1. **Profile Views Tracking**
   - Add `profile_views` count to engagement
   - Track who viewed whom
   - Weight: +15 points in engagement

2. **Super Likes Received**
   - Count super likes as higher-value engagement
   - Weight: 2x regular like value

3. **Ghost Rate Calculation**
   - Track expired matches with no messages
   - Reduce behavior score proportionally
   - Formula: `ghost_rate = expired_matches / total_matches`

4. **Weighted Compatibility Average**
   - Recent matches count more than old matches
   - Exponential decay over 30 days
   - Formula: `weight = e^(-days_ago / 15)`

5. **Dedicated Last Login Timestamp**
   - Create `last_login_at` field
   - Track every app open, swipe, or interaction
   - More accurate than `last_spin_date`

6. **Profile Update Recency**
   - Track `profile_updated_at`
   - Bonus points for recent updates (new photos, bio edits)
   - Weight: +10 points in activity

7. **Active Conversation Indicator**
   - Count ongoing conversations (replied in last 3 days)
   - Add to engagement score
   - Weight: +10 points per active conversation (max 5)

### Medium-Impact Additions:

8. **Message Quality Score**
   - Analyze message length, response depth
   - Penalize one-word replies
   - Boost meaningful conversations

9. **Swipe Activity**
   - Track swipes in last 7 days
   - Active swipers get activity boost
   - Weight: +5-10 points

10. **Photo Quality/Quantity**
    - 1 photo: baseline
    - 3+ photos: +10 points
    - 5+ photos: +20 points

11. **Premium User Boost**
    - Small bonus for premium users (optional)
    - Encourages subscriptions
    - Weight: +5 points

12. **Redemption Score Integration**
    - Use existing `redemption_score_30d` field
    - Reward users who improve after penalties
    - Weight: bonus multiplier (1.0-1.2x)

---

## 📈 Performance Considerations

**Current Performance:**
- ❌ **Calculates score for ALL users on every request** (inefficient)
- Processing ~100 users per request
- Multiple database queries per user (4-5 queries)

**Optimization Recommendations:**

1. **Cache Trending Scores**
   - Store scores in `User` model: `trending_energy_score`, `score_updated_at`
   - Update hourly/daily via background job
   - Serve from cache, not real-time calculation

2. **Batch Processing**
   - Calculate scores for all users once per hour
   - Use background worker (Celery, FastAPI Background Tasks)
   - Only recalculate on trigger events (new match, reply, etc.)

3. **Indexed Queries**
   - Add indexes on:
     - `likes.created_at`
     - `matches.matched_at`
     - `reply_events.replied_at`
     - `users.trending_energy_score`

4. **Limit Candidate Pool**
   - Only calculate for users active in last 14 days
   - Skip users with `trending_energy_score < 50` (persistent low scorers)

---

## 🧪 Testing & Validation

**Current Test Results:**
- ✅ Test user with 25 likes, 10 matches, 15 replies → 77.1 score
- ✅ Existing users with low activity → 47-50 score (correctly filtered out)
- ✅ Threshold filtering works (only >= 60 shown)
- ✅ Sorting by score works (descending)

**Test Scenarios to Add:**
1. User with 50+ likes, 20+ matches → should hit max engagement (100)
2. User with ghosting behavior → should have reduced behavior score
3. User inactive for 30+ days → should have low activity score
4. User with incomplete profile → should have reduced activity score

---

## 💡 Example Score Calculation

**Hypothetical User:**
- Likes received (30 days): 25
- Matches (30 days): 10
- Replies (30 days): 15
- Avg compatibility: 82.5
- Trust score: 75.0
- Behavior quality: 85.0
- Responsiveness: 95.0
- Last activity: 2 days ago
- Profile: photos ✅, bio ✅, interests ✅

**Calculation:**
```
Engagement = ((25/50)*40 + (10/20)*35 + (15/30)*25) = 20 + 17.5 + 12.5 = 50.0

Compatibility = min(100, 82.5 * 1.1) = 90.75

Behavior = (75*0.5 + 85*0.3 + 95*0.2) = 37.5 + 25.5 + 19 = 82.0

Activity = (85*0.7 + 100*0.3) = 59.5 + 30 = 89.5

Final Score = (50*0.35 + 90.75*0.25 + 82*0.25 + 89.5*0.15)
            = 17.5 + 22.69 + 20.5 + 13.43
            = 74.1 ✅ (Above threshold, will appear in Trending)
```

---

## 🎯 Summary: What You Need to Add

### Priority 1 (Core Missing Features):
- [ ] Profile views tracking
- [ ] Ghost rate calculation
- [ ] Dedicated `last_login_at` field
- [ ] Caching system (store scores, update hourly)

### Priority 2 (Enhancements):
- [ ] Weighted compatibility average (recent matches count more)
- [ ] Active conversation tracking
- [ ] Profile update recency bonus
- [ ] Super like weight boost
- [ ] Multiple photo bonus

### Priority 3 (Nice to Have):
- [ ] Message quality analysis
- [ ] Swipe activity tracking
- [ ] Premium user boost
- [ ] Redemption score integration

### Infrastructure:
- [ ] Background job for score calculation
- [ ] Database indexes for performance
- [ ] Limit candidate pool (active users only)

---

## 📝 Current Code Location

**Backend:**
- Function: `calculate_trending_energy_score()` (lines 782-891 in `/app/backend/server.py`)
- Endpoint: `GET /api/users/trending-energies` (lines 917-954 in `/app/backend/server.py`)

**Frontend:**
- Component: `/app/frontend/src/components/Discover.jsx`
- Functions: `loadTrendingEnergies()`, filter toggle UI

**User Model:**
- Location: Lines 60-104 in `/app/backend/server.py`
- Relevant fields: `trust_score`, `behavior_quality_30d`, `responsiveness_score`, `last_spin_date`
