/**
 * AI Conversation Starter Service
 * Integrates with OpenAI GPT-4 to generate personalized conversation starters
 */

import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Get cached AI starters from localStorage
 */
const getCachedStarters = (cacheKey) => {
  try {
    const cached = localStorage.getItem(`ai_starters_${cacheKey}`);
    if (!cached) return null;
    
    const { starters, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      return starters;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(`ai_starters_${cacheKey}`);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Save AI starters to localStorage
 */
const cacheStarters = (cacheKey, starters) => {
  try {
    const cacheData = {
      starters,
      timestamp: Date.now()
    };
    localStorage.setItem(`ai_starters_${cacheKey}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

/**
 * Generate fallback template-based starters
 */
const generateFallbackStarters = (user1, user2, cosmicInsights) => {
  const starters = [];
  
  // Starter 1: Zodiac-based
  starters.push(
    `Hey ${user2.first_name}! Fellow ${user2.zodiac_sign}—what's your cosmic vibe today? ✨`
  );
  
  // Starter 2: Interest-based (if available)
  if (user2.interests && user2.interests.length > 0) {
    const interest = user2.interests[0];
    starters.push(
      `${interest}? Tell me more! I'm intrigued by your energy 🌙`
    );
  } else {
    starters.push(
      `Your profile caught my eye—what adventure should we talk about first? 🌟`
    );
  }
  
  // Starter 3: Compatibility-based
  if (cosmicInsights.tier === 'high') {
    starters.push(
      `The stars say we're ${cosmicInsights.element1}+${cosmicInsights.element2}—let's see if they're right! 💫`
    );
  } else {
    starters.push(
      `${user2.zodiac_sign} energy is fascinating—what makes you you? ⭐`
    );
  }
  
  return starters;
};

/**
 * Generate AI conversation starters using OpenAI GPT-4
 * @param {Object} currentUser - Current user's profile data
 * @param {Object} matchUser - Matched user's profile data
 * @param {Object} cosmicInsights - Generated cosmic insights object
 * @param {boolean} forceNew - Force new generation, bypass cache
 * @returns {Promise<Array<string>>} Array of 3 conversation starters
 */
export const generateAIConversationStarters = async (
  currentUser,
  matchUser,
  cosmicInsights,
  forceNew = false
) => {
  // Create unique cache key based on both user IDs
  const cacheKey = [currentUser.id, matchUser.id].sort().join('_');
  
  // Check cache first (unless force new)
  if (!forceNew) {
    const cached = getCachedStarters(cacheKey);
    if (cached) {
      console.log('Using cached AI starters');
      return cached;
    }
  }
  
  try {
    // Prepare user data for prompt
    const user1Data = {
      name: currentUser.first_name || 'User',
      age: currentUser.age || 'unknown',
      sign: currentUser.zodiac_sign || 'unknown',
      interests: (currentUser.interests || []).slice(0, 3).join(', ') || 'not specified',
      bio: currentUser.bio || 'no bio'
    };
    
    const user2Data = {
      name: matchUser.first_name || 'Match',
      age: matchUser.age || 'unknown',
      sign: matchUser.zodiac_sign || 'unknown',
      interests: (matchUser.interests || []).slice(0, 3).join(', ') || 'not specified',
      bio: matchUser.bio || 'no bio'
    };
    
    // Construct detailed prompt for GPT-4
    const prompt = `You are a witty, astrology-savvy dating coach creating conversation starters for a cosmic dating app called "A Sign."

USER PROFILES:
User 1 (sender): ${user1Data.name}, ${user1Data.age}, ${user1Data.sign}
Interests: ${user1Data.interests}
Bio: ${user1Data.bio}

User 2 (recipient): ${user2Data.name}, ${user2Data.age}, ${user2Data.sign}
Interests: ${user2Data.interests}
Bio: ${user2Data.bio}

COSMIC INSIGHTS:
- Elemental Pairing: ${cosmicInsights.element1} + ${cosmicInsights.element2}
- Compatibility Tier: ${cosmicInsights.tier}
- Insight: "${cosmicInsights.elementalInsight}"

TASK: Create 3 flirty, engaging conversation starters that ${user1Data.name} can send to ${user2Data.name}.

REQUIREMENTS:
✅ Maximum 15 words per starter
✅ Reference their cosmic insights, zodiac signs, or shared interests naturally
✅ Casual, low-pressure tone—playful and warm
✅ Include a question or call-to-action
✅ Use emojis sparingly (1-2 max)
✅ Avoid: sexual content, pickup lines, generic phrases like "Hey"

OUTPUT FORMAT: Return ONLY 3 conversation starters, one per line, numbered 1-3.

Example good starters:
1. Fellow fire sign—what's your wildest adventure? Let's compare notes ✨
2. I see you're into [interest]. Best memory related to that? 🌙
3. ${cosmicInsights.tier === 'high' ? 'High cosmic compatibility alert!' : 'Our elements intrigue me'} Coffee to explore this? ☕

Now create 3 unique starters for ${user1Data.name} → ${user2Data.name}:`;

    // Call backend AI endpoint
    const response = await axios.post(
      `${API}/ai/conversation-starters`,
      {
        prompt,
        currentUser: user1Data,
        matchUser: user2Data,
        cosmicInsights
      },
      {
        timeout: 15000,
        withCredentials: true
      }
    );
    
    if (response.data && response.data.starters) {
      const starters = response.data.starters;
      
      // Cache the results
      cacheStarters(cacheKey, starters);
      
      // Track successful generation
      trackAIGeneration('success', cacheKey);
      
      return starters;
    }
    
    throw new Error('Invalid response from AI service');
    
  } catch (error) {
    console.error('AI generation failed:', error);
    
    // Track failure
    trackAIGeneration('error', null, error.message);
    
    // Return fallback starters
    const fallbackStarters = generateFallbackStarters(currentUser, matchUser, cosmicInsights);
    return fallbackStarters;
  }
};

/**
 * Track AI generation analytics
 */
const trackAIGeneration = (status, cacheKey = null, errorMessage = null) => {
  try {
    const analyticsKey = 'ai_generation_analytics';
    const analytics = JSON.parse(localStorage.getItem(analyticsKey) || '{"generations": []}');
    
    analytics.generations.push({
      timestamp: Date.now(),
      status,
      cacheKey,
      errorMessage
    });
    
    // Keep only last 100 events
    if (analytics.generations.length > 100) {
      analytics.generations = analytics.generations.slice(-100);
    }
    
    localStorage.setItem(analyticsKey, JSON.stringify(analytics));
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

/**
 * Track when a starter is used
 */
export const trackStarterUsed = (matchId, starterIndex, starterText) => {
  try {
    const analyticsKey = 'ai_starter_usage';
    const analytics = JSON.parse(localStorage.getItem(analyticsKey) || '{"usage": []}');
    
    analytics.usage.push({
      timestamp: Date.now(),
      matchId,
      starterIndex,
      starterText: starterText.substring(0, 50) // Truncate for storage
    });
    
    // Keep only last 100 events
    if (analytics.usage.length > 100) {
      analytics.usage = analytics.usage.slice(-100);
    }
    
    localStorage.setItem(analyticsKey, JSON.stringify(analytics));
  } catch (error) {
    console.error('Usage tracking failed:', error);
  }
};

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = () => {
  try {
    const genAnalytics = JSON.parse(localStorage.getItem('ai_generation_analytics') || '{"generations": []}');
    const usageAnalytics = JSON.parse(localStorage.getItem('ai_starter_usage') || '{"usage": []}');
    
    const totalGenerations = genAnalytics.generations.length;
    const successfulGenerations = genAnalytics.generations.filter(g => g.status === 'success').length;
    const totalUsage = usageAnalytics.usage.length;
    
    // Calculate most popular starter index
    const starterIndexCounts = {};
    usageAnalytics.usage.forEach(u => {
      starterIndexCounts[u.starterIndex] = (starterIndexCounts[u.starterIndex] || 0) + 1;
    });
    
    const mostPopularIndex = Object.keys(starterIndexCounts).reduce((a, b) => 
      starterIndexCounts[a] > starterIndexCounts[b] ? a : b, '0'
    );
    
    return {
      totalGenerations,
      successfulGenerations,
      successRate: totalGenerations > 0 ? (successfulGenerations / totalGenerations * 100).toFixed(1) : 0,
      totalStartersUsed: totalUsage,
      usageRate: totalGenerations > 0 ? (totalUsage / (totalGenerations * 3) * 100).toFixed(1) : 0,
      mostPopularStarterPosition: parseInt(mostPopularIndex) + 1
    };
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return null;
  }
};

/**
 * Clear cache for a specific match
 */
export const clearCache = (user1Id, user2Id) => {
  const cacheKey = [user1Id, user2Id].sort().join('_');
  localStorage.removeItem(`ai_starters_${cacheKey}`);
};

export default {
  generateAIConversationStarters,
  trackStarterUsed,
  getAnalyticsSummary,
  clearCache
};
