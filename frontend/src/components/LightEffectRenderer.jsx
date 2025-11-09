import React from 'react';

/**
 * Light Effect Renderer
 * Applies external glow effects AROUND/BEHIND the card
 * Lights create box-shadows, glows, and effects outside the card boundary
 */
export default function LightEffectRenderer({ lightEffect }) {
  if (!lightEffect) return null;

  const { type, color, colors, intensity } = lightEffect;

  // Aurora - Multiple colored glows that shift
  if (type === 'aurora') {
    const [color1, color2, color3] = colors || ['#00ff88', '#00ffff', '#8800ff'];
    
    // Special handling for Pride Rainbow (6 colors) - Strobe effect
    if (intensity === 'vibrant' && colors && colors.length === 6) {
      return {
        animation: 'pride-strobe 3s linear infinite'
      };
    }
    
    // Special handling for Autism Awareness (4 colors) - Strobe effect
    if (intensity === 'awareness' && colors && colors.length === 4) {
      return {
        animation: 'autism-strobe 2.4s linear infinite'
      };
    }
    
    // Standard aurora (3 colors)
    return {
      boxShadow: `
        0 0 30px ${color1}60,
        0 0 60px ${color2}40,
        0 0 90px ${color3}20,
        0 0 120px ${color1}10
      `,
      animation: 'aurora-shimmer 4s ease-in-out infinite'
    };
  }

  // Cosmic Glow - Soft purple pulsing glow
  if (type === 'glow') {
    const glowColor = color || '#a78bfa';
    const intensityMap = {
      soft: '0 0 20px {color}50, 0 0 40px {color}30, 0 0 60px {color}10',
      medium: '0 0 30px {color}60, 0 0 60px {color}40, 0 0 90px {color}20',
      high: '0 0 40px {color}70, 0 0 80px {color}50, 0 0 120px {color}30'
    };
    const shadowTemplate = intensityMap[intensity] || intensityMap.medium;
    return {
      boxShadow: shadowTemplate.replace(/{color}/g, glowColor),
      animation: 'cosmic-pulse 3s ease-in-out infinite'
    };
  }

  // Fire Aura - Warm flickering glow
  if (type === 'flames') {
    const [color1, color2] = colors || ['#ff6600', '#ffaa00'];
    return {
      boxShadow: `
        0 0 25px ${color1}60,
        0 0 50px ${color1}40,
        0 0 75px ${color2}30,
        0 0 100px ${color2}20
      `,
      animation: 'flame-flicker 2s ease-in-out infinite'
    };
  }

  // Moonbeam - Soft cool light rays
  if (type === 'rays') {
    const rayColor = color || '#e0e7ff';
    return {
      boxShadow: `
        0 -20px 40px ${rayColor}40,
        0 0 30px ${rayColor}30,
        0 0 60px ${rayColor}20
      `,
      animation: 'moonbeam-pulse 4s ease-in-out infinite'
    };
  }

  // Starfield - Twinkling star-like particles around card
  if (type === 'particles') {
    return {
      boxShadow: `
        0 0 20px #ffffff40,
        0 0 40px #a78bfa30,
        0 0 60px #ffffff20
      `,
      animation: 'starfield-twinkle 3s ease-in-out infinite'
    };
  }

  return null;
}
