import React from 'react';

/**
 * Constellation Icon Component
 * Renders minimalist constellation-style SVG icons for zodiac signs
 */

const ConstellationIcon = ({ sign, className = "w-8 h-8" }) => {
  const constellations = {
    taurus: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Taurus constellation pattern */}
        {/* Main V-shape representing bull's horns */}
        <circle cx="30" cy="20" r="2" fill="white" opacity="0.9"/>
        <circle cx="50" cy="40" r="2.5" fill="white"/>
        <circle cx="70" cy="20" r="2" fill="white" opacity="0.9"/>
        <circle cx="50" cy="60" r="2" fill="white" opacity="0.8"/>
        <circle cx="35" cy="50" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="65" cy="50" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="50" cy="75" r="1.5" fill="white" opacity="0.6"/>
        
        {/* Connecting lines */}
        <line x1="30" y1="20" x2="50" y2="40" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="70" y1="20" x2="50" y2="40" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="50" y1="40" x2="50" y2="60" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="50" y1="40" x2="35" y2="50" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="50" y1="40" x2="65" y2="50" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="50" y1="60" x2="50" y2="75" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    aries: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Aries constellation - ram's horns curving pattern */}
        <circle cx="50" cy="50" r="2.5" fill="white"/>
        <circle cx="35" cy="35" r="2" fill="white" opacity="0.9"/>
        <circle cx="65" cy="35" r="2" fill="white" opacity="0.9"/>
        <circle cx="25" cy="25" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="75" cy="25" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="50" cy="70" r="1.5" fill="white" opacity="0.6"/>
        
        <line x1="50" y1="50" x2="35" y2="35" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="50" y1="50" x2="65" y2="35" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="35" y1="35" x2="25" y2="25" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="65" y1="35" x2="75" y2="25" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="50" y1="50" x2="50" y2="70" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    gemini: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gemini constellation - twin pillars */}
        <circle cx="35" cy="25" r="2" fill="white" opacity="0.9"/>
        <circle cx="35" cy="50" r="2.5" fill="white"/>
        <circle cx="35" cy="75" r="2" fill="white" opacity="0.9"/>
        <circle cx="65" cy="25" r="2" fill="white" opacity="0.9"/>
        <circle cx="65" cy="50" r="2.5" fill="white"/>
        <circle cx="65" cy="75" r="2" fill="white" opacity="0.9"/>
        
        <line x1="35" y1="25" x2="35" y2="75" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="65" y1="25" x2="65" y2="75" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="35" y1="50" x2="65" y2="50" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    cancer: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cancer constellation - crab claws */}
        <circle cx="50" cy="50" r="2.5" fill="white"/>
        <circle cx="30" cy="40" r="2" fill="white" opacity="0.9"/>
        <circle cx="70" cy="40" r="2" fill="white" opacity="0.9"/>
        <circle cx="20" cy="30" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="80" cy="30" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="40" cy="65" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="60" cy="65" r="1.5" fill="white" opacity="0.7"/>
        
        <line x1="50" y1="50" x2="30" y2="40" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="50" y1="50" x2="70" y2="40" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="30" y1="40" x2="20" y2="30" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="70" y1="40" x2="80" y2="30" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="50" y1="50" x2="40" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="50" y1="50" x2="60" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    leo: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leo constellation - lion's mane */}
        <circle cx="50" cy="40" r="3" fill="white"/>
        <circle cx="35" cy="30" r="2" fill="white" opacity="0.9"/>
        <circle cx="65" cy="30" r="2" fill="white" opacity="0.9"/>
        <circle cx="25" cy="45" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="75" cy="45" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="50" cy="60" r="2" fill="white" opacity="0.8"/>
        <circle cx="45" cy="75" r="1.5" fill="white" opacity="0.6"/>
        
        <line x1="50" y1="40" x2="35" y2="30" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="50" y1="40" x2="65" y2="30" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="35" y1="30" x2="25" y2="45" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="65" y1="30" x2="75" y2="45" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="50" y1="40" x2="50" y2="60" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="50" y1="60" x2="45" y2="75" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    virgo: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Virgo constellation - maiden figure */}
        <circle cx="30" cy="30" r="2" fill="white" opacity="0.9"/>
        <circle cx="40" cy="45" r="2.5" fill="white"/>
        <circle cx="50" cy="60" r="2" fill="white" opacity="0.8"/>
        <circle cx="60" cy="40" r="2" fill="white" opacity="0.8"/>
        <circle cx="70" cy="55" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="55" cy="75" r="1.5" fill="white" opacity="0.6"/>
        
        <line x1="30" y1="30" x2="40" y2="45" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="40" y1="45" x2="50" y2="60" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="40" y1="45" x2="60" y2="40" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="60" y1="40" x2="70" y2="55" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="50" y1="60" x2="55" y2="75" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    libra: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Libra constellation - scales balance */}
        <circle cx="50" cy="35" r="2.5" fill="white"/>
        <circle cx="30" cy="55" r="2" fill="white" opacity="0.9"/>
        <circle cx="70" cy="55" r="2" fill="white" opacity="0.9"/>
        <circle cx="20" cy="70" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="80" cy="70" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="50" cy="70" r="1.5" fill="white" opacity="0.6"/>
        
        <line x1="50" y1="35" x2="30" y2="55" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="50" y1="35" x2="70" y2="55" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="30" y1="55" x2="20" y2="70" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="70" y1="55" x2="80" y2="70" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="20" y1="70" x2="80" y2="70" stroke="white" strokeWidth="0.5" opacity="0.2"/>
      </svg>
    ),
    
    scorpio: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Scorpio constellation - scorpion tail */}
        <circle cx="30" cy="40" r="2.5" fill="white"/>
        <circle cx="45" cy="45" r="2" fill="white" opacity="0.9"/>
        <circle cx="60" cy="50" r="2" fill="white" opacity="0.8"/>
        <circle cx="70" cy="40" r="2" fill="white" opacity="0.8"/>
        <circle cx="80" cy="25" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="40" cy="60" r="1.5" fill="white" opacity="0.6"/>
        
        <line x1="30" y1="40" x2="45" y2="45" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="45" y1="45" x2="60" y2="50" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="60" y1="50" x2="70" y2="40" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="70" y1="40" x2="80" y2="25" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="45" y1="45" x2="40" y2="60" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    sagittarius: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sagittarius constellation - archer's arrow */}
        <circle cx="25" cy="75" r="2" fill="white" opacity="0.9"/>
        <circle cx="40" cy="60" r="2.5" fill="white"/>
        <circle cx="55" cy="45" r="2" fill="white" opacity="0.9"/>
        <circle cx="70" cy="30" r="2" fill="white" opacity="0.8"/>
        <circle cx="80" cy="20" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="50" cy="55" r="1.5" fill="white" opacity="0.6"/>
        
        <line x1="25" y1="75" x2="80" y2="20" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="40" y1="60" x2="50" y2="55" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="70" y1="30" x2="75" y2="35" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="70" y1="30" x2="75" y2="25" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    capricorn: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Capricorn constellation - goat horns */}
        <circle cx="40" cy="35" r="2.5" fill="white"/>
        <circle cx="30" cy="50" r="2" fill="white" opacity="0.9"/>
        <circle cx="50" cy="50" r="2" fill="white" opacity="0.9"/>
        <circle cx="60" cy="60" r="2" fill="white" opacity="0.8"/>
        <circle cx="70" cy="70" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="40" cy="65" r="1.5" fill="white" opacity="0.6"/>
        
        <line x1="40" y1="35" x2="30" y2="50" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="40" y1="35" x2="50" y2="50" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="50" y1="50" x2="60" y2="60" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="60" y1="60" x2="70" y2="70" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="30" y1="50" x2="40" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    aquarius: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Aquarius constellation - water waves */}
        <circle cx="25" cy="40" r="2" fill="white" opacity="0.9"/>
        <circle cx="40" cy="50" r="2" fill="white" opacity="0.9"/>
        <circle cx="55" cy="45" r="2.5" fill="white"/>
        <circle cx="70" cy="55" r="2" fill="white" opacity="0.9"/>
        <circle cx="35" cy="65" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="60" cy="65" r="1.5" fill="white" opacity="0.7"/>
        
        <line x1="25" y1="40" x2="40" y2="50" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="40" y1="50" x2="55" y2="45" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="55" y1="45" x2="70" y2="55" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="40" y1="50" x2="35" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        <line x1="55" y1="45" x2="60" y2="65" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    ),
    
    pisces: (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pisces constellation - two fish */}
        <circle cx="30" cy="35" r="2" fill="white" opacity="0.9"/>
        <circle cx="35" cy="50" r="2.5" fill="white"/>
        <circle cx="30" cy="65" r="2" fill="white" opacity="0.9"/>
        <circle cx="70" cy="35" r="2" fill="white" opacity="0.9"/>
        <circle cx="65" cy="50" r="2.5" fill="white"/>
        <circle cx="70" cy="65" r="2" fill="white" opacity="0.9"/>
        
        <line x1="30" y1="35" x2="35" y2="50" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="35" y1="50" x2="30" y2="65" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="70" y1="35" x2="65" y2="50" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="65" y1="50" x2="70" y2="65" stroke="white" strokeWidth="0.5" opacity="0.4"/>
        <line x1="35" y1="50" x2="65" y2="50" stroke="white" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    )
  };

  const signKey = sign?.toLowerCase() || 'aries';
  return constellations[signKey] || constellations.aries;
};

export default ConstellationIcon;
