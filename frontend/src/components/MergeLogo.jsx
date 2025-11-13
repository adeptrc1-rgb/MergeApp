/**
 * Merge Logo Component
 * Pure text-based wordmark with custom 'rg' ligature
 * The 'r' descender flows seamlessly into the 'g' body
 * Clean, geometric sans-serif (Inter SemiBold)
 */

import React from 'react';

const MergeLogo = ({ 
  className = '', 
  size = 'md',
  color = '#FFFFFF'
}) => {
  // Size configurations
  const sizes = {
    sm: { fontSize: '18px', letterSpacing: '-0.5px' },
    md: { fontSize: '24px', letterSpacing: '-0.5px' },
    lg: { fontSize: '32px', letterSpacing: '-0.8px' },
    xl: { fontSize: '40px', letterSpacing: '-1px' }
  };

  const config = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${className}`}>
      {/* "merge" wordmark with custom rg ligature */}
      <svg
        viewBox="0 0 200 50"
        style={{ height: config.fontSize }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* m */}
        <text
          x="5"
          y="35"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="32"
          fontWeight="600"
          fill={color}
          letterSpacing="-0.5"
        >
          me
        </text>
        
        {/* Custom rg ligature - r's descender flows into g */}
        <g transform="translate(58, 0)">
          {/* r with extended descender */}
          <path
            d="M 2 35 L 2 15 L 5 15 L 5 19 C 6 16, 8 14, 12 14 C 14 14, 16 15, 17 16 L 15 19 C 14 18, 13 18, 11 18 C 8 18, 5 20, 5 24 L 5 35 L 2 35 Z M 5 35 Q 5 38, 7 40"
            fill={color}
            stroke={color}
            strokeWidth="0.5"
          />
          
          {/* g connected to r's descender */}
          <path
            d="M 7 40 Q 9 42, 12 42 C 18 42, 22 38, 22 32 L 22 16 L 19 16 L 19 20 C 18 17, 16 14, 12 14 C 7 14, 4 18, 4 25 C 4 32, 7 35, 12 35 C 15 35, 17 34, 19 31 L 19 32 C 19 36, 16 39, 12 39 C 10 39, 8 38, 7 36 Z M 12 17 C 16 17, 19 20, 19 25 C 19 30, 16 32, 12 32 C 8 32, 6 29, 6 25 C 6 20, 8 17, 12 17 Z"
            fill={color}
          />
        </g>
        
        {/* e */}
        <text
          x="95"
          y="35"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="32"
          fontWeight="600"
          fill={color}
          letterSpacing="-0.5"
        >
          e
        </text>
      </svg>
    </div>
  );
};

export default MergeLogo;
