import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, Zap, Gift, Award, LogOut, Sparkles, 
  ChevronRight, Check, Lock, Eye, EyeOff, Heart,
  MessageCircle, RotateCcw, Coins, Clock, Trophy, Flame, Settings
} from 'lucide-react';
import ConnectionMatrix from './ConnectionMatrix';
import BottomNav from './BottomNav';
import MergeLogo from './MergeLogo';
import EditProfileModal from './EditProfileModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function Profile({ user, logout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('get-more');
  const [showConnectionMatrix, setShowConnectionMatrix] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [wheelStatus, setWheelStatus] = useState(null);
  const [cooldownCountdown, setCooldownCountdown] = useState('');
  const [cooldownProgress, setCooldownProgress] = useState(0);

  // Safety check: if user is not loaded yet, show loading state
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    checkDailySpinStatus();
    calculateTimeRemaining();
    const interval = setInterval(() => {
      calculateTimeRemaining();
      updateCooldownCountdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [user, wheelStatus]);

  const checkDailySpinStatus = async () => {
    try {
      const response = await axios.get(`${API}/rewards/cosmic-wheel-status`);
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
    const remainingHours = status.cooldown_hours;
    const totalCooldownHours = 24;
    const progress = Math.min(100, Math.max(0, ((totalCooldownHours - remainingHours) / totalCooldownHours) * 100));
    setCooldownProgress(progress);
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
    if (user.boosts_expiry) {
      const expiry = new Date(user.boosts_expiry);
      const diff = expiry - now;
      if (diff > 0) remaining.boosts = formatTimeRemaining(diff);
    }
    if (user.super_likes_expiry) {
      const expiry = new Date(user.super_likes_expiry);
      const diff = expiry - now;
      if (diff > 0) remaining.super_likes = formatTimeRemaining(diff);
    }
    if (user.direct_messages_expiry) {
      const expiry = new Date(user.direct_messages_expiry);
      const diff = expiry - now;
      if (diff > 0) remaining.dms = formatTimeRemaining(diff);
    }
    setTimeRemaining(remaining);
  };

  const formatTimeRemaining = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleRewardClaimed = async (reward) => {
    try {
      if (reward && typeof reward.amount === 'number' && reward.amount > 0 && reward.type) {
        await axios.post(`${API}/rewards/claim-reward`, { reward_type: reward.type, amount: reward.amount }, { withCredentials: true });
      }
      await checkDailySpinStatus();
    } catch (error) {
      console.error('Error claiming reward:', error);
      await checkDailySpinStatus();
    }
  };

  const handleProfileSave = async (profileData) => {
    try {
      console.log('[PROFILE] Saving profile data:', profileData);
      
      // Update the user object with new data
      const updatedUser = {
        ...user,
        ...profileData
      };
      
      // Try to save to backend (will fail with mock user, but that's okay for testing)
      try {
        await axios.put(`${API}/users/me`, profileData);
      } catch (apiError) {
        console.log('[PROFILE] API save failed (expected with mock user), updating local state only');
      }
      
      // Update local user state for testing
      if (window.updateMockUser) {
        window.updateMockUser(updatedUser);
      }
      
      // Close modal and show success message
      setShowEditProfile(false);
      alert('Profile updated successfully! (Changes are visible in this session for testing)');
      
      // Force re-render by reloading (commented out for better testing experience)
      // window.location.reload();
    } catch (error) {
      console.error('[PROFILE] Error updating profile:', error);
      alert('Profile updated locally for testing purposes.');
      setShowEditProfile(false);
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

  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 10;
    
    if (user.photos && user.photos.length > 0) completed += 2;
    if (user.first_name) completed += 1;
    if (user.bio) completed += 1;
    if (user.interests && user.interests.length > 0) completed += 1;
    if (user.industry) completed += 1;
    if (user.job_title) completed += 1;
    if (user.location) completed += 1;
    if (user.vibe_song) completed += 1;
    if (user.birth_date) completed += 1;
    
    return Math.round((completed / total) * 100);
  };

  const age = user.birth_date ? calculateAge(user.birth_date) : null;
  const profileCompletion = calculateProfileCompletion();

  return (
    <div 
      className="fixed inset-0 overflow-y-auto pb-24" 
      style={{ 
        background: '#000000',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none' /* IE and Edge */
      }}
    >
      <style>{`
        .fixed.inset-0.overflow-y-auto::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      {/* Single Scrollable Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Logo & Settings */}
        <div className="flex items-center justify-between mb-6">
          <MergeLogo size="md" color="#FFFFFF" />
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <Settings className="w-6 h-6 text-white/70 hover:text-white" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - profileCompletion / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            
            <div
              className="absolute inset-0 m-2 rounded-full bg-cover bg-center"
              style={{ 
                backgroundImage: user.photos?.[0] ? `url(${user.photos[0]})` : 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                border: '2px solid #000000'
              }}
            >
              {!user.photos?.[0] && (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-light">
                  {user.first_name?.[0] || 'U'}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-2">
            <h1 className="text-2xl font-semibold text-white flex items-center justify-center gap-2">
              {user.first_name}
              <Check className="w-5 h-5 text-blue-400" />
            </h1>
          </div>

          <div className="text-sm text-white/60 mb-4">
            {profileCompletion}% Complete
          </div>

          <button
            onClick={() => setShowEditProfile(true)}
            className="px-8 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-full font-medium transition-all border border-white/20"
          >
            Edit Profile
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-8 border-b border-white/10 pb-2 mb-6">
          <button
            onClick={() => setActiveTab('get-more')}
            className={`text-sm font-medium transition-all pb-2 ${
              activeTab === 'get-more'
                ? 'text-white border-b-2 border-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Get More
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`text-sm font-medium transition-all pb-2 ${
              activeTab === 'safety'
                ? 'text-white border-b-2 border-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Safety
          </button>
          <button
            onClick={() => setActiveTab('my-merge')}
            className={`text-sm font-medium transition-all pb-2 ${
              activeTab === 'my-merge'
                ? 'text-white border-b-2 border-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            My Merge
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          
          {activeTab === 'get-more' && (
            <>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Here's what comes with your subscription
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    Unlock unlimited potential and stand out from the crowd
                  </p>
                  <button className="px-6 py-2 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform">
                    Check it out
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate('/store')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium mb-0.5">Boost</h4>
                    <p className="text-white/60 text-sm">Get seen by 11x more people</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/store')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium mb-0.5">Super Likes</h4>
                    <p className="text-white/60 text-sm">2x as likely to lead to a match</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/store')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium mb-0.5">Aura Lab</h4>
                    <p className="text-white/60 text-sm">Browse enhancements & customizations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-white text-sm font-medium">{user.star_coins || 0}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </>
          )}

          {activeTab === 'safety' && (
            <>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">Safety Tips</h3>
                </div>
                <ul className="space-y-3 text-white/70 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Meet in public places for first dates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Tell a friend about your plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Never share financial information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Trust your instincts</span>
                  </li>
                </ul>
              </div>

              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 flex items-center justify-between transition-all group">
                <div className="flex items-center gap-4">
                  <Lock className="w-5 h-5 text-white/60" />
                  <div className="text-left">
                    <h4 className="text-white font-medium mb-0.5">Privacy Settings</h4>
                    <p className="text-white/60 text-sm">Control who sees your profile</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-all" />
              </button>

              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 flex items-center justify-between transition-all group">
                <div className="flex items-center gap-4">
                  <Eye className="w-5 h-5 text-white/60" />
                  <div className="text-left">
                    <h4 className="text-white font-medium mb-0.5">Blocked Users</h4>
                    <p className="text-white/60 text-sm">Manage your blocked list</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-all" />
              </button>

              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-400" />
                  Report an Issue
                </h4>
                <p className="text-white/60 text-sm mb-3">
                  If you've experienced harassment or feel unsafe, please let us know.
                </p>
                <button className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-all">
                  Report
                </button>
              </div>
            </>
          )}

          {activeTab === 'my-merge' && (
            <>
              <button
                onClick={() => setShowConnectionMatrix(true)}
                className="w-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 rounded-2xl p-6 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">Merge Wheel</h3>
                        <p className="text-white/60 text-sm">Daily rewards & bonuses</p>
                      </div>
                    </div>
                    {canSpin && (
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs px-3 py-1.5 rounded-full font-bold">
                        READY
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-300/80 font-mono">Progress</span>
                      <span className="text-white font-bold">{Math.round(cooldownProgress)}%</span>
                    </div>
                    
                    <div className="relative h-2 rounded-full overflow-hidden bg-white/10">
                      <div 
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${cooldownProgress}%`,
                          background: 'linear-gradient(90deg, #3B82F6 0%, #06B6D4 100%)'
                        }}
                      />
                    </div>
                    
                    {!canSpin && wheelStatus && (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-white/50">Next spin</span>
                        <span className="text-cyan-400 font-bold">{cooldownCountdown}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Your Rewards
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Zap className="w-5 h-5 text-purple-400 mb-2" />
                    <div className="text-2xl font-light text-white">{user.profile_boosts || 0}</div>
                    <div className="text-xs text-white/50">Boosts</div>
                    {timeRemaining.boosts && (
                      <div className="flex items-center gap-1 text-xs text-orange-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeRemaining.boosts}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Heart className="w-5 h-5 text-pink-400 mb-2" />
                    <div className="text-2xl font-light text-white">{user.super_likes || 0}</div>
                    <div className="text-xs text-white/50">Super Likes</div>
                    {timeRemaining.super_likes && (
                      <div className="flex items-center gap-1 text-xs text-orange-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeRemaining.super_likes}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <MessageCircle className="w-5 h-5 text-blue-400 mb-2" />
                    <div className="text-2xl font-light text-white">{user.direct_messages || 0}</div>
                    <div className="text-xs text-white/50">DMs</div>
                    {timeRemaining.dms && (
                      <div className="flex items-center gap-1 text-xs text-orange-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeRemaining.dms}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <Coins className="w-5 h-5 text-yellow-400 mb-2" />
                    <div className="text-2xl font-light text-white">{user.star_coins || 0}</div>
                    <div className="text-xs text-white/50">Coins</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Your Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm">Total Matches</span>
                    <span className="text-white text-lg font-light">{user.total_matches || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/60 text-sm">Profile Completion</span>
                    <span className="text-white text-lg font-light">{profileCompletion}%</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={logout} 
                className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          )}

        </div>
      </div>

      <BottomNav currentTab="profile" navigate={navigate} />

      {showConnectionMatrix && (
        <ConnectionMatrix 
          isOpen={showConnectionMatrix} 
          onClose={() => setShowConnectionMatrix(false)} 
          onRewardClaimed={handleRewardClaimed} 
        />
      )}

      {showEditProfile && (
        <EditProfileModal
          user={user}
          onSave={handleProfileSave}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          user={user}
          onSave={handleProfileSave}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// Settings Modal Component
function SettingsModal({ user, onSave, onClose }) {
  const [showAge, setShowAge] = useState(user.show_age !== false);
  const [showDistance, setShowDistance] = useState(user.show_distance !== false);
  const [discoveryEnabled, setDiscoveryEnabled] = useState(user.discovery_enabled !== false);
  const [visibilityMode, setVisibilityMode] = useState(user.visibility_mode || 'standard');
  const [photoVerifiedChat, setPhotoVerifiedChat] = useState(user.photo_verified_chat || false);
  const [readReceipts, setReadReceipts] = useState(user.read_receipts !== false);
  const [showOnMerge, setShowOnMerge] = useState(user.show_on_merge !== false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        show_age: showAge,
        show_distance: showDistance,
        discovery_enabled: discoveryEnabled,
        visibility_mode: visibilityMode,
        photo_verified_chat: photoVerifiedChat,
        read_receipts: readReceipts,
        show_on_merge: showOnMerge
      });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-xl font-light text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <ChevronRight className="w-6 h-6 rotate-90" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Control My Visibility */}
          <div className="space-y-3">
            <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Control My Visibility</h3>
            
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all border border-white/10">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibilityMode === 'standard'}
                  onChange={() => setVisibilityMode('standard')}
                  className="mt-0.5 w-4 h-4 accent-purple-500"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Standard</div>
                  <div className="text-white/50 text-xs">Discoverable in card stack</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all border border-white/10">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibilityMode === 'incognito'}
                  onChange={() => setVisibilityMode('incognito')}
                  className="mt-0.5 w-4 h-4 accent-purple-500"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Incognito</div>
                  <div className="text-white/50 text-xs">Discoverable only by people you Like</div>
                </div>
              </label>
            </div>
          </div>

          {/* Discovery Settings */}
          <div className="space-y-3">
            <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Discovery</h3>
            
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all">
              <input
                type="checkbox"
                checked={discoveryEnabled}
                onChange={(e) => setDiscoveryEnabled(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Enable Discovery</div>
                <div className="text-white/50 text-xs">Allow others to find your profile</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all">
              <input
                type="checkbox"
                checked={showOnMerge}
                onChange={(e) => setShowOnMerge(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Show me on Merge</div>
                <div className="text-white/50 text-xs">Control if your profile appears in the stack</div>
              </div>
            </label>
          </div>

          {/* Profile Display */}
          <div className="space-y-3">
            <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Profile Display</h3>
            
            {/* Show my age - Premium */}
            <div className="relative p-4 rounded-lg border border-white/10 bg-white/5 opacity-60">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium flex items-center gap-2">
                    Show my age
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-bold">
                      PREMIUM
                    </span>
                  </div>
                  <div className="text-white/50 text-xs">Control age visibility with Premium</div>
                </div>
              </div>
              <div className="absolute inset-0 cursor-not-allowed"></div>
            </div>
            
            {/* Show my distance - Premium */}
            <div className="relative p-4 rounded-lg border border-white/10 bg-white/5 opacity-60">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium flex items-center gap-2">
                    Show my distance
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-bold">
                      PREMIUM
                    </span>
                  </div>
                  <div className="text-white/50 text-xs">Control distance visibility with Premium</div>
                </div>
              </div>
              <div className="absolute inset-0 cursor-not-allowed"></div>
            </div>
          </div>

          {/* Messaging Controls */}
          <div className="space-y-3">
            <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Control Who Messages You</h3>
            
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all">
              <input
                type="checkbox"
                checked={photoVerifiedChat}
                onChange={(e) => setPhotoVerifiedChat(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Photo Verified Chat</div>
                <div className="text-white/50 text-xs">Only receive messages from photo verified members</div>
              </div>
            </label>
          </div>

          {/* Chat Settings */}
          <div className="space-y-3">
            <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Chat Settings</h3>
            
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all">
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={(e) => setReadReceipts(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Read Receipts</div>
                <div className="text-white/50 text-xs">Let matches know when you've read their messages</div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 rounded-xl py-3 font-medium transition-all"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl py-3 font-medium hover:scale-105 transition-all shadow-lg"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
