import React, { useState, useEffect } from 'react';
import { X, Sparkles, Heart, Zap, MessageCircle, Star, Trophy, Gift, Eye, Flame } from 'lucide-react';
import { createStarburstEffect, createHeartBurst, createStardustTrail } from '../utils/particleEffects';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}`;

// Tier colors for visual feedback
const TIER_COLORS = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-500 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

// Icon mapping for reward types
const REWARD_ICONS = {
  boost: Zap,
  super_like: Star,
  dm: MessageCircle,
  star_coins: Sparkles,
  extra_spin: Gift,
  match_preview: Eye,
  compatibility_boost: Flame,
  insight: Heart,
  spotlight: Trophy,
  hidden_match: Heart,
  avatar_animation: Sparkles,
  cooldown_skip: Zap,
  highlight: Star,
  streak_bonus: Trophy,
  seasonal_skin: Gift
};

// 8 segments
const rewards = [
  { id: 1, icon: Zap, color: 'from-yellow-500 to-orange-500' },
  { id: 2, icon: Star, color: 'from-blue-500 to-cyan-500' },
  { id: 3, icon: MessageCircle, color: 'from-purple-500 to-pink-500' },
  { id: 4, icon: Heart, color: 'from-pink-500 to-rose-600' },
  { id: 5, icon: Zap, color: 'from-yellow-500 to-orange-500' },
  { id: 6, icon: Star, color: 'from-blue-500 to-cyan-500' },
  { id: 7, icon: Gift, color: 'from-green-500 to-teal-500' },
  { id: 8, icon: Trophy, color: 'from-orange-500 to-red-500' }
];

export default function CosmicWheel({ isOpen, onClose, onRewardClaimed }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [wheelStatus, setWheelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const isPreview = typeof window !== 'undefined' && window.location.hostname.includes('preview.emergentagent.com');

  const resetDevCooldown = async () => {
    try {
      const res = await axios.post(`${API}/api/rewards/reset-cosmic-wheel`, {}, { withCredentials: true });
      await fetchWheelStatus();
      return res.data?.success;
    } catch (e) {
      console.error('Dev reset failed', e);
      return false;
    }
  };

  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) fetchWheelStatus();
  }, [isOpen]);

  const fetchWheelStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/api/rewards/cosmic-wheel-status`, { withCredentials: true });
      setWheelStatus(response.data);
    } catch (err) {
      console.error('Error fetching wheel status:', err);
      setError(err.response?.data?.detail || 'Failed to load wheel status');
    } finally {
      setLoading(false);
    }
  };

  // Ensure dev env always spinnable (run when status loads)
  useEffect(() => {
    const ensureSpinnable = async () => {
      if (!isPreview) return;
      if (!wheelStatus || !wheelStatus.can_spin) {
        await resetDevCooldown();
        await fetchWheelStatus();
      }
    };
    ensureSpinnable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreview, wheelStatus?.can_spin]);

  const spinWheel = async () => {
    if (spinning || !wheelStatus?.can_spin) {
      if (!wheelStatus?.can_spin) await fetchWheelStatus();
      return;
    }
    try {
      setSpinning(true);
      setShowReward(false);
      setError(null);

      // Decide rotation first and then apply
      const spins = 3 + Math.random() * 2; // 3-5 turns
      const randomDegree = Math.floor(Math.random() * 360);
      const totalRotation = spins * 360 + randomDegree;
      setRotation(prev => prev + totalRotation);

      // Ask backend for the reward
      const response = await axios.post(`${API}/api/rewards/spin-cosmic-wheel`, {}, { withCredentials: true });
      const { reward, tier } = response.data;

      // After the animation completes, show the reward
      setTimeout(() => {
        const Icon = REWARD_ICONS[reward.type] || Sparkles;
        const tierColor = TIER_COLORS[tier] || TIER_COLORS.common;
        setSelectedReward({ ...reward, icon: Icon, color: tierColor, tier });
        setShowReward(true);
        setSpinning(false);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        if (tier === 'legendary') {
          createStarburstEffect(centerX, centerY);
          createHeartBurst(centerX, centerY);
          createStardustTrail(centerX, centerY, 50);
        } else if (tier === 'rare') {
          createStarburstEffect(centerX, centerY);
          createStardustTrail(centerX, centerY, 30);
        } else {
          createStardustTrail(centerX, centerY, 15);
        }

        fetchWheelStatus();
        if (onRewardClaimed) onRewardClaimed(reward);
      }, 3000);
    } catch (err) {
      console.error('Error spinning wheel:', err);
      setError(err?.response?.data?.detail || 'Failed to spin wheel');
      setSpinning(false);
      fetchWheelStatus();
    }
  };

  const handleClose = () => {
    if (!spinning) {
      onClose?.();
      setShowReward(false);
      setSelectedReward(null);
    }
  };

  if (!isOpen) return null;

  const segAngle = 360 / rewards.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-purple-900/90 to-black/90 rounded-3xl p-8 max-w-lg w-full border border-white/10 relative">
        {/* Close Button */}
        {!spinning && (
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
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

          {/* Spin Status */}
          {wheelStatus && !loading && (
            <div className="mt-4 space-y-3">
              {wheelStatus.can_spin ? (
                <p className="text-green-400 text-sm">✨ Spin available now!</p>
              ) : (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-white/80 text-xs">Next spin</span>
                    </div>
                    <span className="text-purple-200 text-xs font-medium">
                      {wheelStatus.cooldown_hours < 1 ? `${Math.round(wheelStatus.cooldown_hours * 60)}m` : `${wheelStatus.cooldown_hours.toFixed(1)}h`}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                {wheelStatus.spin_streak > 0 && (
                  <div className="bg-white/5 border border-orange-400/20 rounded-lg px-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{wheelStatus.spin_streak}</span>
                      </div>
                      <span className="text-orange-200 text-xs font-medium">streak</span>
                    </div>
                  </div>
                )}
                {wheelStatus.spins_remaining > 0 && wheelStatus.max_spins > 1 && (
                  <div className="bg-white/5 border border-blue-400/20 rounded-lg px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: wheelStatus.max_spins }, (_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < wheelStatus.spins_remaining ? 'bg-blue-400' : 'bg-white/20'}`} />
                        ))}
                      </div>
                      <span className="text-blue-200 text-xs font-medium">left</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading wheel...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Wheel Container */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-purple-400"></div>
          </div>

          {/* Wheel */}
          <div
            className="relative w-72 h-72 rounded-full border-4 border-purple-400/50 shadow-2xl overflow-hidden"
            style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'transform 0s' }}
          >
            {/* Wheel Segments (background) */}
            {rewards.map((reward, index) => {
              const angle = segAngle * index;
              return (
                <div
                  key={reward.id}
                  className="absolute inset-0 origin-center overflow-hidden"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((Math.PI * 2) / rewards.length)}% ${50 - 50 * Math.cos((Math.PI * 2) / rewards.length)}%)`
                  }}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${reward.color} opacity-80`}></div>
                </div>
              );
            })}

            {/* Foreground icon ring (centered, upright) */}
            {rewards.map((reward, index) => {
              const angle = segAngle * index + segAngle / 2; // center of segment
              const Icon = reward.icon;
              const rotateStyle = `rotate(${angle}deg)`;
              const unrotateStyle = `rotate(${-angle}deg)`;
              return (
                <div key={`icon-${reward.id}`} className="absolute inset-0 pointer-events-none" style={{ transform: rotateStyle }}>
                  <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) translateY(-95px) ${unrotateStyle}` }}>
                    <div className="bg-white/20 rounded-full p-2.5 backdrop-blur-sm">
                      <Icon className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Center Circle */}
            <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-white shadow-lg flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Spin Button */}
        {!showReward && (
          <button onClick={spinWheel} disabled={spinning} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl">
            {spinning ? 'Spinning...' : 'Spin the Wheel'}
          </button>
        )}

        {/* Reward Display */}
        {showReward && selectedReward && (
          <div className="text-center animate-fadeIn">
            {/* Dev helpers */}
            {isPreview && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 text-xs text-white/50">
                <button
                  onClick={async () => { await resetDevCooldown(); await fetchWheelStatus(); }}
                  className="px-2 py-1 bg-white/10 rounded"
                >Reset</button>
                <button
                  onClick={() => { setRotation(prev => prev + 360); }}
                  className="px-2 py-1 bg-white/10 rounded"
                >Demo Spin</button>
              </div>
            )}

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-4">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                selectedReward.tier === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
                selectedReward.tier === 'rare' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' :
                'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
              }`}>
                {selectedReward.tier?.toUpperCase()}
              </div>
              <div className={`inline-block p-4 bg-gradient-to-r ${selectedReward.color} rounded-full mb-4`}>
                {React.createElement(selectedReward.icon, { className: 'w-8 h-8 text-white' })}
              </div>
              <h3 className="text-2xl font-light text-white mb-2">You Won!</h3>
              <p className="text-xl text-purple-300 font-medium mb-2">{selectedReward.name}</p>
              <p className="text-sm text-white/60">{selectedReward.description}</p>
            </div>
            <button onClick={handleClose} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:scale-105 transition-all shadow-xl">Collect Reward</button>
          </div>
        )}

        {/* Spin Info */}
        {!loading && !showReward && (
          <div className="mt-6 text-center text-white/40 text-sm">
            {wheelStatus?.is_premium ? <p>✨ Premium: 3 spins per day!</p> : <p>✨ Free: 1 spin every 48 hours</p>}
          </div>
        )}
      </div>
    </div>
  );
}