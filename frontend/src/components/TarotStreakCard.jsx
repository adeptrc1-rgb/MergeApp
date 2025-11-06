import React, { useState, useEffect } from 'react';
import { Gift, Zap, Heart, Star, MessageCircle, Sparkles, Crown } from 'lucide-react';

// Get reward color and icon based on type
const getRewardTheme = (reward) => {
  if (!reward) return { color: '#a78bfa', icon: Gift, label: 'Mystery' };
  
  const type = reward.type;
  const themes = {
    coins: { color: '#fbbf24', icon: Star, gradient: 'from-yellow-400 to-amber-500' },
    utility: { color: '#60a5fa', icon: Zap, gradient: 'from-blue-400 to-cyan-500' },
    boost: { color: '#a78bfa', icon: Sparkles, gradient: 'from-purple-400 to-violet-500' },
    multiplier: { color: '#ec4899', icon: Star, gradient: 'from-pink-400 to-rose-500' },
    cosmetic: { color: '#f59e0b', icon: Crown, gradient: 'from-amber-400 to-orange-500' },
    legendary: { color: '#fef3c7', icon: Crown, gradient: 'from-yellow-200 to-amber-300' }
  };
  
  return themes[type] || { color: '#a78bfa', icon: Gift, gradient: 'from-purple-400 to-pink-500' };
};

export default function TarotStreakCard({ 
  streakDay, 
  reward, 
  onClaim, 
  canClaim, 
  isClaiming 
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const theme = getRewardTheme(reward);
  const RewardIcon = theme.icon;

  const handleCardTap = () => {
    if (!canClaim || isClaiming || isFlipped) return;
    
    setIsAnimating(true);
    setShowParticles(true);
    
    // Flip animation sequence
    setTimeout(() => {
      setIsFlipped(true);
    }, 300);
    
    setTimeout(() => {
      setShowParticles(false);
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* Nebula Background */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${theme.color}40, transparent 60%),
                        radial-gradient(circle at 70% 50%, #a78bfa40, transparent 60%)`,
            animation: 'nebula-float 8s ease-in-out infinite'
          }}
        />
      </div>

      {/* Floating Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${50 + (Math.random() - 0.5) * 100}%`,
                top: `${50 + (Math.random() - 0.5) * 100}%`,
                animation: `particle-burst-${i % 4} 1s ease-out forwards`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>
      )}

      {/* Psychic Sparks */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`spark-${i}`}
              className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                left: '50%',
                top: '50%',
                transform: `rotate(${i * 45}deg) translateX(-50%)`,
                animation: 'spark-flash 0.6s ease-out forwards',
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      )}

      {/* The Tarot Card */}
      <div 
        className={`relative w-64 h-96 cursor-pointer transition-all duration-700 ${
          isAnimating ? 'scale-110' : 'scale-100 hover:scale-105'
        } ${!canClaim ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          animation: !isFlipped ? 'card-float 3s ease-in-out infinite' : 'none'
        }}
        onClick={handleCardTap}
      >
        {/* Card Back */}
        <div 
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          }}
        >
          {/* Ornate Pattern */}
          <div className="absolute inset-0 border-4 border-amber-500/30 rounded-2xl">
            <div className="absolute inset-4 border-2 border-amber-400/20 rounded-xl">
              {/* Center Symbol */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Rotating Zodiac Wheel */}
                  <div className="w-32 h-32 rounded-full border-2 border-amber-400/40 flex items-center justify-center"
                       style={{ animation: 'slow-spin 20s linear infinite' }}>
                    <div className="text-amber-400 text-4xl">✧</div>
                  </div>
                  {/* Corner Stars */}
                  {[0, 90, 180, 270].map((deg, i) => (
                    <div
                      key={i}
                      className="absolute text-amber-400 text-sm"
                      style={{
                        transform: `rotate(${deg}deg) translateY(-60px)`,
                        animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite`
                      }}
                    >
                      ✦
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Shimmer Effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
                style={{ animation: 'shimmer 3s ease-in-out infinite' }}
              />
            </div>
          </div>

          {/* Mystical Text */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <div className="text-amber-400 text-sm font-light tracking-widest">
              COSMIC ENERGY
            </div>
            <div className="text-white/60 text-xs mt-1">
              Day {streakDay}
            </div>
          </div>
        </div>

        {/* Card Front (Reward) */}
        <div 
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${theme.color}20 0%, ${theme.color}40 100%)`
          }}
        >
          {/* Glowing Border */}
          <div 
            className={`absolute inset-0 border-4 rounded-2xl`}
            style={{
              borderColor: theme.color,
              boxShadow: `0 0 20px ${theme.color}80, inset 0 0 20px ${theme.color}40`,
              animation: 'border-glow 2s ease-in-out infinite'
            }}
          />

          {/* Reward Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            {/* Icon with Glow */}
            <div 
              className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center mb-6`}
              style={{
                boxShadow: `0 0 40px ${theme.color}60`,
                animation: 'icon-pulse 2s ease-in-out infinite'
              }}
            >
              <RewardIcon className="w-12 h-12 text-white" />
              
              {/* Orbiting Stars */}
              {[0, 120, 240].map((deg, i) => (
                <div
                  key={`orbit-${i}`}
                  className="absolute text-white text-xs"
                  style={{
                    animation: `orbit 3s linear infinite`,
                    animationDelay: `${i * 1}s`,
                    transformOrigin: 'center'
                  }}
                >
                  ✦
                </div>
              ))}
            </div>

            {/* Reward Text */}
            <div className="text-center">
              <div className="text-white/80 text-xs uppercase tracking-widest mb-2">
                Day {streakDay} Reward
              </div>
              <div className="text-white text-xl font-light mb-2">
                {reward?.label || 'Mystery Reward'}
              </div>
              <div className="text-white/60 text-sm">
                {reward?.tier === 'gold' && '⭐ Milestone Reward ⭐'}
                {reward?.tier === 'silver' && '✨ Special Reward'}
                {reward?.tier === 'bronze' && '💫 Daily Blessing'}
              </div>
            </div>
          </div>

          {/* Radiant Rays */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={`ray-${i}`}
                className="absolute w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"
                style={{
                  left: '50%',
                  top: '0',
                  transform: `rotate(${i * 30}deg) translateX(-50%)`,
                  transformOrigin: '50% 50%',
                  animation: 'ray-rotate 10s linear infinite',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tap Instruction */}
      {!isFlipped && canClaim && !isClaiming && (
        <div 
          className="absolute bottom-4 left-0 right-0 text-center"
          style={{ animation: 'fade-pulse 2s ease-in-out infinite' }}
        >
          <div className="text-white/80 text-sm">
            ✨ Tap to reveal today's cosmic energy ✨
          </div>
        </div>
      )}

      {/* Claim Button (appears after flip) */}
      {isFlipped && (
        <div 
          className="absolute bottom-4 left-0 right-0 px-8"
          style={{ animation: 'fade-in 0.5s ease-out forwards' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClaim();
            }}
            disabled={isClaiming}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              isClaiming
                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                : `bg-gradient-to-r ${theme.gradient} text-white hover:scale-105 shadow-lg`
            }`}
            style={{ boxShadow: `0 4px 20px ${theme.color}40` }}
          >
            {isClaiming ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Claiming...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Claim Cosmic Reward
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
