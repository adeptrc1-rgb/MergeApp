import React, { useState, useEffect } from 'react';
import './QuantumInfinityWheel.css';

const QuantumInfinityWheel = ({ isOpen, onClose, onRewardClaimed }) => {
  const [phase, setPhase] = useState('idle');
  const [reward, setReward] = useState(null);
  const [particles, setParticles] = useState([]);
  const [trailParticles, setTrailParticles] = useState([]);

  const REWARDS = [
    { id: 1, label: '2x Pulse³', color: '#00D9FF', emoji: '⚡', amount: 2 },
    { id: 2, label: '5 Super Likes', color: '#A855F7', emoji: '💜', amount: 5 },
    { id: 3, label: '100 Star Coins', color: '#FFD700', emoji: '⭐', amount: 100 },
    { id: 4, label: 'Exclusive Aura', color: '#EC4899', emoji: '✨', amount: 1 },
    { id: 5, label: '1 Pulse³', color: '#667eea', emoji: '⚡', amount: 1 },
    { id: 6, label: '50 Star Coins', color: '#FFA500', emoji: '💰', amount: 50 },
  ];

  useEffect(() => {
    if (phase === 'forming') {
      const newParticles = Array.from({ length: 80 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 150;
        return {
          id: i,
          x: 50 + Math.cos(angle) * distance,
          y: 50 + Math.sin(angle) * distance,
          color: REWARDS[i % REWARDS.length].color,
          size: 3 + Math.random() * 3,
          delay: Math.random() * 0.3
        };
      });
      setParticles(newParticles);
    } else if (phase === 'bursting') {
      const burstParticles = Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * Math.PI * 2;
        return {
          id: i,
          angle,
          color: reward?.color || '#00D9FF',
          delay: i * 0.01
        };
      });
      setTrailParticles(burstParticles);
    }
  }, [phase, reward]);

  const handleActivate = async () => {
    if (phase !== 'idle') return;

    setPhase('forming');
    await sleep(2500);

    setPhase('looping');
    await sleep(4000);

    const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setReward(selectedReward);
    setPhase('bursting');
    await sleep(1200);

    setPhase('revealing');
    await sleep(3500);

    setPhase('idle');
    setReward(null);
    setParticles([]);
    setTrailParticles([]);
    onClose();
    
    if (onRewardClaimed) {
      onRewardClaimed(selectedReward);
    }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  if (!isOpen) return null;

  return (
    <div className="infinity-overlay" onClick={onClose}>
      <div className="infinity-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>×</button>
        
        <h2 className="infinity-title">
          <span className="infinity-icon">∞</span> Infinity Wheel
        </h2>

        <div className="stage">
          {/* Particles Forming */}
          {phase === 'forming' && (
            <div className="particle-layer">
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="particle forming"
                  style={{
                    '--start-x': `${p.x}%`,
                    '--start-y': `${p.y}%`,
                    '--color': p.color,
                    '--size': `${p.size}px`,
                    '--delay': `${p.delay}s`
                  }}
                >
                  <div className="particle-trail"></div>
                </div>
              ))}
            </div>
          )}

          {/* Infinity Symbol Ouroboros Loop */}
          {(phase === 'looping' || phase === 'bursting') && (
            <div className={`infinity-loop-stage ${phase}`}>
              {/* Outer infinity ring */}
              <svg viewBox="0 0 240 120" className="infinity-outer">
                <defs>
                  <linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="50%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#00D9FF" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4"/>
                    <feMerge>
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 40,60 C 40,30 65,30 85,60 C 105,90 120,90 120,60 C 120,30 135,30 155,60 C 175,90 200,90 200,60 C 200,30 175,30 155,60 C 135,90 120,90 120,60 C 120,30 105,30 85,60 C 65,90 40,90 40,60"
                  fill="none"
                  stroke="url(#outerGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="path-outer"
                />
              </svg>

              {/* Inner recursive infinity */}
              <svg viewBox="0 0 240 120" className="infinity-inner">
                <path
                  d="M 60,60 C 60,45 75,45 90,60 C 105,75 120,75 120,60 C 120,45 135,45 150,60 C 165,75 180,75 180,60 C 180,45 165,45 150,60 C 135,75 120,75 120,60 C 120,45 105,45 90,60 C 75,75 60,75 60,60"
                  fill="none"
                  stroke="url(#outerGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="path-inner"
                  opacity="0.6"
                />
              </svg>

              {/* Core infinity */}
              <svg viewBox="0 0 240 120" className="infinity-core">
                <path
                  d="M 85,60 C 85,52 95,52 105,60 C 115,68 120,68 120,60 C 120,52 125,52 135,60 C 145,68 155,68 155,60 C 155,52 145,52 135,60 C 125,68 120,68 120,60 C 120,52 115,52 105,60 C 95,68 85,68 85,60"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="path-core"
                  opacity="0.9"
                />
              </svg>

              {/* Traveling light particles on path */}
              <div className="traveling-light light-1"></div>
              <div className="traveling-light light-2"></div>
              <div className="traveling-light light-3"></div>
            </div>
          )}

          {/* Burst Particles */}
          {phase === 'bursting' && (
            <div className="burst-layer">
              {trailParticles.map((p) => (
                <div
                  key={p.id}
                  className="burst-particle"
                  style={{
                    '--angle': `${p.angle}rad`,
                    '--color': p.color,
                    '--delay': `${p.delay}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Reward Reveal */}
          {phase === 'revealing' && reward && (
            <div className="reward-display">
              <div className="reward-bg-glow" style={{ background: reward.color }}></div>
              <div className="reward-emoji-huge" style={{ color: reward.color }}>
                {reward.emoji}
              </div>
              <h3 className="reward-name" style={{
                background: `linear-gradient(135deg, ${reward.color}, ${lighten(reward.color)})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {reward.label}
              </h3>
              <div className="reward-value" style={{ color: reward.color }}>
                +{reward.amount}
              </div>
            </div>
          )}
        </div>

        {phase === 'idle' && (
          <button className="activate-button" onClick={handleActivate}>
            <div className="btn-glow"></div>
            <span>ACTIVATE QUANTUM SPIN</span>
          </button>
        )}

        <div className="phase-indicator">{phase.toUpperCase()}</div>
      </div>
    </div>
  );
};

const lighten = (hex) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 255) + 70);
  const g = Math.min(255, ((num >> 8) & 255) + 70);
  const b = Math.min(255, (num & 255) + 70);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export default QuantumInfinityWheel;
