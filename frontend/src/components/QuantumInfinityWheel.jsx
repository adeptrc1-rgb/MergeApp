import React, { useState, useEffect } from 'react';
import './QuantumInfinityWheel.css';

const QuantumInfinityWheel = ({ isOpen, onClose, onRewardClaimed }) => {
  const [phase, setPhase] = useState('idle'); // idle, forming, looping, bursting, revealing
  const [reward, setReward] = useState(null);
  const [particles, setParticles] = useState([]);

  const REWARDS = [
    { id: 1, label: '2x Pulse³', color: '#00D9FF', emoji: '⚡', amount: 2 },
    { id: 2, label: '5 Super Likes', color: '#A855F7', emoji: '💜', amount: 5 },
    { id: 3, label: '100 Star Coins', color: '#FFD700', emoji: '⭐', amount: 100 },
    { id: 4, label: 'Exclusive Aura', color: '#EC4899', emoji: '✨', amount: 1 },
    { id: 5, label: '1 Pulse³', color: '#667eea', emoji: '⚡', amount: 1 },
    { id: 6, label: '50 Star Coins', color: '#FFA500', emoji: '💰', amount: 50 },
  ];

  // Generate particles when phase changes to forming
  useEffect(() => {
    if (phase === 'forming') {
      const newParticles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        startX: Math.random() * 100,
        startY: Math.random() * 100,
        color: REWARDS[i % REWARDS.length].color,
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);
    }
  }, [phase]);

  const handleActivate = async () => {
    if (phase !== 'idle') return;

    // Phase 1: Particles forming
    setPhase('forming');
    await sleep(2000);

    // Phase 2: Looping
    setPhase('looping');
    await sleep(3000);

    // Phase 3: Burst
    setPhase('bursting');
    const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setReward(selectedReward);
    await sleep(500);

    // Phase 4: Reveal
    setPhase('revealing');
    await sleep(3000);

    // Reset
    setPhase('idle');
    setReward(null);
    setParticles([]);
    onClose();
    
    if (onRewardClaimed) {
      onRewardClaimed(selectedReward);
    }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        <button className="close-x" onClick={onClose}>×</button>
        
        <h2 className="infinity-title">
          <span className="infinity-symbol-title">∞</span> Infinity Wheel
        </h2>

        {/* Main Animation Stage */}
        <div className="animation-stage">
          
          {/* Phase 1 & 3: Particles */}
          {(phase === 'forming' || phase === 'bursting') && (
            <div className="particles-layer">
              {particles.map((particle) => (
                <div
                  key={particle.id}
                  className={`particle-dot ${phase}`}
                  style={{
                    '--start-x': `${particle.startX}%`,
                    '--start-y': `${particle.startY}%`,
                    '--color': particle.color,
                    '--delay': `${particle.delay}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Phase 2: Infinity Symbol Looping */}
          {(phase === 'looping' || phase === 'bursting') && (
            <div className={`infinity-symbol-container ${phase}`}>
              <svg viewBox="0 0 200 100" className="infinity-path-svg">
                <defs>
                  <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#00D9FF', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#00D9FF', stopOpacity: 1 }} />
                  </linearGradient>
                  
                  <filter id="pathGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Thin pulsating infinity path */}
                <path
                  d="M 35,50 C 35,25 55,25 70,50 C 85,75 100,75 100,50 C 100,25 115,25 130,50 C 145,75 165,75 165,50 C 165,25 145,25 130,50 C 115,75 100,75 100,50 C 100,25 85,25 70,50 C 55,75 35,75 35,50"
                  fill="none"
                  stroke="url(#glowGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#pathGlow)"
                  className="infinity-loop-path"
                />
              </svg>
            </div>
          )}

          {/* Phase 4: Reward Reveal */}
          {phase === 'revealing' && reward && (
            <div className="reward-reveal">
              <div className="reward-emoji-large" style={{ color: reward.color }}>
                {reward.emoji}
              </div>
              <h3 className="reward-text" style={{
                background: `linear-gradient(135deg, ${reward.color}, ${shiftColor(reward.color, 60)})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {reward.label}
              </h3>
              <div className="reward-amount" style={{ color: reward.color }}>
                +{reward.amount}
              </div>
            </div>
          )}
        </div>

        {/* Activate Button */}
        {phase === 'idle' && (
          <button className="spin-activate-btn" onClick={handleActivate}>
            <div className="btn-pulse"></div>
            <span>ACTIVATE QUANTUM SPIN</span>
          </button>
        )}

        {/* Phase Debug */}
        <div className="phase-debug">{phase.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default QuantumInfinityWheel;
