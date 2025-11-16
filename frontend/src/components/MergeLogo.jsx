/**
 * Merge Logo Component
 * Simple text wordmark - no special effects
 */

import React from 'react';

const MergeLogo = ({ 
  className = '', 
  size = 'md',
  color = '#FFFFFF'
}) => {
  // Size configurations
  const sizes = {
    sm: { fontSize: '18px', fontWeight: '600' },
    md: { fontSize: '24px', fontWeight: '600' },
    lg: { fontSize: '32px', fontWeight: '600' },
    xl: { fontSize: '40px', fontWeight: '600' }
  };

  const config = sizes[size] || sizes.md;

  return (
    <span 
      className={className}
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        color: color,
        letterSpacing: '-0.02em'
      }}
    >
      Merge
    </span>
  );
};

export default MergeLogo;
