/**
 * Cosme Logo Component
 * Minimalist wordmark with orbital dot icon
 * Supports icon-only mode and state-based animations
 */

import React, { useState, useEffect } from 'react';
import logoStateManager from '../utils/logoStateManager';
import '../styles/logoStates.css';

const CosmeLogo = ({ 
  className = '', 
  size = 'md', 
  showGradient = true, 
  iconOnly = false,
  enableStates = false
}) => {
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

  // State management for animated dot
  const [logoState, setLogoState] = useState('default');

  useEffect(() => {
    if (enableStates) {
      const unsubscribe = logoStateManager.subscribe(setLogoState);
      return unsubscribe;
    }
  }, [enableStates]);

  return (
    <div className={`flex items-center ${className}`} style={{ gap: iconOnly ? 0 : `${config.gap}px` }}>
      {/* Orbital Dot Icon */}
      <svg
        className="logo-icon-container"
        width={iconSize}
        height={iconSize}
        viewBox={`0 0 ${iconSize} ${iconSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 3/4 Orbital Ring - incomplete circle with gap at top */}
        <path
          className={enableStates ? `logo-ring-${logoState}` : 'logo-ring-default'}
          d={`M ${startX} ${startY} A ${orbitRadius} ${orbitRadius} 0 1 1 ${endX} ${endY}`}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Central Celestial Dot - Pure White with State Support */}
        <circle
          className={enableStates ? `logo-dot-${logoState}` : 'logo-dot-default'}
          cx={center}
          cy={center}
          r={dotRadius}
          fill="#FFFFFF"
        />
      </svg>

      {/* Wordmark - Hidden in icon-only mode */}
      {!iconOnly && (
        <span
          className={`${config.fontSize}`}
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 300,
            color: '#FFFFFF',
            letterSpacing: '0.15em',
            textTransform: 'lowercase',
            fontFeatureSettings: '"ss01" 1',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          cosme
        </span>
      )}
    </div>
  );
};

export default CosmeLogo;
