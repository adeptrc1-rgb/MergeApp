/**
 * Cosmic Templates System
 * Poetic phrases for elemental pairings and compatibility tiers
 */

export const ELEMENTAL_PAIRINGS = {
  // Fire + Fire: Passionate, intense, explosive energy
  'Fire+Fire': [
    "Two flames dance together—passion ignites, but balance is key to keep the fire alive.",
    "Your spirits burn bright in unison. Channel this intensity into shared adventures.",
    "Like twin stars, your energy radiates powerfully—just remember to give each other space to breathe."
  ],
  
  // Fire + Earth: Grounding vs. spontaneity
  'Fire+Earth': [
    "Fire warms the earth, earth grounds the flame—you bring stability to their spark, they bring excitement to your world.",
    "Your steady nature can anchor their wild energy, while they inspire you to take bold leaps.",
    "A cosmic dance of passion and patience—where fire meets earth, magic can bloom."
  ],
  
  // Fire + Air: Amplifying energy
  'Fire+Air': [
    "Air feeds fire, creating a blaze of possibility—your connection sparks endless inspiration.",
    "Together you're unstoppable: their ideas fuel your action, your passion brings their dreams to life.",
    "Like wind and wildfire, you amplify each other's energy—adventure awaits where you meet."
  ],
  
  // Fire + Water: Steam and transformation
  'Fire+Water': [
    "Fire and water create steam—transformation through contrast. Your differences can forge deep intimacy.",
    "You bring warmth to their depths, they bring emotional wisdom to your fire—opposites that heal.",
    "Where passion meets emotion, intensity blooms—navigate with care and watch magic unfold."
  ],
  
  // Earth + Earth: Solid foundation
  'Earth+Earth': [
    "Two mountains stand together—your shared values build an unshakeable foundation.",
    "Grounded, loyal, and steady—you understand each other's need for security and growth.",
    "Your connection is a garden: nurture it with patience and watch it flourish for years to come."
  ],
  
  // Earth + Air: Growth through contrast
  'Earth+Air': [
    "Earth provides roots while air brings perspective—you teach each other balance between dreaming and doing.",
    "Your practicality meets their vision, creating a partnership where ideas take tangible form.",
    "Like a tree in the wind, you're grounded yet flexible—together you weather any storm."
  ],
  
  // Earth + Water: Natural harmony
  'Earth+Water': [
    "Water nourishes earth, creating fertile ground for love to bloom—your connection flows naturally.",
    "You build the foundation, they provide emotional depth—together you create a sanctuary.",
    "Like a river shaping stone, your bond deepens gently over time—trust the process."
  ],
  
  // Air + Air: Mental connection
  'Air+Air': [
    "Two minds, endless conversations—your intellectual bond creates a playground of ideas.",
    "You speak the same language of curiosity and freedom—just remember to ground your flights together.",
    "Like two birds in flight, you soar together—communication is your superpower."
  ],
  
  // Air + Water: Emotional intelligence meets intellect
  'Air+Water': [
    "Air carries water as mist—you blend logic with feeling, creating emotional intelligence together.",
    "Your thoughts meet their intuition, forming a bridge between mind and heart.",
    "Like clouds over the ocean, you flow between thinking and feeling—honor both perspectives."
  ],
  
  // Water + Water: Deep emotional resonance
  'Water+Water': [
    "Two oceans merge—your emotional depths mirror each other, creating profound intimacy.",
    "You feel what the other feels, a psychic bond of empathy—just remember to maintain your own shores.",
    "Like twin rivers flowing to the sea, your souls recognize each other's currents."
  ]
};

