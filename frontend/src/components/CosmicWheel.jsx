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

// Wheel segments mapped to known reward "types" so the pointer and popup match
// We repeat common types to fill 8 slices, matching current backend rewards
const WHEEL_SEGMENTS = [
  { id: 1, type: 'boost', icon: REWARD_ICONS.boost, color: 'from-yellow-500 to-orange-500' },
  { id: 2, type: 'super_like', icon: REWARD_ICONS.super_like, color: 'from-blue-500 to-cyan-500' },
  { id: 3, type: 'dm', icon: REWARD_ICONS.dm, color: 'from-purple-500 to-pink-500' },
  { id: 4, type: 'star_coins', icon: REWARD_ICONS.star_coins, color: 'from-emerald-500 to-teal-500' },
  { id: 5, type: 'extra_spin', icon: REWARD_ICONS.extra_spin, color: 'from-rose-500 to-red-600' },
  { id: 6, type: 'boost', icon: REWARD_ICONS.boost, color: 'from-yellow-500 to-orange-500' },
  { id: 7, type: 'super_like', icon: REWARD_ICONS.super_like, color: 'from-blue-500 to-cyan-500' },
  { id: 8, type: 'star_coins', icon: REWARD_ICONS.star_coins, color: 'from-emerald-500 to-teal-500' }
];

