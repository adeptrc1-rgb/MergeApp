/**
 * Merge Logo Component
 * Clean, minimalist, geometric construction matching reference design
 * R and G cleverly connected where they share space
 * All white, custom geometric sans-serif, medium weight
 */

import React from 'react';

const MergeLogo = ({ 
  className = '', 
  size = 'md'
}) => {
  // Size configurations
  const sizes = {
    sm: { height: 24 },
    md: { height: 32 },
    lg: { height: 40 },
    xl: { height: 48 }
  };

  const config = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${className}`}>
      {/* MERGE wordmark - exact match to reference design, all white */}
      <svg
        height={config.height}
        viewBox="0 0 400 100"
        fill="#FFFFFF"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* M */}
        <path d="M 10 85 L 10 15 L 15 15 L 15 75 L 32.5 45 L 35 45 L 52.5 75 L 52.5 15 L 57.5 15 L 57.5 85 L 52.5 85 L 33.75 52 L 15 85 Z" fill="#FFFFFF"/>
        
        {/* E */}
        <path d="M 75 15 L 110 15 L 110 20 L 80 20 L 80 47 L 105 47 L 105 52 L 80 52 L 80 80 L 110 80 L 110 85 L 75 85 Z" fill="#FFFFFF"/>
        
        {/* R - with bowl that connects to G */}
        <g>
          <path d="M 130 15 L 135 15 L 135 47 L 155 47 C 168 47, 175 40, 175 28 C 175 16, 168 15, 155 15 L 135 15 M 130 85 L 135 85 L 135 52 L 152 52 L 173 85 L 179 85 L 157 51 C 169 50, 180 42, 180 28 C 180 13, 170 10, 155 10 L 130 10 Z" fill="#FFFFFF"/>
        </g>
        
        {/* G - cleverly connected to R, shares space */}
        <g>
          <path d="M 230 28 C 230 16, 220 10, 207 10 C 194 10, 183 18, 183 35 L 183 60 C 183 77, 194 85, 207 85 C 220 85, 230 79, 230 67 L 230 50 L 207 50 L 207 55 L 225 55 L 225 67 C 225 76, 217 80, 207 80 C 197 80, 188 74, 188 60 L 188 35 C 188 21, 197 15, 207 15 C 217 15, 225 19, 225 28 Z" fill="#FFFFFF"/>
        </g>
        
        {/* E (final) */}
        <path d="M 255 15 L 290 15 L 290 20 L 260 20 L 260 47 L 285 47 L 285 52 L 260 52 L 260 80 L 290 80 L 290 85 L 255 85 Z" fill="#FFFFFF"/>
      </svg>
    </div>
  );
};

export default MergeLogo;
