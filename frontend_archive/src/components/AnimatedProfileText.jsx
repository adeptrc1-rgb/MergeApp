import React from 'react';

/**
 * Animated Profile Text Component
 * Applies skin-specific text animations (glow, gradient shift, shimmer, neon pulse)
 */
export default function AnimatedProfileText({ children, animationType, glowColor, className = '' }) {
  if (!animationType) {
    return <span className={className}>{children}</span>;
  }

  // Glow animation (Galaxy)
  if (animationType === 'glow') {
    return (
      <span 
        className={`${className} animate-text-glow`}
        style={{
          textShadow: `0 0 10px ${glowColor || '#a78bfa'}, 0 0 20px ${glowColor || '#a78bfa'}60`,
        }}
      >
        {children}
      </span>
    );
  }

  // Gradient shift animation (Pastel)
  if (animationType === 'gradient_shift') {
    return (
      <span 
        className={`${className} animate-text-gradient`}
        style={{
          background: 'linear-gradient(90deg, #ffc9e5, #e5c9ff, #c9ffe5, #ffc9e5)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </span>
    );
  }

  // Shimmer animation (Zodiac)
  if (animationType === 'shimmer') {
    return (
      <span 
        className={`${className} animate-text-shimmer`}
        style={{
          background: `linear-gradient(90deg, white 0%, ${glowColor || '#ffd700'} 50%, white 100%)`,
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </span>
    );
  }

  // Neon pulse animation (Neon)
  if (animationType === 'neon_pulse') {
    return (
      <span 
        className={`${className} animate-text-neon`}
        style={{
          color: glowColor || '#00ffff',
          textShadow: `0 0 10px ${glowColor || '#00ffff'}, 0 0 20px ${glowColor || '#00ffff'}80, 0 0 30px ${glowColor || '#00ffff'}40`,
        }}
      >
        {children}
      </span>
    );
  }

  // Rainbow gradient animation (Pride)
  if (animationType === 'rainbow_gradient') {
    return (
      <span 
        className={`${className} animate-text-rainbow`}
        style={{
          background: 'linear-gradient(90deg, #e40303 0%, #ff8c00 16%, #ffed00 33%, #008026 50%, #24408e 66%, #732982 83%, #e40303 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </span>
    );
  }

  // Autism awareness gradient animation
  if (animationType === 'autism_gradient') {
    return (
      <span 
        className={`${className} animate-text-autism`}
        style={{
          background: 'linear-gradient(90deg, #0066cc 0%, #ffd700 33%, #22c55e 66%, #ef4444 100%, #0066cc 133%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </span>
    );
  }

  // Zodiac gradient animation (uses glowColor for gradient)
  if (animationType === 'zodiac_gradient' && glowColor) {
    return (
      <span 
        className={`${className}`}
        style={{
          color: glowColor,
          textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}, 0 2px 4px rgba(0,0,0,0.3)`,
          filter: `drop-shadow(0 0 10px ${glowColor})`,
          animation: 'text-pulse 3s ease-in-out infinite'
        }}
      >
        {children}
      </span>
    );
  }

  return <span className={className}>{children}</span>;
}
