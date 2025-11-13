/**
 * Merge Logo Component
 * Wordmark where R's counterform defines G's structure
 * The enclosed space inside the R forms the crossbar and hook of the G
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
      {/* Custom Merge wordmark with R+G negative space integration */}
      <svg
        height={config.height}
        viewBox="0 0 300 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* M */}
        <path
          d="M 10 65 L 10 15 L 25 40 L 40 15 L 40 65"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* E */}
        <path
          d="M 60 15 L 90 15 M 60 15 L 60 65 M 60 40 L 85 40 M 60 65 L 90 65"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* R - with enclosed counterform that will flow into G */}
        <g>
          {/* R's vertical stem */}
          <line
            x1="110"
            y1="15"
            x2="110"
            y2="65"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
          />
          
          {/* R's bowl/counter - this negative space defines G's structure */}
          <path
            d="M 110 15 L 135 15 C 145 15, 148 20, 148 30 C 148 40, 145 42, 135 42 L 110 42"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* R's leg */}
          <line
            x1="130"
            y1="42"
            x2="148"
            y2="65"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
        
        {/* G - Uses R's counterform as its defining structure */}
        <g>
          {/* G's vertical stem (flows from R's negative space) */}
          <line
            x1="168"
            y1="20"
            x2="168"
            y2="60"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
          />
          
          {/* G's top curve (connects to R's bowl space) */}
          <path
            d="M 148 28 C 152 20, 160 15, 168 15"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* G's bottom curve */}
          <path
            d="M 168 65 C 160 65, 152 60, 148 52"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* G's horizontal bar (forms from R's counter space) */}
          <line
            x1="168"
            y1="40"
            x2="190"
            y2="40"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
          />
          
          {/* Subtle connector showing negative space flow */}
          <circle
            cx="156"
            cy="34"
            r="2"
            fill="#FFFFFF"
            opacity="0.4"
          />
        </g>
        
        {/* E (second E) */}
        <path
          d="M 210 15 L 240 15 M 210 15 L 210 65 M 210 40 L 235 40 M 210 65 L 240 65"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default MergeLogo;
