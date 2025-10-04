import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Star, Settings, LogOut, Sparkles, Users, Home, Zap, Heart, MessageCircle, Award, Gift, Clock } from 'lucide-react';
import CosmicWheel from './CosmicWheel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function Profile({ user, logout }) {
  const navigate = useNavigate();
  const [showCosmicWheel, setShowCosmicWheel] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    checkDailySpinStatus();
    calculateTimeRemaining();
    
    // Update time remaining every minute
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const checkDailySpinStatus = async () => {
    try {
      const response = await axios.get(`${API}/rewards/daily-spin-status`);
      setCanSpin(response.data.can_spin);
    } catch (error) {
      console.error('Error checking spin status:', error);
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
      await axios.post(`${API}/rewards/claim-reward?reward_type=${reward.type}&amount=${reward.amount}`);
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error claiming reward:', error);
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-light text-white">A Sign</h1>
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
      <div className="flex-1 overflow-y-auto pb-24">
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
            <button
              onClick={() => setShowCosmicWheel(true)}
              disabled={!canSpin}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                canSpin
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-105'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {canSpin ? '✨ Spin Now' : '🕐 Come back tomorrow'}
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
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/60">Responsiveness Score</span>
                <span className="text-white text-xl font-light">{user.responsiveness_score || 80}/100</span>
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
          <button
            onClick={logout}
            className="w-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
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
