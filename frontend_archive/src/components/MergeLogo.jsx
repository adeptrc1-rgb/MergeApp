/**
 * Merge Logo Component
 * Displays the word "Merge"
 */

import React from 'react';

const MergeLogo = ({ 
  className = '', 
  size = 'md',
  color = '#FFFFFF'
}) => {
  // Size configurations for font size
  const sizes = {
    sm: '18px',
    md: '24px',
    lg: '32px',
    xl: '40px'
  };

  const fontSize = sizes[size] || sizes.md;

  return (
    <div
      className={className}
      style={{
        fontSize: fontSize,
        fontWeight: '600',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: color,
        letterSpacing: '-0.02em'
      }}
    >
      Merge
    </div>
  );
};

export default MergeLogo;