// Compatibility tier phrases
export const COMPATIBILITY_TIERS = {
  high: [
    "The stars align beautifully for you two—your energies harmonize in rare and magical ways.",
    "Cosmic chemistry at its finest—the universe is basically shipping you together.",
    "Your astrological blueprint suggests exceptional compatibility—destiny may be at play here.",
    "The celestial bodies smile upon this pairing—something special is written in the stars."
  ],
  
  medium: [
    "Your cosmic connection shows promise—with effort and understanding, something beautiful can grow.",
    "The stars suggest intrigue—you'll challenge and complement each other in equal measure.",
    "A balanced cosmic dance awaits—your differences could be the key to exciting growth.",
    "The universe presents an interesting pairing—explore with curiosity and open hearts."
  ],
  
  low: [
    "Your energies contrast boldly—if you're both willing to learn, this could be transformative.",
    "The cosmos hints at challenges, but opposites can attract for profound reasons—stay curious.",
    "Your paths diverge astrologically, yet sometimes the unexpected connections teach us the most.",
    "This pairing requires conscious effort—but the best love stories often start with cosmic tension."
  ]
};

// Moon sign depth phrases (optional enhancement)
export const MOON_INSIGHTS = {
  'Fire+Fire': "Your emotional cores burn with similar intensity—passionate but potentially volatile.",
  'Fire+Earth': "Emotional expression meets emotional stability—find the middle ground.",
  'Fire+Air': "Your feelings are openly expressed and intellectually processed—a harmonious blend.",
  'Fire+Water': "Emotional spontaneity meets emotional depth—learn each other's languages.",
  'Earth+Earth': "Security-seeking souls—you both crave stability in love.",
  'Earth+Air': "Emotional steadiness meets emotional detachment—respect the differences.",
  'Earth+Water': "Practical care meets emotional nurturing—a naturally supportive bond.",
  'Air+Air': "You both need space and mental connection—intellectual intimacy is key.",
  'Air+Water': "Rational feelings meet intuitive emotions—a fascinating contrast.",
  'Water+Water': "Psychic connection alert—you may feel each other's moods deeply."
};

/**
 * Get element from zodiac sign
 */
export const getElement = (sign) => {
  const elements = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  };
  return elements[sign] || 'Fire';
};

/**
 * Generate cosmic insights from template system
 */
export const generateCosmicInsights = (user1Sign, user2Sign, compatibilityScore) => {
  const element1 = getElement(user1Sign);
  const element2 = getElement(user2Sign);
  
  // Create pairing key (alphabetically sorted for consistency)
  const pairingKey = [element1, element2].sort().join('+');
  
  // Get elemental pairing phrases
  const elementalPhrases = ELEMENTAL_PAIRINGS[pairingKey] || ELEMENTAL_PAIRINGS['Fire+Fire'];
  const randomElementalPhrase = elementalPhrases[Math.floor(Math.random() * elementalPhrases.length)];
  
  // Determine compatibility tier
  let tier = 'low';
  if (compatibilityScore >= 80) tier = 'high';
  else if (compatibilityScore >= 60) tier = 'medium';
  
  // Get tier phrase
  const tierPhrases = COMPATIBILITY_TIERS[tier];
  const randomTierPhrase = tierPhrases[Math.floor(Math.random() * tierPhrases.length)];
  
  return {
    elementalInsight: randomElementalPhrase,
    compatibilityInsight: randomTierPhrase,
    element1,
    element2,
    tier,
    pairingKey
  };
};

/**
 * Get a random phrase from a specific category
 */
export const getRandomPhrase = (category, subcategory = null) => {
  let phrases = [];
  
  if (category === 'elemental' && subcategory) {
    phrases = ELEMENTAL_PAIRINGS[subcategory] || [];
  } else if (category === 'compatibility' && subcategory) {
    phrases = COMPATIBILITY_TIERS[subcategory] || [];
  }
  
  if (phrases.length === 0) return '';
  return phrases[Math.floor(Math.random() * phrases.length)];
};

export default {
  ELEMENTAL_PAIRINGS,
  COMPATIBILITY_TIERS,
  MOON_INSIGHTS,
  generateCosmicInsights,
  getElement,
  getRandomPhrase
};
