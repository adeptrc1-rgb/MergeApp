/**
 * Zodiac Season Theme Configuration
 * Defines colors, gradients, and motion types for each zodiac sign
 */

export const ZODIAC_SEASON_THEMES = {
  aries: {
    name: 'Aries',
    element: 'Fire',
    colors: ['#FF6A00', '#FFD5B5'],
    motionType: 'breathing',
    duration: '8s',
    accentColor: '#FF8533',
    opacity: 0.25
  },
  taurus: {
    name: 'Taurus',
    element: 'Earth',
    colors: ['#A8C686', '#F4E3C2'],
    motionType: 'pulse',
    duration: '10s',
    accentColor: '#C5D9A4',
    opacity: 0.25
  },
  gemini: {
    name: 'Gemini',
    element: 'Air',
    colors: ['#7EC8E3', '#C8A8E3'],
    motionType: 'flicker',
    duration: '9s',
    accentColor: '#98D0E8',
    opacity: 0.25
  },
  cancer: {
    name: 'Cancer',
    element: 'Water',
    colors: ['#D7F4FF', '#AEE5E5'],
    motionType: 'ripple',
    duration: '10s',
    accentColor: '#C3ECEF',
    opacity: 0.25
  },
  leo: {
    name: 'Leo',
    element: 'Fire',
    colors: ['#FFD86A', '#FFB347'],
    motionType: 'flare',
    duration: '9s',
    accentColor: '#FFD090',
    opacity: 0.28
  },
  virgo: {
    name: 'Virgo',
    element: 'Earth',
    colors: ['#B6CFA5', '#E4E6D5'],
    motionType: 'sweep',
    duration: '12s',
    accentColor: '#CCD9BD',
    opacity: 0.25
  },
  libra: {
    name: 'Libra',
    element: 'Air',
    colors: ['#F6D6E5', '#D7C4F0'],
    motionType: 'mirror-fade',
    duration: '10s',
    accentColor: '#E6CDEA',
    opacity: 0.25
  },
  scorpio: {
    name: 'Scorpio',
    element: 'Water',
    colors: ['#9B4D72', '#DAA0B8'],
    motionType: 'pulsation',
    duration: '8s',
    accentColor: '#BA76A0',
    opacity: 0.26
  },
  sagittarius: {
    name: 'Sagittarius',
    element: 'Fire',
    colors: ['#FF7F50', '#6A5ACD'],
    motionType: 'streak',
    duration: '12s',
    accentColor: '#B36C8E',
    opacity: 0.27
  },
  capricorn: {
    name: 'Capricorn',
    element: 'Earth',
    colors: ['#4B4B4B', '#C0C0C0'],
    motionType: 'shimmer',
    duration: '11s',
    accentColor: '#858585',
    opacity: 0.24
  },
  aquarius: {
    name: 'Aquarius',
    element: 'Air',
    colors: ['#00FFFF', '#7FFFD4'],
    motionType: 'orbital',
    duration: '13s',
    accentColor: '#3FFFD9',
    opacity: 0.26
  },
  pisces: {
    name: 'Pisces',
    element: 'Water',
    colors: ['#D8BFD8', '#AFEEEE'],
    motionType: 'drift',
    duration: '11s',
    accentColor: '#C3D7E3',
    opacity: 0.25
  }
};

/**
 * Determines current zodiac season based on date
 * @param {Date} date - The date to check (defaults to current date)
 * @returns {string} Zodiac sign key (lowercase)
 */
export function getCurrentZodiacSeason(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Zodiac date ranges
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';

  return 'leo'; // Default fallback
}

/**
 * Gets theme for a specific zodiac sign
 * @param {string} sign - Zodiac sign (lowercase)
 * @returns {object} Theme object with colors, motion, etc.
 */
export function getZodiacTheme(sign) {
  const normalizedSign = sign?.toLowerCase();
  return ZODIAC_SEASON_THEMES[normalizedSign] || ZODIAC_SEASON_THEMES.leo;
}

/**
 * Generates CSS gradient string from theme colors
 * @param {object} theme - Theme object
 * @param {number} angle - Gradient angle in degrees (default 135)
 * @returns {string} CSS gradient string
 */
export function getGradientString(theme, angle = 135) {
  return `linear-gradient(${angle}deg, ${theme.colors[0]}, ${theme.colors[1]})`;
}
