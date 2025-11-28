import React, { useState, useEffect } from 'react';
import './QuantumInfinityWheel.css';

const QuantumInfinityWheel = ({ isOpen, onClose, onRewardClaimed }) => {
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [rotation, setRotation] = useState(0);

  const REWARDS = [
    { id: 1, label: '2x Pulse³', color: '#00D9FF', emoji: '⚡', amount: 2 },
    { id: 2, label: '5 Super Likes', color: '#A855F7', emoji: '💜', amount: 5 },
    { id: 3, label: '100 Star Coins', color: '#FFD700', emoji: '⭐', amount: 100 },
    { id: 4, label: 'Exclusive Aura', color: '#EC4899', emoji: '✨', amount: 1 },
    { id: 5, label: '1 Pulse³', color: '#667eea', emoji: '⚡', amount: 1 },
    { id: 6, label: '50 Star Coins', color: '#FFA500', emoji: '💰', amount: 50 },
  ];

  const handleSpin = async () => {
    if (spinning) return;
    
    setSpinning(true);
    const spins = 5 + Math.random() * 3;
    const targetRotation = spins * 360 + Math.random() * 360;
    
    // Animate rotation
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easing = 1 - Math.pow(1 - progress, 3);
      
      setRotation(startRotation + targetRotation * easing);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin complete - show reward
        setTimeout(() => {
          const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
          setReward(selectedReward);
          setShowExplosion(true);
          
          setTimeout(() => setShowExplosion(false), 1500);
          
          setTimeout(() => {
            setSpinning(false);
            setReward(null);
            onClose();
            if (onRewardClaimed) {
              onRewardClaimed(selectedReward);
            }
          }, 3500);
        }, 500);
      }
    };
    animate();
  };

  if (!isOpen) return null;

  return (
    <div className="quantum-overlay" onClick={onClose}>
      <div className="quantum-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="infinity-title">
          <span className="infinity-icon">∞</span> Infinity Wheel
        </h2>

        {/* Infinity Wheel Container */}
        <div className="infinity-wheel-container">
          {/* Smooth Infinity Symbol */}
          <svg 
            className={`infinity-wheel ${spinning ? 'spinning' : ''}`}
            viewBox="0 0 200 100" 
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Infinity path with gradient */}
            <defs>
              <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#00D9FF', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#00D9FF', stopOpacity: 1 }} />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Infinity path */}
            <path
              d="M 30 50 Q 50 20, 70 50 T 110 50 Q 130 80, 150 50 T 30 50"
              fill="none"
              stroke="url(#infinityGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* Reward segments */}
            {REWARDS.map((reward, i) => {
              const angle = (i / REWARDS.length) * 360;
              const radians = (angle * Math.PI) / 180;
              const radius = 35;
              const x = 100 + Math.cos(radians) * radius * 1.5;
              const y = 50 + Math.sin(radians) * radius;
              
              return (
                <g key={reward.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill={reward.color}
                    opacity="0.9"
                    filter="url(#glow)"
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fill="white"
                  >
                    {reward.emoji}
                  </text>
                </g>
              );
            })}\n          </svg>

          {/* Floating math symbols */}
          <div className="math-symbols">
            {['∞', 'π', '∫', '∂', '∑', 'Δ'].map((symbol, i) => (
              <div 
                key={i}
                className={`math-symbol ${spinning ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {symbol}
              </div>
            ))}
          </div>
        </div>

        {/* Holographic Reward Card */}
        {reward && (
          <>
            {showExplosion && (
              <div className="particle-burst">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="particle"
                    style={{
                      '--angle': `${(360 / 40) * i}deg`,
                      '--color': reward.color,
                      '--delay': `${i * 0.01}s`
                    }}
                  />
                ))}
              </div>
            )}

            <div className="holographic-reward">
              <div className="holo-shimmer"></div>
              <div className="holo-scanlines"></div>
              <div className="reward-glow-bg" style={{ background: reward.color }}></div>
              
              <div className="reward-inner">
                <div className="reward-emoji-big" style={{ color: reward.color }}>
                  {reward.emoji}
                </div>
                <h3 className="reward-name" style={{
                  background: `linear-gradient(135deg, ${reward.color}, ${lightenColor(reward.color)})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {reward.label}
                </h3>
                <p className="reward-locked">QUANTUM LOCKED</p>
                <div className="reward-badge">
                  <div className="badge-shine" style={{ background: reward.color }}></div>
                  <span style={{ color: reward.color }}>+{reward.amount}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Spin Button */}
        {!spinning && !reward && (
          <button className="quantum-activate" onClick={handleSpin}>
            <div className="btn-ripple"></div>
            <div className="btn-ripple" style={{ animationDelay: '0.7s' }}></div>
            <span className="btn-label">ACTIVATE QUANTUM SPIN</span>
          </button>
        )}
      </div>
    </div>
  );
};

const lightenColor = (hex) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 255) + 60);
  const g = Math.min(255, ((num >> 8) & 255) + 60);
  const b = Math.min(255, (num & 255) + 60);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export default QuantumInfinityWheel;
