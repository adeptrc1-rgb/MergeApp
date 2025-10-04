import React, { useState, useEffect } from 'react';
import { X, Sparkles, Heart, Zap, MessageCircle, Star } from 'lucide-react';
import { createStarburstEffect, createHeartBurst, createStardustTrail } from '../utils/particleEffects';

const rewards = [
  { id: 1, name: '1 Boost', icon: Zap, color: 'from-yellow-500 to-orange-500', value: { type: 'boost', amount: 1 } },
  { id: 2, name: '2 Super Likes', icon: Star, color: 'from-blue-500 to-cyan-500', value: { type: 'super_like', amount: 2 } },
  { id: 3, name: '1 DM', icon: MessageCircle, color: 'from-purple-500 to-pink-500', value: { type: 'dm', amount: 1 } },
  { id: 4, name: '3 Hearts', icon: Heart, color: 'from-pink-500 to-rose-600', value: { type: 'heart', amount: 3 } },
  { id: 5, name: '2 Boosts', icon: Zap, color: 'from-yellow-500 to-orange-500', value: { type: 'boost', amount: 2 } },
  { id: 6, name: '1 Super Like', icon: Star, color: 'from-blue-500 to-cyan-500', value: { type: 'super_like', amount: 1 } },
];

export default function CosmicWheel({ isOpen, onClose, onRewardClaimed }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showReward, setShowReward] = useState(false);

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setShowReward(false);
    
    // Random spins (3-5 full rotations + random position)
    const spins = 3 + Math.random() * 2;
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = (spins * 360) + randomDegree;
    
    setRotation(rotation + totalRotation);
    
    // Determine winner based on final position
    setTimeout(() => {
      const finalPosition = totalRotation % 360;
      const segmentSize = 360 / rewards.length;
      const winnerIndex = Math.floor((360 - finalPosition) / segmentSize) % rewards.length;
      const winner = rewards[winnerIndex];
      
      setSelectedReward(winner);
      setShowReward(true);
      setSpinning(false);
      
      // Create celebration effects
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      createStarburstEffect(centerX, centerY);
      createHeartBurst(centerX, centerY);
      createStardustTrail(centerX, centerY, 30);
      
      // Call parent callback with reward
      if (onRewardClaimed) {
        onRewardClaimed(winner.value);
      }
    }, 3000);
  };

  const handleClose = () => {
    if (!spinning) {
      onClose();
      setShowReward(false);
      setSelectedReward(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-purple-900/90 to-black/90 rounded-3xl p-8 max-w-lg w-full border border-white/10 relative">
        {/* Close Button */}
        {!spinning && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-purple-400 cosmic-pulse-icon" />
          </div>
          <h2 className="text-3xl font-light text-white mb-2">Cosmic Wheel</h2>
          <p className="text-white/60">Spin to reveal your mystic reward</p>
        </div>

        {/* Wheel Container */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-purple-400"></div>
          </div>

          {/* Wheel */}
          <div 
            className="relative w-64 h-64 rounded-full border-4 border-purple-400/50 overflow-hidden shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
            }}
          >
            {/* Wheel Segments */}
            {rewards.map((reward, index) => {
              const angle = (360 / rewards.length) * index;
              const Icon = reward.icon;
              
              return (
                <div
                  key={reward.id}
                  className={`absolute inset-0 origin-center`}
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((Math.PI * 2) / rewards.length)}% ${50 - 50 * Math.cos((Math.PI * 2) / rewards.length)}%)`
                  }}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${reward.color} opacity-80`}>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Center Circle */}
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-white shadow-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Spin Button */}
        {!showReward && (
          <button
            onClick={spinWheel}
            disabled={spinning}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {spinning ? 'Spinning...' : 'Spin the Wheel'}
          </button>
        )}

        {/* Reward Display */}
        {showReward && selectedReward && (
          <div className="text-center animate-fadeIn">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-4">
              <div className={`inline-block p-4 bg-gradient-to-r ${selectedReward.color} rounded-full mb-4`}>
                {React.createElement(selectedReward.icon, { className: 'w-8 h-8 text-white' })}
              </div>
              <h3 className="text-2xl font-light text-white mb-2">You Won!</h3>
              <p className="text-lg text-purple-300">{selectedReward.name}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
            >
              Collect Reward
            </button>
          </div>
        )}

        {/* Daily Spin Info */}
        <div className="mt-6 text-center text-white/40 text-sm">
          ✨ Come back tomorrow for another spin!
        </div>
      </div>
    </div>
  );
}
