/**
 * Merge Logo Component
 * Displays the Merge "M" logo image
 */

import React from 'react';

const MergeLogo = ({ 
  className = '', 
  size = 'md',
  color = '#FFFFFF' // Not used for image, kept for backward compatibility
}) => {
  // Size configurations for image height
  const sizes = {
    sm: '24px',
    md: '32px',
    lg: '40px',
    xl: '48px'
  };

  const height = sizes[size] || sizes.md;

  return (
    <img 
      src="https://customer-assets.emergentagent.com/job_merge-wheel/artifacts/z39ztw1i_122fed07-08be-4993-9208-7eed705ccacb.png"
      alt="Merge"
      className={className}
      style={{
        height: height,
        width: 'auto',
        objectFit: 'contain'
      }}
    />
  );
};

export default MergeLogo;
