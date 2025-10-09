import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Star, Settings, LogOut, Sparkles, Users, Home, Zap, Heart, MessageCircle, Award, Gift, Clock } from 'lucide-react';
import CosmicWheel from './CosmicWheel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}`;

axios.defaults.withCredentials = true;

export default function Profile({ user, logout }) {
  const navigate = useNavigate();
  const [showCosmicWheel, setShowCosmicWheel] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [wheelStatus, setWheelStatus] = useState(null);
  const [cooldownCountdown, setCooldownCountdown] = useState('');
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const location = window.location;


  useEffect(() => {
    checkDailySpinStatus();
    calculateTimeRemaining();
    
    // Update time remaining every minute
    const interval = setInterval(() => {
      calculateTimeRemaining();
      updateCooldownCountdown();
    }, 1000); // Update every second for smooth countdown
    
    // Auto-open Cosmic Wheel if URL param present
    try {
      const params = new URLSearchParams(location.search);
      const openWheel = params.get('openWheel');
      if (openWheel === '1') {
        setShowCosmicWheel(true);
        // Clean the URL so refresh doesn’t re-open
        const newUrl = window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (e) {
      // no-op if URL parsing fails
    }

    return () => clearInterval(interval);
  }, [user, wheelStatus]);

  const checkDailySpinStatus = async () => {
    try {
      const response = await axios.get(`${API}/api/rewards/cosmic-wheel-status`);
      setWheelStatus(response.data);
      setCanSpin(response.data.can_spin);
      updateCooldownCountdown(response.data);
    } catch (error) {
      console.error('Error checking spin status:', error);
    }
  };

  const updateCooldownCountdown = (status = wheelStatus) => {
    if (!status || status.can_spin || status.cooldown_hours <= 0) {
      setCooldownCountdown('');
      setCooldownProgress(100);
      return;
    }
    
    // Use the actual cooldown_hours from backend API
    const remainingHours = status.cooldown_hours;
    const totalCooldownHours = status.is_premium ? 24 : 24; // Both premium and free users get 24h cooldown
    
    // Calculate progress based on actual cooldown
    const progress = Math.min(100, Math.max(0, ((totalCooldownHours - remainingHours) / totalCooldownHours) * 100));
    setCooldownProgress(progress);
    
    // Format countdown from hours
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);
    
    if (hours > 0) {
      setCooldownCountdown(`${hours}h ${minutes}m`);
    } else {
      setCooldownCountdown(`${minutes}m`);
    }
  };

  const calculateTimeRemaining = () => {
    const now = new Date();
    const remaining = {};
    
    // Calculate time remaining for each reward type
    if (user.boosts_expiry) {
      const expiry = new Date(user.boosts_expiry);
      const diff = expiry - now;
      if (diff > 0) {
        remaining.boosts = formatTimeRemaining(diff);
      }
    }
    
    if (user.super_likes_expiry) {
      const expiry = new Date(user.super_likes_expiry);
      const diff = expiry - now;
      if (diff > 0) {
        remaining.super_likes = formatTimeRemaining(diff);
      }
    }
    
    if (user.direct_messages_expiry) {
      const expiry = new Date(user.direct_messages_expiry);
      const diff = expiry - now;
      if (diff > 0) {
        remaining.dms = formatTimeRemaining(diff);
      }
    }
    
    setTimeRemaining(remaining);
  };

  const formatTimeRemaining = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleRewardClaimed = async (reward) => {
    try {
      // Many rewards are applied server-side on spin; only call claim API when amount is valid
      if (reward && typeof reward.amount === 'number' && reward.amount > 0 && reward.type) {
        await axios.post(`${API}/api/rewards/claim-reward`, { reward_type: reward.type, amount: reward.amount }, { withCredentials: true });
      }
      // Refresh status rather than full reload for smoother UX
      await checkDailySpinStatus();
      // Do not auto-close; user will close manually via "Collect Reward"
    } catch (error) {
      console.error('Error claiming reward:', error);
      // Fallback: refetch status
      await checkDailySpinStatus();
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(user.birth_date);

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-black flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <img src="/asign-logo.png" alt="A Sign" className="h-10" />
            <button
              onClick={() => navigate('/settings')}
              className="text-white/60 hover:text-white transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-4xl font-light text-white">Profile</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Profile Header */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-6">
            <div className="flex items-start gap-6">
              {/* Profile Photo */}
              <div
                className="w-32 h-32 rounded-2xl bg-cover bg-center flex-shrink-0"
                style={{
                  backgroundImage: `url(${user.photos?.[0] || 'https://via.placeholder.com/200'})`
                }}
              />

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-4xl font-light text-white mb-3">
                  {user.first_name}, {age}
                </h2>
                <div className="flex items-center gap-3 text-white/60 mb-4">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-lg">{user.zodiac_sign}</span>
                </div>

                {/* Angel Number Badge */}
                {user.angel_number && (
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-white/80 text-sm">Angel Number: {user.angel_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Daily Cosmic Wheel */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-light text-white mb-2 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-400 cosmic-pulse-icon" />
                  Daily Cosmic Wheel
                </h3>
                <p className="text-white/60 text-sm">Spin for free rewards!</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-400 cosmic-pulse-icon" />
            </div>
            
            {/* Elegant Status Display */}
            {wheelStatus && (
              <div className="space-y-3 mb-4">
                {/* Next Spin Timer - Only show if on cooldown */}
                {!canSpin && cooldownCountdown && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-white/80 text-sm">Next spin available</span>
                      </div>
                      <span className="text-purple-200 font-medium">{cooldownCountdown}</span>
                    </div>
                    {/* Subtle progress indicator */}
                    <div className="w-full bg-white/5 rounded-full h-1 mt-3">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-1 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${cooldownProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Streak & Spins - Elegant minimalist design */}
                <div className="grid grid-cols-2 gap-3">
                  {wheelStatus.spin_streak > 0 && (
                    <div className="bg-white/5 border border-orange-400/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{wheelStatus.spin_streak}</span>
                        </div>
                        <span className="text-orange-200 text-sm font-medium">Day Streak</span>
                      </div>
                    </div>
                  )}
                  
                  {wheelStatus.spins_remaining !== undefined && wheelStatus.max_spins > 1 && (
                    <div className="bg-white/5 border border-blue-400/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: wheelStatus.max_spins }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                i < wheelStatus.spins_remaining 
                                  ? 'bg-blue-400' 
                                  : 'bg-white/20'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-blue-200 text-sm font-medium">
                          {wheelStatus.spins_remaining} left
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowCosmicWheel(true)}
              disabled={!canSpin}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                canSpin
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-105 shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {canSpin ? '✨ Spin Now' : `⏳ Next spin: ${cooldownCountdown || 'Soon'}`}
            </button>
          </div>

          {/* Free Features */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
            <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Your Free Features
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 relative">
                <Zap className="w-6 h-6 text-purple-400 mb-3" />
                <div className="text-3xl font-light text-white mb-1">
                  {user.profile_boosts || 0}
                </div>
                <div className="text-sm text-white/40 mb-2">Profile Boosts</div>
                {timeRemaining.boosts && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining.boosts}</span>
                  </div>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 relative">
                <Heart className="w-6 h-6 text-purple-400 mb-3" />
                <div className="text-3xl font-light text-white mb-1">
                  {user.super_likes || 0}
                </div>
                <div className="text-sm text-white/40 mb-2">Super Likes</div>
                {timeRemaining.super_likes && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining.super_likes}</span>
                  </div>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 col-span-2 relative">
                <MessageCircle className="w-6 h-6 text-purple-400 mb-3" />
                <div className="text-3xl font-light text-white mb-1">
                  {user.direct_messages || 0}
                </div>
                <div className="text-sm text-white/40 mb-2">Direct Messages</div>
                {timeRemaining.dms && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining.dms}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
            <h3 className="text-xl font-light text-white mb-6">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/60">Total Matches</span>
                <span className="text-white text-xl font-light">{user.total_matches || 0}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-white/60">Profile Completion</span>
                <span className="text-white text-xl font-light">100%</span>
              </div>
            </div>
          </div>

          {/* About Me */}
          {user.bio && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
              <h3 className="text-xl font-light text-white mb-3">About Me</h3>
              <p className="text-white/60 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
              <h3 className="text-xl font-light text-white mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm border border-white/10"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="flex gap-3">
            <button
              onClick={logout}
              className="flex-1 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
            {/* Dev-only Reset Wheel Button */}
            <button
              onClick={async () => {
                try {
                  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
                  const API = `${BACKEND_URL}/api`;
                  await fetch(`${API}/rewards/reset-cosmic-wheel`, { method: 'POST', credentials: 'include' });
                  await checkDailySpinStatus();
                  setShowCosmicWheel(true);
                } catch (e) {
                  console.error('Reset Cosmic Wheel failed', e);
                }
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Reset Wheel (Dev)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="profile" navigate={navigate} />

      {/* Cosmic Wheel Modal */}
      <CosmicWheel 
        isOpen={showCosmicWheel} 
        onClose={() => setShowCosmicWheel(false)}
        onRewardClaimed={handleRewardClaimed}
      />
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ currentTab, navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-around">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate('/discover')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'discover' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs">Discover</span>
        </button>
        <button
          onClick={() => navigate('/messages')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'messages' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">Messages</span>
        </button>
        <button
          onClick={() => navigate('/connections')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'connections' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-xs">Connect</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'profile' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
