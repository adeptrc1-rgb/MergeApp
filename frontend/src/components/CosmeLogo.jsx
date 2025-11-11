/**
 * Cosme Logo Component
 * Minimalist wordmark with orbital dot icon
 */

import React from 'react';

const CosmeLogo = ({ className = '', size = 'md', showGradient = true }) => {
  // Size configurations
  const sizes = {
    sm: { height: 24, iconSize: 16, fontSize: 'text-base', gap: 8 },
    md: { height: 32, iconSize: 24, fontSize: 'text-xl', gap: 10 },
    lg: { height: 40, iconSize: 32, fontSize: 'text-2xl', gap: 12 },
    xl: { height: 48, iconSize: 40, fontSize: 'text-3xl', gap: 14 }
  };

  const config = sizes[size] || sizes.md;
  const iconSize = config.iconSize;
  const dotRadius = iconSize * 0.25; // Central dot is 1/4 of icon size
  const orbitRadius = iconSize * 0.4; // Orbit radius
  const strokeWidth = iconSize * 0.04; // Thin elegant stroke
  const center = iconSize / 2;

  // Calculate arc path for 3/4 orbital ring (270 degrees, leaving 90-degree gap at top)
  const startAngle = 135; // Start from bottom-left
  const endAngle = 45; // End at top-right, leaving gap at top
  
  const startX = center + orbitRadius * Math.cos((startAngle * Math.PI) / 180);
  const startY = center + orbitRadius * Math.sin((startAngle * Math.PI) / 180);
  const endX = center + orbitRadius * Math.cos((endAngle * Math.PI) / 180);
  const endY = center + orbitRadius * Math.sin((endAngle * Math.PI) / 180);

  return (
    <div className={`flex items-center ${className}`} style={{ gap: `${config.gap}px` }}>
      {/* Orbital Dot Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox={`0 0 ${iconSize} ${iconSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Define gradient for the central dot (optional) */}
        {showGradient && (
          <defs>
            <linearGradient id="cosmeDotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" /> {/* Purple */}
              <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
            </linearGradient>
          </defs>
        )}

        {/* 3/4 Orbital Ring - incomplete circle with gap at top */}
        <path
          d={`M ${startX} ${startY} A ${orbitRadius} ${orbitRadius} 0 1 1 ${endX} ${endY}`}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Central Celestial Dot */}
        <circle
          cx={center}
          cy={center}
          r={dotRadius}
          fill={showGradient ? "url(#cosmeDotGradient)" : "#FFFFFF"}
        />
      </svg>

      {/* Wordmark */}
      <span
        className={`font-light tracking-wide ${config.fontSize}`}
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          color: '#FFFFFF',
          letterSpacing: '0.05em'
        }}
      >
        cosme
      </span>
    </div>
  );
};

export default CosmeLogo;
