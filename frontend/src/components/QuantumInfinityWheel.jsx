import React, { useState } from 'react';
import './QuantumInfinityWheel.css';

const QuantumInfinityWheel = ({ isOpen, onClose, onRewardClaimed }) => {
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState(null);
  const [showExplosion, setShowExplosion] = useState(false);

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
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setReward(selectedReward);
    setShowExplosion(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setShowExplosion(false);
    setSpinning(false);
    setReward(null);
    onClose();
    
    if (onRewardClaimed) {
      onRewardClaimed(selectedReward);
    }
  };

  const shiftColor = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 255) + amount);
    const g = Math.min(255, ((num >> 8) & 255) + amount);
    const b = Math.min(255, (num & 255) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="infinity-overlay" onClick={onClose}>
      <div className="infinity-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <h2 className="infinity-header">
          <span className="infinity-gradient">∞</span> Infinity Wheel
        </h2>

        <div className="infinity-container">
          <svg className={`infinity-svg ${spinning ? 'spinning' : 'idle'}`} viewBox="0 0 200 100">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#00D9FF' }} />
                <stop offset="50%" style={{ stopColor: '#667eea' }} />
                <stop offset="100%" style={{ stopColor: '#00D9FF' }} />
              </linearGradient>
              
              <filter id="infinityGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <path
              d="M 35,50 C 35,30 50,30 65,50 C 80,70 95,70 100,50 C 105,30 120,30 135,50 C 150,70 165,70 165,50 C 165,30 150,30 135,50 C 120,70 105,70 100,50 C 95,30 80,30 65,50 C 50,70 35,70 35,50"
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#infinityGlow)"
              className="infinity-path"
            />

            {REWARDS.map((reward, i) => {
              const angle = (i / REWARDS.length) * 360;
              const radians = (angle * Math.PI) / 180;
              const x = 100 + Math.cos(radians) * 55;
              const y = 50 + Math.sin(radians) * 30;
              
              return (
                <g key={reward.id} className="reward-segment">
                  <circle
                    cx={x}
                    cy={y}
                    r="14"
                    fill={reward.color}
                    opacity="0.95"
                    filter="url(#infinityGlow)"
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                  >
                    {reward.emoji}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="floating-symbols">
            {['∞', 'π', '∫', '∂', '∑', 'Δ'].map((symbol, i) => (
              <div 
                key={i}
                className={`float-symbol ${spinning ? 'orbit' : ''}`}
                style={{ '--delay': `${i * 0.3}s`, '--index': i }}
              >
                {symbol}
              </div>
            ))}
          </div>
        </div>

        {reward && (
          <>
            {showExplosion && (
              <div className="burst-container">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="burst-particle"
                    style={{
                      '--burst-angle': `${(360 / 40) * i}deg`,
                      '--burst-delay': `${i * 0.015}s`,
                      '--burst-color': reward.color
                    }}
                  />
                ))}
              </div>
            )}

            <div className="holo-reward-card">
              <div className="holo-shimmer-effect"></div>
              <div className="holo-scanlines"></div>
              <div className="holo-glow-bg" style={{ background: reward.color }}></div>
              
              <div className="holo-content">
                <div className="holo-emoji" style={{ color: reward.color }}>
                  {reward.emoji}
                </div>
                <h3 className="holo-title" style={{
                  background: `linear-gradient(135deg, ${reward.color}, ${shiftColor(reward.color, 60)})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {reward.label}
                </h3>
                <p className="holo-sub">QUANTUM LOCKED</p>
                
                <div className="holo-badge">
                  <div className="badge-pulse" style={{ background: reward.color }}></div>
                  <span style={{ color: reward.color }}>+{reward.amount}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {!spinning && !reward && (
          <button className="activate-btn" onClick={handleSpin}>
            <div className="btn-ripple-1"></div>
            <div className="btn-ripple-2"></div>
            <div className="btn-ripple-3"></div>
            <span className="btn-label">ACTIVATE QUANTUM SPIN</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuantumInfinityWheel;
