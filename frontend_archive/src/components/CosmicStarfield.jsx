/**
 * Cosmic Starfield Component
 * Subtle, barely noticeable animated stars for cosmic atmosphere
 */

import React, { useMemo } from 'react';

const CosmicStarfield = () => {
  // Generate random star data once on mount
  const stars = useMemo(() => {
    const starCount = 12; // 10-15 stars
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      size: Math.random() * 2 + 1, // 1-3px
      top: Math.random() * 100, // Random vertical position (%)
      left: Math.random() * 100, // Random horizontal position (%)
      duration: Math.random() * 300 + 200, // 200-500s animation duration (extremely slow)
      delay: Math.random() * -100, // Random start time
      direction: Math.random() > 0.5 ? 1 : -1 // Random direction
    }));
  }, []);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.03)', // 3% opacity
            top: `${star.top}%`,
            left: `${star.left}%`,
            animation: `cosmicDrift${star.direction > 0 ? 'Right' : 'Left'} ${star.duration}s linear ${star.delay}s infinite`,
            willChange: 'transform'
          }}
        />
      ))}
    </div>
  );
};

export default CosmicStarfield;
