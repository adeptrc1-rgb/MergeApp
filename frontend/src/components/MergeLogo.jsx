/**
 * Merge Logo Component
 * Clean, minimalist, geometric construction
 * The enclosed space inside the R forms the crossbar and hook of the G
 * Custom geometric sans-serif, medium weight
 */

import React from 'react';

const MergeLogo = ({ 
  className = '', 
  size = 'md'
}) => {
  // Size configurations
  const sizes = {
    sm: { height: 28 },
    md: { height: 36 },
    lg: { height: 44 },
    xl: { height: 52 }
  };

  const config = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${className}`}>
      {/* Custom Merge wordmark - R's enclosed counter space defines G's crossbar and hook */}
      <svg
        height={config.height}
        viewBox="0 0 340 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* M - Geometric sans-serif construction */}
        <g>
          <rect x="15" y="20" width="7" height="60" fill="#FFFFFF" rx="3.5"/>
          <rect x="48" y="20" width="7" height="60" fill="#FFFFFF" rx="3.5"/>
          <path
            d="M 18.5 20 L 35 50 L 51.5 20"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        
        {/* E - Clean geometric */}
        <g>
          <rect x="75" y="20" width="7" height="60" fill="#FFFFFF" rx="3.5"/>
          <rect x="75" y="20" width="30" height="7" fill="#FFFFFF" rx="3.5"/>
          <rect x="75" y="46.5" width="27" height="7" fill="#FFFFFF" rx="3.5"/>
          <rect x="75" y="73" width="30" height="7" fill="#FFFFFF" rx="3.5"/>
        </g>
        
        {/* R+G - THE CRITICAL NEGATIVE SPACE INTEGRATION */}
        <g>
          {/* R - Geometric construction with enclosed counter */}
          <g>
            {/* R's vertical stem */}
            <rect x="125" y="20" width="7" height="60" fill="#FFFFFF" rx="3.5"/>
            
            {/* R's bowl - creates the enclosed counter space */}
            <path
              d="M 132 20 L 155 20 C 165 20, 170 25, 170 35 C 170 45, 165 50, 155 50 L 132 50"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            
            {/* R's leg - diagonal at geometric angle */}
            <path
              d="M 148 50 L 170 80"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>
          
          {/* G - Defined by R's enclosed counter space */}
          <g>
            {/* G's main vertical stem - positioned where R's counter flows */}
            <rect x="185" y="25" width="7" height="50" fill="#FFFFFF" rx="3.5"/>
            
            {/* G's top curve - connects from R's bowl opening */}
            <path
              d="M 170 30 C 175 22, 180 20, 185 20"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* G's bottom curve */}
            <path
              d="M 185 80 C 180 80, 175 78, 170 70"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* G's crossbar - FORMED BY R'S COUNTER SPACE */}
            {/* This is the key: the horizontal bar sits at the same height as R's bowl */}
            <rect x="185" y="46.5" width="25" height="7" fill="#FFFFFF" rx="3.5"/>
          </g>
        </g>
        
        {/* E - Second E, matching first */}
        <g>
          <rect x="235" y="20" width="7" height="60" fill="#FFFFFF" rx="3.5"/>
          <rect x="235" y="20" width="30" height="7" fill="#FFFFFF" rx="3.5"/>
          <rect x="235" y="46.5" width="27" height="7" fill="#FFFFFF" rx="3.5"/>
          <rect x="235" y="73" width="30" height="7" fill="#FFFFFF" rx="3.5"/>
        </g>
      </svg>
    </div>
  );
};

export default MergeLogo;
