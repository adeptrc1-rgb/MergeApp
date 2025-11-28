import React, { useState } from 'react';
import './QuantumInfinityWheel.css';

const QuantumInfinityWheel = ({ isOpen, onClose, onRewardClaimed }) => {
  const [spinning, setSpinning] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [reward, setReward] = useState(null);

  const REWARDS = [
    { id: 1, label: '2x Pulse³', color: '#667eea', amount: 2 },
    { id: 2, label: '5 Super Likes', color: '#764ba2', amount: 5 },
    { id: 3, label: '100 Star Coins', color: '#8B7AB8', amount: 100 },
    { id: 4, label: 'Exclusive Aura', color: '#9B8AC4', amount: 1 },
    { id: 5, label: '1 Pulse³', color: '#667eea', amount: 1 },
    { id: 6, label: '50 Star Coins', color: '#8B7AB8', amount: 50 },
  ];

  const handleActivate = async () => {
    if (spinning) return;
    
    setSpinning(true);
    
    // Elegant spin - 2.5 seconds
    await sleep(2500);
    
    // Select reward
    const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setReward(selectedReward);
    setRevealing(true);
    
    // Show reward
    await sleep(3000);
    
    // Reset
    setSpinning(false);
    setRevealing(false);
    setReward(null);
    onClose();
    
    if (onRewardClaimed) {
      onRewardClaimed(selectedReward);
    }
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  if (!isOpen) return null;

  return (
    <div className="liquid-overlay" onClick={onClose}>
      <div className="liquid-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>×</button>
        
        <h2 className="modal-title">
          <span className="title-symbol">∞</span> Infinity Wheel
        </h2>

        <div className="wheel-stage">
          {/* Liquid Mathematics Wheel */}
          <div className={`infinity-wheel ${spinning ? 'spinning' : ''} ${revealing ? 'revealing' : ''}`}>
            <div className="wheel-gradient"></div>
            <div className="infinity-symbol">∞</div>
            
            {/* Subtle liquid ripple */}
            <div className="liquid-ripple"></div>
            <div className="liquid-ripple" style={{ animationDelay: '0.6s' }}></div>
          </div>

          {/* Reward Reveal */}
          {revealing && reward && (
            <div className="reward-card">
              <div className="card-shine"></div>
              <div className="reward-info">
                <h3 className="reward-label">{reward.label}</h3>
                <div className="reward-amount">+{reward.amount}</div>
              </div>
            </div>
          )}
        </div>

        {!spinning && !revealing && (
          <button className="elegant-activate" onClick={handleActivate}>
            <div className="btn-liquid"></div>
            <span>ACTIVATE</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuantumInfinityWheel;
