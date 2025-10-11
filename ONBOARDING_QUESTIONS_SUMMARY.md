# A Sign App - Onboarding Questions Summary

## Complete Sign-Up Flow (6 Steps)

---

## 📝 Step 1: Name & Basic Identity

### Questions Asked:
1. **First Name** (Required)
   - Input: Text field
   - Purpose: User identification

2. **Last Name** (Optional)
   - Input: Text field
   - Purpose: Full name display

**Fields Collected:**
- `first_name` (string, required)
- `last_name` (string, optional)

---

## 🌟 Step 2: Cosmic Profile (Astrological Data)

### Questions Asked:

1. **Birth Date** (Required)
   - Input: Date picker
   - Format: MM/DD/YYYY
   - Purpose: Calculate zodiac sign (sun sign)
   - Validation: Must be in the past

2. **Birth Time** (Optional)
   - Input: Time picker
   - Purpose: Calculate rising sign (ascendant)
   - Note: "For accurate rising sign calculation"

3. **Birth Location** (Optional)
   - Input: Location search with autocomplete
   - Format: City, Country
   - Purpose: Calculate moon sign and rising sign
   - Options: 
     - New York, United States
     - Los Angeles, United States
     - London, United Kingdom
     - Paris, France
     - Tokyo, Japan
     - Sydney, Australia
     - (Searchable list)

**Fields Collected:**
- `birth_date` (date, required)
- `birth_time` (time string, optional)
- `birth_location` (object with city, country, lat, long, optional)

---

## 💕 Step 3: Identity & Dating Preferences

### Questions Asked:

1. **Gender Identity** (Required)
   - Input: Multi-select grid (2 columns)
   - Options:
     - Man
     - Woman
     - Non-binary
     - Prefer not to say
     - Self-describe (opens text input if selected)
   
2. **Open to Dating** (Required)
   - Input: Checkboxes (multiple selection allowed)
   - Options:
     - Men
     - Women
     - Non-binary people
     - All genders

3. **Orientation Visibility** (Optional)
   - Input: Checkbox toggle
   - Default: Yes (checked)
   - Question: "Show my orientation on profile"

**Fields Collected:**
- `gender_identity` (string, required)
- `gender_self_describe` (string, conditional on "self_describe")
- `open_to_dating` (array of strings, required)
- `orientation_visible` (boolean, default: true)

---

## 🎨 Step 4: Lifestyle Sliders (Core Compatibility Data)

### 8 Lifestyle Questions (All Required)
Each uses a **1-5 slider scale**

1. **Fitness & Health** 💪
   - Description: "How important is staying active and healthy?"
   - Scale: Relaxed approach (1) → Very active lifestyle (5)
   - Gradient: Green to Emerald

2. **Career Ambition** 🚀
   - Description: "How much do you prioritize career growth?"
   - Scale: Work-life balance (1) → Career focused (5)
   - Gradient: Blue to Indigo

3. **Social Energy** 🎉
   - Description: "Do you prefer quiet nights in or nights out?"
   - Scale: Quiet nights in (1) → Love going out (5)
   - Gradient: Purple to Pink

4. **Travel & Adventure** ✈️
   - Description: "How important is travel and new experiences?"
   - Scale: Homebody (1) → Adventure seeker (5)
   - Gradient: Orange to Red

5. **Nightlife & Drinking** 🍷
   - Description: "How often do you enjoy partying or drinking?"
   - Scale: Rarely drink/party (1) → Love nightlife (5)
   - Gradient: Violet to Purple

6. **Family & Future** 👨‍👩‍👧‍👦
   - Description: "How important is family life and having kids?"
   - Scale: Not a priority (1) → Very important (5)
   - Gradient: Pink to Rose

7. **Dating Approach** 💕
   - Description: "Do you prefer to take things slow or dive in fast?"
   - Scale: Take it slow (1) → Dive in fast (5)
   - Gradient: Red to Pink

