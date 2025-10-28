import React from 'react';

/**
 * Premium Skin Renderer Component
 * Renders advanced visual effects for premium profile card skins
 */
export default function PremiumSkinRenderer({ skinEffect, zodiacSign }) {
  if (!skinEffect) return null;

  const { type, colors, features = [], borderColor, neonColor, accentColor, glowColor, particleCount = 30 } = skinEffect;

  // Galaxy Theme
  if (type === 'galaxy') {
    return (
      <>
        {/* Dark space background with gradient */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${colors[2]}40, ${colors[0]} 50%), 
                        radial-gradient(ellipse at 70% 80%, ${colors[1]}60, ${colors[0]} 80%)`,
          }}
        />
        
        {/* Animated stars */}
        {features.includes('stars') && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            {[...Array(particleCount || 50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: Math.random() * 0.8 + 0.2,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Nebula patterns */}
        {features.includes('nebula') && (
          <div 
            className="absolute inset-0 z-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 60% 40%, ${borderColor}30, transparent 60%),
                          radial-gradient(circle at 20% 70%, #c084fc20, transparent 50%)`,
              filter: 'blur(40px)',
            }}
          />
        )}
        
        {/* Glowing border */}
        {features.includes('glowing_border') && (
          <div 
            className="absolute inset-0 z-0 rounded-2xl"
            style={{
              boxShadow: `inset 0 0 30px ${borderColor}40, 0 0 20px ${borderColor}30`,
              border: `2px solid ${borderColor}60`,
            }}
          />
        )}
        
        {/* Animated sparkles */}
        {features.includes('sparkles') && (
          <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 animate-float-sparkle"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                <div 
                  className="w-full h-full"
                  style={{
                    background: borderColor,
                    boxShadow: `0 0 8px ${borderColor}`,
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // Pastel Theme
  if (type === 'pastel') {
    return (
      <>
        {/* Soft gradient background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${colors[0]}50, ${colors[1]}50 50%, ${colors[2]}50)`,
            animation: 'gradientShift 8s ease-in-out infinite',
            backgroundSize: '200% 200%',
          }}
        />
        
        {/* Gentle overlay */}
        {features.includes('overlay') && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 70%)',
            }}
          />
        )}
        
        {/* Floating particles */}
        {features.includes('particles') && (
          <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
            {[...Array(particleCount || 30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float-gentle"
                style={{
                  width: `${4 + Math.random() * 8}px`,
                  height: `${4 + Math.random() * 8}px`,
                  background: colors[i % colors.length],
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 4}s`,
                  opacity: 0.4,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Rounded border with accent */}
        {features.includes('rounded_border') && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              borderRadius: skinEffect.borderRadius || '24px',
              border: `3px solid ${colors[0]}80`,
              boxShadow: `inset 0 0 20px ${colors[1]}30`,
            }}
          />
        )}
      </>
    );
  }

  // Zodiac Theme
  if (type === 'zodiac') {
    const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    
    return (
      <>
        {/* Dark mystical background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]} 50%, ${colors[2]})`,
          }}
        />
        
        {/* Constellation background */}
        {features.includes('constellation_bg') && (
          <div 
            className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                               radial-gradient(2px 2px at 60% 70%, white, transparent),
                               radial-gradient(1px 1px at 50% 50%, white, transparent),
                               radial-gradient(1px 1px at 80% 10%, white, transparent),
                               radial-gradient(2px 2px at 90% 60%, white, transparent),
                               radial-gradient(1px 1px at 33% 80%, white, transparent)`,
              backgroundSize: '200% 200%',
              backgroundPosition: '0% 0%',
            }}
          />
        )}
        
        {/* Faint zodiac symbols */}
        {features.includes('zodiac_symbols') && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            {zodiacSymbols.map((symbol, i) => (
              <div
                key={i}
                className="absolute text-6xl font-light animate-float-slow"
                style={{
                  top: `${(i * 15) % 90}%`,
                  left: `${(i * 25) % 85}%`,
                  color: glowColor || '#ffd700',
                  opacity: skinEffect.symbolOpacity || 0.15,
                  animationDelay: `${i * 0.8}s`,
                  textShadow: `0 0 10px ${glowColor || '#ffd700'}40`,
                }}
              >
                {symbol}
              </div>
            ))}
          </div>
        )}
        
        {/* Halo effect around edges */}
        {features.includes('halo_effect') && (
          <div 
            className="absolute inset-0 z-0 rounded-2xl"
            style={{
              boxShadow: `inset 0 0 60px ${glowColor || '#ffd700'}20, 0 0 30px ${glowColor || '#ffd700'}15`,
              border: `1px solid ${glowColor || '#ffd700'}30`,
            }}
          />
        )}
        
        {/* Glowing zodiac overlay (on avatar) */}
        {features.includes('zodiac_overlay') && (
          <div 
            className="absolute top-6 left-6 z-20 w-16 h-16 flex items-center justify-center text-5xl animate-pulse-glow"
            style={{
              color: glowColor || '#ffd700',
              textShadow: `0 0 20px ${glowColor || '#ffd700'}, 0 0 40px ${glowColor || '#ffd700'}80`,
              filter: 'drop-shadow(0 0 10px currentColor)',
            }}
          >
            {zodiacSymbols[0]}
          </div>
        )}
      </>
    );
  }

  // Neon Theme
  if (type === 'neon') {
    return (
      <>
        {/* Pure black background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: colors[0] || '#000000',
          }}
        />
        
        {/* Neon border frame */}
        {features.includes('neon_border') && (
          <>
            <div 
              className="absolute inset-0 z-0 rounded-2xl animate-neon-pulse"
              style={{
                border: `3px solid ${neonColor || '#00ffff'}`,
                boxShadow: `
                  inset 0 0 20px ${neonColor || '#00ffff'}60,
                  0 0 20px ${neonColor || '#00ffff'}80,
                  0 0 40px ${neonColor || '#00ffff'}40
                `,
              }}
            />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 z-0 border-t-4 border-l-4 rounded-tl-2xl"
              style={{
                borderColor: accentColor || '#ff00ff',
                boxShadow: `0 0 15px ${accentColor || '#ff00ff'}`,
              }}
            />
            <div className="absolute top-0 right-0 w-12 h-12 z-0 border-t-4 border-r-4 rounded-tr-2xl"
              style={{
                borderColor: accentColor || '#ff00ff',
                boxShadow: `0 0 15px ${accentColor || '#ff00ff'}`,
              }}
            />
            <div className="absolute bottom-0 left-0 w-12 h-12 z-0 border-b-4 border-l-4 rounded-bl-2xl"
              style={{
                borderColor: accentColor || '#ff00ff',
                boxShadow: `0 0 15px ${accentColor || '#ff00ff'}`,
              }}
            />
            <div className="absolute bottom-0 right-0 w-12 h-12 z-0 border-b-4 border-r-4 rounded-br-2xl"
              style={{
                borderColor: accentColor || '#ff00ff',
                boxShadow: `0 0 15px ${accentColor || '#ff00ff'}`,
              }}
            />
          </>
        )}
        
        {/* Animated glow effect on avatar area */}
        {features.includes('animated_glow') && (
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 z-5 rounded-full animate-neon-glow"
            style={{
              background: `radial-gradient(circle, ${neonColor}20, transparent 70%)`,
              boxShadow: `0 0 60px ${neonColor}40`,
            }}
          />
        )}
        
        {/* Scan line effect */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none animate-scan-line"
          style={{
            background: `linear-gradient(0deg, transparent 0%, ${neonColor}10 50%, transparent 100%)`,
            backgroundSize: '100% 200px',
          }}
        />
      </>
    );
  }

  return null;
}