export default function CosmicWheel({ isOpen, onClose, onRewardClaimed }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [wheelStatus, setWheelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAurora, setShowAurora] = useState(false);

  const isPreview = typeof window !== 'undefined' && window.location.hostname.includes('preview.emergentagent.com');

  useEffect(() => {
    if (isOpen) fetchWheelStatus();
  }, [isOpen]);

  // Ensure dev env is always spinnable for quick tests
  useEffect(() => {
    const ensureSpinnable = async () => {
      if (!isPreview) return;
      if (!wheelStatus || !wheelStatus.can_spin) {
        try { await axios.post(`${API}/api/rewards/reset-cosmic-wheel`, {}, { withCredentials: true }); } catch {}
        await fetchWheelStatus();
      }
    };
    ensureSpinnable();
  }, [isPreview, wheelStatus?.can_spin]);

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

  const segAngle = 360 / WHEEL_SEGMENTS.length;

  const computeTargetRotationForSegment = (targetIndex) => {
    // center angle of that segment
    const centerAngle = targetIndex * segAngle + segAngle / 2;
    const base = ((rotation % 360) + 360) % 360; // current normalized angle
    const offset = (360 - ((base + centerAngle) % 360)) % 360; // how much to add to bring center to pointer
    const spins = 4 + Math.floor(Math.random() * 2); // 4-5 full turns
    return rotation + spins * 360 + offset;
  };

  const spinWheel = async () => {
    if (spinning || !wheelStatus?.can_spin) {
      if (!wheelStatus?.can_spin) await fetchWheelStatus();
      return;
    }

    try {
      setSpinning(true);
      setShowReward(false);
      setError(null);
      setShowAurora(true); // start aura sweep

      // Ask backend first so we can align the pointer to the correct slice
      const response = await axios.post(`${API}/api/rewards/spin-cosmic-wheel`, {}, { withCredentials: true, validateStatus: () => true });
      const { reward, tier } = response.data;

      // Find a segment matching the reward type (choose randomly among duplicates)
      const matchingIndexes = WHEEL_SEGMENTS
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.type === reward.type)
        .map(({ i }) => i);

      if (!response || response.status >= 400) {
        setError(response?.data?.detail || 'Spin temporarily unavailable');
        setSpinning(false);
        await fetchWheelStatus();
        return;
      }

      const targetIndex = matchingIndexes.length
        ? matchingIndexes[Math.floor(Math.random() * matchingIndexes.length)]
        : Math.floor(Math.random() * WHEEL_SEGMENTS.length);

      const targetRotation = computeTargetRotationForSegment(targetIndex);
      setRotation(targetRotation);

      // After the animation completes, show the reward
      setTimeout(() => {
        const Icon = REWARD_ICONS[reward.type] || Sparkles;
        const tierColor = TIER_COLORS[tier] || TIER_COLORS.common;
        setSelectedReward({ ...reward, icon: Icon, color: tierColor, tier });
        setShowReward(true);
        setSpinning(false);
        setShowAurora(false);

        // Thematic celebration effects
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Subtle starburst + stardust trail matching theme
        createStarburstEffect(centerX, centerY);
        if (tier === 'legendary') {
          createHeartBurst(centerX, centerY);
          createStardustTrail(centerX, centerY, 60);
        } else if (tier === 'rare') {
          createStardustTrail(centerX, centerY, 35);
        } else {
          createStardustTrail(centerX, centerY, 18);
        }

        fetchWheelStatus();
        if (onRewardClaimed) onRewardClaimed(reward);
      }, 3300); // a tad longer than CSS duration
    } catch (err) {
      console.error('Error spinning wheel:', err);
      setError(err?.response?.data?.detail || 'Failed to spin wheel');
      setSpinning(false);
      setShowAurora(false);
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-purple-900/90 to-black/90 rounded-3xl p-8 max-w-lg w-full border border-white/10 relative overflow-visible">
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-purple-400"></div>
          </div>

          {/* Aurora sweep overlay while spinning (on-theme) */}
          {showAurora && (
            <div
              className="absolute w-[20rem] h-[20rem] rounded-full z-10 pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(168,85,247,0.08), rgba(236,72,153,0.08), rgba(255,255,255,0.02), rgba(168,85,247,0.08))',
                maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0) 48%, rgba(0,0,0,1) 52%)',
                WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0) 48%, rgba(0,0,0,1) 52%)',
                animation: 'spin 1200ms linear infinite'
              }}
            />
          )}

          {/* Wheel */}
          <div
            className="relative w-72 h-72 rounded-full border-4 border-purple-400/50 shadow-2xl overflow-hidden z-0"
            style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'transform 0s' }}
          >
            {/* Wheel Segments (background) */}
            {WHEEL_SEGMENTS.map((seg, index) => {
              const angle = segAngle * index;
              return (
                <div
                  key={seg.id}
                  className="absolute inset-0 origin-center overflow-hidden"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((Math.PI * 2) / WHEEL_SEGMENTS.length)}% ${50 - 50 * Math.cos((Math.PI * 2) / WHEEL_SEGMENTS.length)}%)`
                  }}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${seg.color} opacity-80`}></div>
                </div>
              );
            })}

            {/* Foreground icon ring (centered, upright) */}
            {WHEEL_SEGMENTS.map((seg, index) => {
              const angle = segAngle * index + segAngle / 2; // center of segment
              const Icon = seg.icon;
              return (
                <div key={`icon-${seg.id}`} className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${angle}deg)` }}>
                  <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) translateY(-95px) rotate(${-angle}deg)` }}>
                    <div className="bg-black/30 rounded-full p-2.5 backdrop-blur-sm border border-white/10">
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
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-4">
              {/* Tier Badge */}
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                selectedReward.tier === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
                selectedReward.tier === 'rare' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' :
                'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
              }`}>
                {selectedReward.tier?.toUpperCase()}
              </div>

              <div className={`inline-block p-4 bg-gradient-to-r ${selectedReward.color} rounded-full mb-4 shadow-[0_0_40px_rgba(168,85,247,0.35)]`}>
                {React.createElement(selectedReward.icon, { className: 'w-8 h-8 text-white' })}
              </div>
              <h3 className="text-2xl font-light text-white mb-2">You Won!</h3>
              <p className="text-xl text-purple-300 font-medium mb-2">{selectedReward.name}</p>
              <p className="text-sm text-white/60">{selectedReward.description}</p>
            </div>
            <button onClick={handleClose} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:scale-105 transition-all shadow-xl">Collect Reward</button>
          </div>
        )}

        {/* Thematic keyframes for the aurora spin */}
        <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
      </div>
    </div>
  );
}