8. **Passions & Hobbies** 🎨
   - Description: "How central are your hobbies to your life?"
   - Scale: Casual interests (1) → Life revolves around passions (5)
   - Gradient: Amber to Orange

**Fields Collected:**
- `lifestyle_sliders` (object with 8 key-value pairs)
  - Each slider: 1-5 integer value
  - Default: 3 (neutral) for all

---

## 👤 Step 5: About You (Profile Details)

### Questions Asked:

1. **Industry** (Optional)
   - Input: Dropdown select
   - Options:
     - Technology
     - Healthcare
     - Finance
     - Education
     - Creative/Arts
     - Marketing
     - Sales
     - Engineering
     - Legal
     - Consulting
     - Hospitality
     - Retail
     - Non-profit
     - Government
     - Student
     - Other

2. **Relationship Goals** (Required)
   - Input: Grid selection (2x2)
   - Options:
     - Something casual 😊
     - Long-term relationship 💕
     - New friends 👫
     - Figuring it out 🤔

3. **Bio** (Optional)
   - Input: Textarea (multi-line)
   - Placeholder: "Tell us about yourself, your passions, what you're looking for..."
   - Limit: 500 characters
   - Note: "This helps potential matches understand your personality"

4. **Interests & Hobbies** (Optional)
   - Input: Text field
   - Placeholder: "e.g., Yoga, Photography, Cooking, Travel"
   - Format: Comma-separated values
   - Note: "Separate with commas"

**Fields Collected:**
- `industry` (string, optional)
- `relationship_goals` (string, required)
- `bio` (string, max 500 chars, optional)
- `interests` (string, comma-separated, optional)

---

## 📸 Step 6: Photos (Required)

### Questions Asked:

1. **Face Photo** (Required)
   - Input: Image upload
   - Description: "Clear photo of your face"
   - Max size: 5MB
   - Format: Any image format

2. **Full Length Photo** (Required)
   - Input: Image upload
   - Description: "Full body photo"
   - Max size: 5MB
   - Format: Any image format

3. **Lifestyle Photo** (Required)
   - Input: Image upload
   - Description: "Photo showing your personality or hobbies"
   - Max size: 5MB
   - Format: Any image format

**Fields Collected:**
- `profile_photos` (object)
  - `face_photo` (base64 string, required)
  - `body_photo` (base64 string, required)
  - `lifestyle_photo` (base64 string, required)

**Validation:**
- All 3 photos are required to complete onboarding
- Alert shown if any photo is missing

---

## 🎯 Default Preferences (Not Asked, Auto-Set)

These are set automatically and can be adjusted later in app settings:

- `age_range_min`: 21 years old
- `age_range_max`: 40 years old
- `max_distance_km`: 80 km (50 miles)
- `max_distance_miles`: 50 miles
- `current_location`: Auto-detected via geolocation (or set to default)

---

## ❌ What's NOT Currently Asked

### Missing Compatibility Data:

1. **Myers-Briggs Personality Type (MBTI)**
   - NOT collected at all
   - Would need 16 personality types:
     - INTJ, INTP, ENTJ, ENTP
     - INFJ, INFP, ENFJ, ENFP
     - ISTJ, ISFJ, ESTJ, ESFJ
     - ISTP, ISFP, ESTP, ESFP

2. **Big Five Personality Traits**
   - NOT collected
   - Would measure: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism

3. **Specific Lifestyle Questions**
   - NOT collected:
     - Smoking habits
     - Drinking frequency (only nightlife slider exists)
     - Drug use
     - Diet preferences (vegan, vegetarian, etc.)
     - Exercise frequency
     - Religion/spirituality
     - Political views
     - Want kids? (only family importance slider exists)
     - Have kids already?
     - Pet preferences
     - Education level

4. **Values & Beliefs**
   - NOT collected:
     - Core values ranking
     - Deal-breakers
     - Must-haves in a partner
     - Communication style preferences

---

## 📊 Data Collection Summary

