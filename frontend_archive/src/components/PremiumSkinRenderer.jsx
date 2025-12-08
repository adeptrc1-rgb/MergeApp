import React from 'react';

/**
 * Premium Skin Renderer Component - Overlay Based
 * Renders overlays, particles, and animated effects on top of photos
 * NO borders or frames - photo fills entire card
 */
export default function PremiumSkinRenderer({ skinEffect, zodiacSign, className = '' }) {
  if (!skinEffect) return null;

  const { type, overlay, overlayOpacity = 0.3, overlayColors, particles, textGlow, accentGlow } = skinEffect;

  return (
    <>
      {/* Galaxy Skin - Stars and Nebula Overlay */}
      {type === 'galaxy' && (
        <>
          {/* Nebula gradient overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.3), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(192, 132, 252, 0.2), transparent 60%)',
              opacity: overlayOpacity,
            }}
          />
          
          {/* Twinkling stars */}
          {particles?.type === 'stars' && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              {[...Array(particles.count || 40)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    opacity: Math.random() * 0.7 + 0.3,
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Floating sparkles */}
          <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 animate-float-sparkle"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <div 
                  className="w-full h-full bg-purple-400"
                  style={{
                    boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)',
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pastel Skin - Soft Gradient and Floating Bubbles */}
      {type === 'pastel' && (
        <>
          {/* Soft gradient overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${overlayColors[0]}50, ${overlayColors[1]}50 50%, ${overlayColors[2]}50)`,
              opacity: overlayOpacity,
              animation: 'gradientShift 8s ease-in-out infinite',
              backgroundSize: '200% 200%',
            }}
          />
          
          {/* Floating bubble particles */}
          {particles?.type === 'bubbles' && (
            <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
              {[...Array(particles.count || 25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full animate-float-gentle"
                  style={{
                    width: `${4 + Math.random() * 10}px`,
                    height: `${4 + Math.random() * 10}px`,
                    background: overlayColors[i % overlayColors.length],
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${8 + Math.random() * 4}s`,
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Gentle light overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), transparent 70%)',
            }}
          />
        </>
      )}

      {/* Zodiac Skin - Constellation Patterns and Zodiac Symbols */}
      {type === 'zodiac' && (
        <>
          {/* Constellation pattern overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(2px 2px at 20% 30%, white, transparent),
                radial-gradient(2px 2px at 60% 70%, white, transparent),
                radial-gradient(1px 1px at 50% 50%, white, transparent),
                radial-gradient(1px 1px at 80% 10%, white, transparent),
                radial-gradient(2px 2px at 90% 60%, white, transparent),
                radial-gradient(1px 1px at 33% 80%, white, transparent)
              `,
              backgroundSize: '200% 200%',
              opacity: overlayOpacity,
            }}
          />
          
          {/* Floating zodiac symbols */}
          {particles?.type === 'zodiac_symbols' && (() => {
            const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
            return (
              <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
                {zodiacSymbols.slice(0, 8).map((symbol, i) => (
                  <div
                    key={i}
                    className="absolute text-4xl font-light animate-float-slow"
                    style={{
                      top: `${(i * 15) % 90}%`,
                      left: `${(i * 25) % 85}%`,
                      color: textGlow || '#ffd700',
                      opacity: 0.2,
                      animationDelay: `${i * 0.8}s`,
                      textShadow: `0 0 10px ${textGlow || '#ffd700'}60`,
                    }}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            );
          })()}
          
          {/* Subtle golden shimmer overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${textGlow || '#ffd700'}10, transparent 70%)`,
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
        </>
      )}

      {/* Neon Skin - Dark Vignette with Glowing Accents */}
      {type === 'neon' && (
        <>
          {/* Dark vignette overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)',
              opacity: overlayOpacity,
            }}
          />
          
          {/* Neon accent lines */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 z-15 animate-neon-pulse"
            style={{
              background: `linear-gradient(90deg, transparent, ${textGlow || '#00ffff'}, transparent)`,
              boxShadow: `0 0 10px ${textGlow || '#00ffff'}`,
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 z-15 animate-neon-pulse"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentGlow || '#ff00ff'}, transparent)`,
              boxShadow: `0 0 10px ${accentGlow || '#ff00ff'}`,
              animationDelay: '0.5s',
            }}
          />
          
          {/* Floating neon icons */}
          {particles?.type === 'neon_icons' && (
            <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
              {[...Array(particles.count || 8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-float-gentle"
                  style={{
                    background: i % 2 === 0 ? textGlow : accentGlow,
                    top: `${20 + Math.random() * 60}%`,
                    left: `${10 + Math.random() * 80}%`,
                    boxShadow: `0 0 15px ${i % 2 === 0 ? textGlow : accentGlow}`,
                    animationDelay: `${i * 0.6}s`,
                    animationDuration: `${6 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Scan line effect */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none animate-scan-line"
            style={{
              background: `linear-gradient(0deg, transparent 0%, ${textGlow}05 50%, transparent 100%)`,
              backgroundSize: '100% 200px',
            }}
          />
        </>
      )}
    </>
  );
}
