/**
 * Merge Logo Component
 * Intelligent use of negative space where R's counterform defines G's structure
 * Clean, minimalist, geometric construction
 */

import React, { useState, useEffect } from 'react';
import logoStateManager from '../utils/logoStateManager';
import '../styles/logoStates.css';

const MergeLogo = ({ 
  className = '', 
  size = 'md', 
  showGradient = true, 
  iconOnly = false,
  enableStates = false
}) => {
  // Size configurations
  const sizes = {
    sm: { height: 24, iconSize: 32, fontSize: 'text-base', gap: 8 },
    md: { height: 32, iconSize: 40, fontSize: 'text-xl', gap: 10 },
    lg: { height: 40, iconSize: 48, fontSize: 'text-2xl', gap: 12 },
    xl: { height: 48, iconSize: 56, fontSize: 'text-3xl', gap: 14 }
  };

  const config = sizes[size] || sizes.md;
  const iconSize = config.iconSize;

  // State management for animated logo
  const [logoState, setLogoState] = useState('default');

  useEffect(() => {
    if (enableStates) {
      const unsubscribe = logoStateManager.subscribe(setLogoState);
      return unsubscribe;
    }
  }, [enableStates]);

  return (
    <div className={`flex items-center ${className}`} style={{ gap: iconOnly ? 0 : `${config.gap}px` }}>
      {/* R+G Icon - Clever negative space integration */}
      <svg
        className="logo-icon-container"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for the logo */}
          <linearGradient id="mergeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          
          {/* Glow filter for animation */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* R+G Combined Shape - Shared vertical stem, negative space defines G */}
        <g className={enableStates ? `logo-merge-rg-${logoState}` : 'logo-merge-rg-default'}>
          {/* Shared vertical stem */}
          <rect x="20" y="20" width="8" height="60" fill="url(#mergeGradient)" />
          
          {/* R's bowl (top circle) */}
          <path
            d="M 28 20 L 28 35 C 28 35, 28 28, 35 28 C 42 28, 48 28, 48 35 C 48 42, 42 42, 35 42 L 28 42"
            stroke="url(#mergeGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* R's leg (diagonal stroke at 45°) */}
          <line
            x1="35"
            y1="42"
            x2="48"
            y2="58"
            stroke="url(#mergeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* G's structure - Uses negative space from R */}
          {/* G's top curve */}
          <path
            d="M 72 28 C 65 28, 60 28, 60 35 L 60 65 C 60 72, 65 72, 72 72 C 79 72, 84 72, 84 65 L 84 50"
            stroke="url(#mergeGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* G's horizontal bar (connects to R's negative space) */}
          <line
            x1="72"
            y1="50"
            x2="84"
            y2="50"
            stroke="url(#mergeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Connecting element - subtle bridge between R and G */}
          <circle
            cx="54"
            cy="50"
            r="3"
            fill="url(#mergeGradient)"
            className="merge-connector"
            opacity="0.6"
          />
        </g>
      </svg>

      {/* Wordmark - Hidden in icon-only mode */}
      {!iconOnly && (
        <span
          className={`${config.fontSize}`}
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 500,
            background: 'linear-gradient(135deg, #6D28D9 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.5px',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          Merge
        </span>
      )}
    </div>
  );
};

export default MergeLogo;
