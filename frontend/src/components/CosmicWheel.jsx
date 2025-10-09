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

const WHEEL_SIZE = 320; // px (w-80/h-80)

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
    const centerAngle = targetIndex * segAngle + segAngle / 2;
    const base = ((rotation % 360) + 360) % 360;
    const offset = (360 - ((base + centerAngle) % 360)) % 360;
    const spins = 4 + Math.floor(Math.random() * 2); // 4-5 turns
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
      setShowAurora(true);

      // Ask backend for reward first, then aim the pointer to that slice
      const response = await axios.post(`${API}/api/rewards/spin-cosmic-wheel`, {}, { withCredentials: true, validateStatus: () => true });
      if (!response || response.status >= 400) {
        setError(response?.data?.detail || 'Spin temporarily unavailable');
        setSpinning(false);
        await fetchWheelStatus();
        return;
      }
      const { reward, tier } = response.data;

      const matchingIndexes = WHEEL_SEGMENTS
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.type === reward.type)
        .map(({ i }) => i);

      const targetIndex = matchingIndexes.length
        ? matchingIndexes[Math.floor(Math.random() * matchingIndexes.length)]
        : Math.floor(Math.random() * WHEEL_SEGMENTS.length);

      const targetRotation = computeTargetRotationForSegment(targetIndex);
      setRotation(targetRotation);

      setTimeout(() => {
        const Icon = REWARD_ICONS[reward.type] || Sparkles;
        const tierColor = TIER_COLORS[tier] || TIER_COLORS.common;
        setSelectedReward({ ...reward, icon: Icon, color: tierColor, tier });
        setShowReward(true);
        setSpinning(false);
        setShowAurora(false);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
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
      }, 3200);
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
        <div className="text-center mb-7">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-4 border border-white/10">
            <Sparkles className="w-8 h-8 text-purple-300" />
          </div>
          <h2 className="text-3xl font-light text-white mb-1">Cosmic Wheel</h2>
          <p className="text-white/60 text-sm">Spin to reveal your mystic reward</p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading wheel...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Wheel Container */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Pointer (elegant neon) */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="relative">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]"></div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[10px] h-[10px] bg-white/70 rounded-full blur-[2px]"></div>
            </div>
          </div>

          {/* Spinning aurora overlay */}
          {showAurora && (
            <div
              className="absolute rounded-full z-10 pointer-events-none"
              style={{
                width: WHEEL_SIZE + 8,
                height: WHEEL_SIZE + 8,
                background: 'conic-gradient(from 0deg, rgba(168,85,247,0.08), rgba(236,72,153,0.08), rgba(255,255,255,0.02), rgba(168,85,247,0.08))',
                maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0) 48%, rgba(0,0,0,1) 52%)',
                WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0) 48%, rgba(0,0,0,1) 52%)',
                animation: 'spin 1200ms linear infinite'
              }}
            />
          )}

          {/* Outer glow ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: WHEEL_SIZE + 28,
              height: WHEEL_SIZE + 28,
              boxShadow: '0 0 60px rgba(168,85,247,0.25), inset 0 0 40px rgba(236,72,153,0.15)'
            }}
          />

          {/* Wheel */}
          <div
            className="relative rounded-full border-4 border-purple-400/50 shadow-2xl overflow-hidden z-0"
            style={{
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.2s cubic-bezier(0.14, 0.7, 0, 1.02)' : 'transform 0s'
            }}
          >
            {/* Subtle inner vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), rgba(0,0,0,0.2) 70%)' }} />

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
                  <div className={`w-full h-full bg-gradient-to-br ${seg.color} opacity-85`} />
                </div>
              );
            })}

            {/* Segment separators (spokes) */}
            {WHEEL_SEGMENTS.map((_, i) => (
              <div
                key={`sep-${i}`}
                className="absolute left-1/2 top-1/2 w-[1px] h-[48%] bg-white/20"
                style={{ transform: `translate(-50%, -100%) rotate(${i * segAngle}deg)` }}
              />
            ))}

            {/* Foreground icon ring (centered, upright, glassy) */}
            {WHEEL_SEGMENTS.map((seg, index) => {
              const angle = segAngle * index + segAngle / 2; // center of segment
              const Icon = seg.icon;
              return (
                <div key={`icon-${seg.id}`} className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${angle}deg)` }}>
                  <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) translateY(-110px) rotate(${-angle}deg)` }}>
                    <div className="bg-white/10 border border-white/15 rounded-xl p-2.5 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
                      <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Center Medallion (keep sparkles icon as requested) */}
            <div className="absolute inset-0 m-auto w-24 h-24 rounded-full border-4 border-white/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center"
                 style={{ background: 'radial-gradient(circle at 30% 30%, rgba(236,72,153,0.6), rgba(139,92,246,0.7))' }}>
              <Sparkles className="w-9 h-9 text-white" />
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
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                selectedReward.tier === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
                selectedReward.tier === 'rare' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' :
                'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
              }`}>
                {selectedReward.tier?.toUpperCase()}
              </div>
              <div className={`inline-block p-4 bg-gradient-to-r ${selectedReward.color} rounded-full mb-4 shadow-[0_0_40px_rgba(168,85,247,0.35)]`}>
                {React.createElement(selectedReward.icon, { className: 'w-9 h-9 text-white' })}
              </div>
              <h3 className="text-2xl font-light text-white mb-2">You Won!</h3>
              <p className="text-xl text-purple-300 font-medium mb-2">{selectedReward.name}</p>
              {selectedReward.amount ? (
                <p className="text-sm text-white/60">x{selectedReward.amount}</p>
              ) : null}
            </div>
            <button onClick={handleClose} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:scale-105 transition-all shadow-xl">Collect Reward</button>
          </div>
        )}

        {/* Thematic keyframes */}
        <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
      </div>
    </div>
  );
}