### ✅ Currently Collected (18 data points):

**Basic Identity:**
1. First name (required)
2. Last name (optional)

**Astrological:**
3. Birth date (required)
4. Birth time (optional)
5. Birth location (optional)

**Identity & Preferences:**
6. Gender identity (required)
7. Open to dating (required)
8. Orientation visibility (optional)

**Lifestyle (8 sliders):**
9. Fitness & health
10. Career ambition
11. Social energy
12. Travel & adventure
13. Nightlife & drinking
14. Family & future
15. Dating approach
16. Passions & hobbies

**Profile:**
17. Industry (optional)
18. Relationship goals (required)
19. Bio (optional)
20. Interests (optional)

**Photos:**
21. 3 photos (all required)

### ❌ NOT Currently Collected:

- Myers-Briggs type
- Big Five traits
- Specific lifestyle details (smoking, drugs, diet, religion, politics)
- Values & beliefs questionnaire
- Deal-breakers
- Education level
- Detailed kids preferences
- Pet preferences

---

## 🔄 Data Flow

```
Step 1: Name
  ↓
Step 2: Astrological Data
  ↓
Step 3: Identity & Dating Preferences
  ↓
Step 4: Lifestyle Sliders (8 questions)
  ↓
Step 5: Profile Details (bio, interests, goals)
  ↓
Step 6: Photos (3 required)
  ↓
Submit to Backend → Profile Created
```

---

## 📈 Compatibility Algorithm Current Usage

**Currently Used in Compatibility:**
- ✅ Birth date → Zodiac sign (sun sign)
- ✅ Birth time → Rising sign (if provided)
- ✅ Birth location → Moon sign (if provided)
- ❌ Lifestyle sliders → **NOT USED**
- ❌ Interests → **NOT USED** (collected but ignored)
- ❌ Bio → **NOT USED**
- ❌ Relationship goals → **NOT USED**

**Compatibility is 100% zodiac-based:**
- Sun sign compatibility
- Moon sign polarity bonus
- Rising sign polarity bonus
- Element affinity (Fire/Air, Earth/Water)

---

## 💡 Recommendations for Enhancement

### Priority 1: Add Myers-Briggs Questions (4 questions)

Based on the 4 dichotomies, ask 4 questions:

1. **Energy Source**
   - "Where do you get your energy?"
   - Options: Socializing with others (E) | Spending time alone (I)

2. **Information Processing**
   - "How do you prefer to take in information?"
   - Options: Focus on facts and details (S) | Focus on patterns and possibilities (N)

3. **Decision Making**
   - "How do you make decisions?"
   - Options: Based on logic and analysis (T) | Based on values and feelings (F)

4. **Lifestyle Approach**
   - "How do you approach your life?"
   - Options: Planned and organized (J) | Spontaneous and flexible (P)

Result: One of 16 types (e.g., INTJ, ENFP, etc.)

### Priority 2: Integrate Lifestyle Sliders into Compatibility

Calculate lifestyle compatibility score based on:
- Distance between slider values
- Weight important dimensions more (e.g., family_future, dating_approach)

### Priority 3: Integrate Interests Matching

Use Jaccard similarity:
```
similarity = (common_interests) / (total_unique_interests)
```

---

## 📝 Summary

**Total Questions Asked:** ~25-30 questions across 6 steps

**Time to Complete:** 5-10 minutes

**Required Questions:** 8 (name, birth date, gender, dating preferences, relationship goals, 3 photos)

**Optional Questions:** 17-22 (all others)

**Data Used in Compatibility:** Only 3 (sun sign, moon sign, rising sign)

**Data Collected but Unused:** 15+ (lifestyle sliders, interests, bio, etc.)

---

**Conclusion:** The onboarding collects extensive lifestyle and personality data, but compatibility matching currently only uses astrological data. Significant opportunity exists to enhance the algorithm by integrating the collected but unused data (lifestyle sliders, interests) and adding Myers-Briggs personality typing.
