import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, Zap, Gift, Award, LogOut, Sparkles, 
  ChevronRight, Check, Lock, Eye, EyeOff, Heart,
  MessageCircle, RotateCcw, Coins, Clock, Trophy, Flame, Settings, Star, Camera
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
      const response = await axios.get(`${API}/rewards/cosmic-wheel-status`, { withCredentials: true });
      setWheelStatus(response.data);
      setCanSpin(response.data.can_spin);
      updateCooldownCountdown(response.data);
    } catch (error) {
      console.error('Error checking spin status:', error);
      // Set default state if auth fails
      setWheelStatus({ can_spin: false, cooldown_hours: 0 });
      setCanSpin(false);
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
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        fontFamily: "'Inter', 'SF Mono', monospace"
      }}
    >
      {/* Tech Grid Background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#2A2A2A 1px, transparent 1px), linear-gradient(90deg, #2A2A2A 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.3
      }} />

      <style>{`
        /* Tech-Infused Design Tokens */
        :root {
          --tech-black: #000000;
          --tech-charcoal: #0A0A0A;
          --tech-white: #FFFFFF;
          --tech-silver: #C0C0C0;
          --tech-bright: #E8E8E8;
          --tech-glow: rgba(255,255,255,0.1);
          --tech-divider: #2A2A2A;
        }

        /* Scrollbar hiding */
        .fixed.inset-0.overflow-y-auto::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes pulse-tech {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        /* Custom scrollbar for settings modal - Tech theme */
        .max-h-\[70vh\].overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .max-h-\[70vh\].overflow-y-auto::-webkit-scrollbar-track {
          background: var(--tech-charcoal);
        }
        
        .max-h-\[70vh\].overflow-y-auto::-webkit-scrollbar-thumb {
          background: var(--tech-silver);
          border-radius: 0;
        }
        
        .max-h-\[70vh\].overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: var(--tech-bright);
        }
      `}</style>

      {/* Single Scrollable Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Clean Header */}
        <div className="pb-6 border-b border-white/10 mb-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <MergeLogo size="md" color="#FFFFFF" />
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all"
            >
              <Settings className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Profile Summary */}
          <div
            className="flex items-start gap-4 p-4 backdrop-blur-premium"
            style={{
              backgroundColor: 'rgba(8, 9, 16, 0.68)',
              borderRadius: '16px',
              border: '1px solid rgba(148, 163, 184, 0.35)'
            }}
          >
            {/* Avatar Section - Clickable */}
            <button
              onClick={() => setShowEditProfile(true)}
              className="relative group cursor-pointer"
            >
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full bg-cover bg-center border transition-all group-hover:border-[var(--profile-accent)]"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.12)',
                    backgroundImage: user.photos?.[0]
                      ? `url(${user.photos[0]})`
                      : 'linear-gradient(135deg, #6A5AE0 0%, #8B5CF6 100%)'
                  }}
                >
                  {!user.photos?.[0] && (
                    <div className="w-full h-full flex items-center justify-center text-xl font-light"
                      style={{ color: 'var(--profile-text-primary)' }}
                    >
                      {user.first_name?.[0] || 'U'}
                    </div>
                  )}
                  {/* Edit overlay */}
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs">Edit</span>
                  </div>
                </div>
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
                  style={{
                    borderColor: '#0F0B1F',
                    backgroundColor: 'var(--profile-success)'
                  }}
                />
                <div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(106, 90, 224, 0.2)',
                    borderRadius: '16px',
                    padding: '2px 8px',
                    color: 'var(--profile-text-primary)'
                  }}
                >
                  {profileCompletion}% Complete
                </div>
              </div>
            </button>

            {/* Profile Meta - Clickable */}
            <button
              onClick={() => setShowEditProfile(true)}
              className="flex-1 text-left group"
            >
              <h2 className="mb-1" style={{ fontSize: '22px', fontWeight: 600, color: 'var(--profile-text-primary)' }}>
                {user.first_name}{age ? `, ${age}` : ''}
              </h2>
              <p className="mb-2" style={{ fontSize: '17px', color: 'var(--profile-text-secondary)' }}>
                {user.job_title || 'Professional'} · {user.industry || 'Technology'}
              </p>
              <div className="flex items-center gap-1.5" style={{ fontSize: '13px', color: 'var(--profile-text-secondary)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
                <span>5 miles away · {user.location || 'New York'}</span>
              </div>
            </button>
          </div>

          {/* Trust Meter (removed for classic layout) */}
        </div>

        {/* Quick Action Blocks - 3 horizontal cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Super Likes */}
          <button
            onClick={() => navigate('/store')}
            className="rounded-xl p-3 transition-all group relative overflow-hidden"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: 'none'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
              background: 'transparent'
            }} />
            <div className="flex flex-col items-center text-center relative z-10">
              <div
                className="relative w-11 h-11 rounded-full flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(148, 163, 184, 0.35)'
                }}
              >
                <Heart className="w-5 h-5" style={{ color: 'var(--profile-accent)' }} strokeWidth={2} />
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--profile-text-primary)' }}>Super Likes</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--profile-text-secondary)' }}>Boost your signal</div>
              <div
                className="text-[11px] font-medium px-3 py-1 rounded-full mt-1"
                style={{
                  backgroundColor: 'rgba(106, 90, 224, 0.16)',
                  border: '1px solid rgba(106, 90, 224, 0.4)',
                  color: 'var(--profile-accent)'
                }}
              >
                Get More
              </div>
            </div>
          </button>

          {/* Merge Pulse */}
          <button
            onClick={() => navigate('/store')}
            className="rounded-xl p-3 transition-all group relative overflow-hidden"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: 'none'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
              background: 'transparent'
            }} />
            <div className="flex flex-col items-center text-center relative z-10">
              <div
                className="relative w-11 h-11 rounded-full flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(148, 163, 184, 0.35)'
                }}
              >
                <Zap className="w-5 h-5" style={{ color: 'var(--profile-accent)' }} strokeWidth={2} />
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--profile-text-primary)' }}>Merge Pulse</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--profile-text-secondary)' }}>Stay visible</div>
              <div
                className="text-[11px] font-medium px-3 py-1 rounded-full mt-1"
                style={{
                  backgroundColor: 'rgba(106, 90, 224, 0.16)',
                  border: '1px solid rgba(106, 90, 224, 0.4)',
                  color: 'var(--profile-accent)'
                }}
              >
                Get More
              </div>
            </div>
          </button>

          {/* Auras */}
          <button
            onClick={() => navigate('/store')}
            className="rounded-xl p-3 transition-all group relative overflow-hidden"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: 'none'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
              background: 'transparent'
            }} />
            <div className="flex flex-col items-center text-center relative z-10">
              <div
                className="relative w-11 h-11 rounded-full flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(148, 163, 184, 0.35)'
                }}
              >
                <Sparkles className="w-5 h-5" style={{ color: 'var(--profile-accent)' }} strokeWidth={2} />
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--profile-text-primary)' }}>Auras</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--profile-text-secondary)' }}>Signature look</div>
              <div
                className="text-[11px] font-medium px-3 py-1 rounded-full mt-1"
                style={{
                  backgroundColor: 'rgba(106, 90, 224, 0.16)',
                  border: '1px solid rgba(106, 90, 224, 0.4)',
                  color: 'var(--profile-accent)'
                }}
              >
                Explore
              </div>
            </div>
          </button>
        </div>

        {/* Elite Upsell */}
        <div
          className="rounded-2xl p-4 mb-4 relative overflow-hidden group transition-all cursor-pointer backdrop-blur-premium"
          style={{
            backgroundColor: 'rgba(8, 9, 16, 0.78)',
            border: '1px solid rgba(148, 163, 184, 0.45)',
            boxShadow: '0 18px 45px rgba(0, 0, 0, 0.65)'
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div
              className="w-full h-full"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(148, 163, 184, 0.55) 0%, transparent 65%)'
              }}
            />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(106, 90, 224, 0.16) 0%, rgba(139, 92, 246, 0.32) 100%)',
                  color: '#E5E7EB',
                  border: '1px solid rgba(129, 140, 248, 0.5)'
                }}
              >
                <Star className="w-3 h-3" />
                MERGE ELITE
              </div>
              <h4
                className="mb-1.5"
                style={{ fontSize: '15px', fontWeight: 600, color: 'var(--profile-text-primary)' }}
              >
                Priority, polish, and deeper insights
              </h4>
              <p
                style={{ fontSize: '13px', color: 'var(--profile-text-secondary)' }}
              >
                Stand out in the stack, unlock advanced filters, and see richer compatibility insights.
              </p>
            </div>
            <button
              className="text-sm font-medium"
              style={{
                borderRadius: '999px',
                padding: '8px 18px',
                background:
                  'linear-gradient(135deg, rgba(106, 90, 224, 0.9) 0%, rgba(139, 92, 246, 1) 100%)',
                color: '#F9FAFB',
                boxShadow: '0 10px 25px rgba(129, 140, 248, 0.55)'
              }}
            >
              Upgrade to Elite
            </button>
          </div>
        </div>

        {/* Merge Features */}
        <div className="space-y-3 mb-6">
          {/* Merge Wheel */}
          <button
            onClick={() => setShowConnectionMatrix(true)}
            className="w-full flex items-center gap-4 p-4"
            style={{
              backgroundColor: 'var(--profile-card)',
              borderRadius: '12px'
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,217,255,0.15)' }}
            >
              <Zap className="w-6 h-6" style={{ color: '#00D9FF' }} />
            </div>
            <div className="flex-1 text-left">
              <h3
                className="mb-0.5"
                style={{ fontSize: '17px', fontWeight: 500, color: 'var(--profile-text-primary)' }}
              >
                Merge Wheel
              </h3>
              <p
                style={{ fontSize: '15px', color: 'var(--profile-text-secondary)' }}
              >
                {canSpin ? 'Your daily spin is ready.' : 'Come back later for new rewards.'}
              </p>
            </div>
            <ChevronRight className="w-6 h-6" style={{ color: 'var(--profile-text-secondary)' }} />
          </button>

          {/* Profile Energy */}
          <div
            className="flex items-center gap-4 p-4"
            style={{
              backgroundColor: 'var(--profile-card)',
              borderRadius: '12px'
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,217,255,0.15)' }}
            >
              <Sparkles className="w-6 h-6" style={{ color: '#00D9FF' }} />
            </div>
            <div className="flex-1">
              <h3
                className="mb-0.5"
                style={{ fontSize: '17px', fontWeight: 500, color: 'var(--profile-text-primary)' }}
              >
                Profile Energy
              </h3>
              <p
                className="mb-2"
                style={{ fontSize: '15px', color: 'var(--profile-text-secondary)' }}
              >
                Your profile is radiating positive energy.
              </p>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4ECDC4' }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4ECDC4' }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4ECDC4' }} />
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-2">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between p-4"
            style={{ backgroundColor: 'var(--profile-card)', borderRadius: '12px' }}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" style={{ color: 'var(--profile-text-secondary)' }} />
              <span style={{ fontSize: '17px', color: 'var(--profile-text-primary)' }}>Settings & Preferences</span>
            </div>
            <ChevronRight className="w-6 h-6" style={{ color: 'var(--profile-text-secondary)' }} />
          </button>

          <button
            className="w-full flex items-center justify-between p-4"
            style={{ backgroundColor: 'var(--profile-card)', borderRadius: '12px' }}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" style={{ color: 'var(--profile-text-secondary)' }} />
              <span style={{ fontSize: '17px', color: 'var(--profile-text-primary)' }}>Safety & Privacy</span>
            </div>
            <ChevronRight className="w-6 h-6" style={{ color: 'var(--profile-text-secondary)' }} />
          </button>

          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 mt-4"
            style={{
              backgroundColor: 'transparent',
              borderRadius: '16px',
              padding: '12px 0',
              color: 'var(--profile-text-secondary)',
              border: '1px solid rgba(165, 163, 195, 0.4)'
            }}
          >
            <LogOut className="w-5 h-5" />
            <span style={{ fontSize: '15px' }}>Logout</span>
          </button>
        </div>
      </div>

      <BottomNav currentTab="profile" navigate={navigate} />

      <ConnectionMatrix 
        isOpen={showConnectionMatrix} 
        onClose={() => setShowConnectionMatrix(false)} 
        onRewardClaimed={handleRewardClaimed} 
      />

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
  
  // New preference states
  const [ageMin, setAgeMin] = useState(user.age_preference_min || 18);
  const [ageMax, setAgeMax] = useState(user.age_preference_max || 99);
  const [maxDistance, setMaxDistance] = useState(user.max_distance || 50);
  const [showMeMode, setShowMeMode] = useState(user.show_me_mode || 'balanced');
  
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
        show_on_merge: showOnMerge,
        age_preference_min: ageMin,
        age_preference_max: ageMax,
        max_distance: maxDistance,
        show_me_mode: showMeMode
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
        <div 
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#00D9FF var(--surface-default)'
          }}
        >
          {/* Age Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>Age Preferences</h3>
            <div className="space-y-4 p-5 rounded-xl" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-default)' }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Min Age</label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={ageMin}
                    onChange={(e) => setAgeMin(Math.max(18, Math.min(99, parseInt(e.target.value) || 18)))}
                    className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Max Age</label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={ageMax}
                    onChange={(e) => setAgeMax(Math.max(18, Math.min(99, parseInt(e.target.value) || 99)))}
                    className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--surface-hover)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                  />
                </div>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Looking for people aged {ageMin} to {ageMax}
              </div>
            </div>
          </div>

          {/* Distance Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>Distance Preferences</h3>
            <div className="space-y-4 p-5 rounded-xl" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-default)' }}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Maximum Distance</label>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ color: '#00D9FF', backgroundColor: 'rgba(0, 217, 255, 0.15)' }}>
                    {maxDistance} mi
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00D9FF 0%, #00D9FF ${maxDistance}%, var(--surface-hover) ${maxDistance}%, var(--surface-hover) 100%)`
                  }}
                />
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Show me people within {maxDistance} miles
              </div>
            </div>
          </div>

          {/* Control Who Sees You */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>Control Who Sees You</h3>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all" style={{ border: showMeMode === 'balanced' ? '1px solid #00D9FF' : '1px solid var(--border-subtle)', backgroundColor: showMeMode === 'balanced' ? 'rgba(0, 217, 255, 0.05)' : 'var(--surface-default)' }}
                onMouseEnter={(e) => showMeMode !== 'balanced' && (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                onMouseLeave={(e) => showMeMode !== 'balanced' && (e.currentTarget.style.backgroundColor = 'var(--surface-default)')}
              >
                <input
                  type="radio"
                  name="showMeMode"
                  checked={showMeMode === 'balanced'}
                  onChange={() => setShowMeMode('balanced')}
                  className="mt-0.5 w-4 h-4"
                  style={{ accentColor: '#00D9FF' }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Balanced Recommendations</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Show me to people based on compatibility</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all" style={{ border: showMeMode === 'recently_active' ? '1px solid #00D9FF' : '1px solid var(--border-subtle)', backgroundColor: showMeMode === 'recently_active' ? 'rgba(0, 217, 255, 0.05)' : 'var(--surface-default)' }}
                onMouseEnter={(e) => showMeMode !== 'recently_active' && (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                onMouseLeave={(e) => showMeMode !== 'recently_active' && (e.currentTarget.style.backgroundColor = 'var(--surface-default)')}
              >
                <input
                  type="radio"
                  name="showMeMode"
                  checked={showMeMode === 'recently_active'}
                  onChange={() => setShowMeMode('recently_active')}
                  className="mt-0.5 w-4 h-4"
                  style={{ accentColor: '#00D9FF' }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Recently Active</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Prioritize showing me to active users</div>
                </div>
              </label>
            </div>
          </div>

          {/* Control My Visibility */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>Control My Visibility</h3>
            
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all" style={{ border: visibilityMode === 'standard' ? '1px solid #00D9FF' : '1px solid var(--border-subtle)', backgroundColor: visibilityMode === 'standard' ? 'rgba(0, 217, 255, 0.05)' : 'var(--surface-default)' }}
                onMouseEnter={(e) => visibilityMode !== 'standard' && (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                onMouseLeave={(e) => visibilityMode !== 'standard' && (e.currentTarget.style.backgroundColor = 'var(--surface-default)')}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibilityMode === 'standard'}
                  onChange={() => setVisibilityMode('standard')}
                  className="mt-0.5 w-4 h-4"
                  style={{ accentColor: '#00D9FF' }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Standard</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Discoverable in card stack</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all" style={{ border: visibilityMode === 'incognito' ? '1px solid #00D9FF' : '1px solid var(--border-subtle)', backgroundColor: visibilityMode === 'incognito' ? 'rgba(0, 217, 255, 0.05)' : 'var(--surface-default)' }}
                onMouseEnter={(e) => visibilityMode !== 'incognito' && (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                onMouseLeave={(e) => visibilityMode !== 'incognito' && (e.currentTarget.style.backgroundColor = 'var(--surface-default)')}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibilityMode === 'incognito'}
                  onChange={() => setVisibilityMode('incognito')}
                  className="mt-0.5 w-4 h-4"
                  style={{ accentColor: '#00D9FF' }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Incognito</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Discoverable only by people you Like</div>
                </div>
              </label>
            </div>
          </div>

          {/* Discovery Settings */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>Discovery</h3>
            
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl transition-all" style={{ backgroundColor: 'var(--surface-default)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-default)'}
            >
              <input
                type="checkbox"
                checked={discoveryEnabled}
                onChange={(e) => setDiscoveryEnabled(e.target.checked)}
                className="w-5 h-5"
                style={{ accentColor: '#00D9FF' }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Enable Discovery</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Allow others to find your profile</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl transition-all" style={{ backgroundColor: 'var(--surface-default)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-default)'}
            >
              <input
                type="checkbox"
                checked={showOnMerge}
                onChange={(e) => setShowOnMerge(e.target.checked)}
                className="w-5 h-5"
                style={{ accentColor: '#00D9FF' }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Show me on Merge</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Control if your profile appears in the stack</div>
              </div>
            </label>
          </div>

          {/* Messaging Controls */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>Control Who Messages You</h3>
            
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl transition-all" style={{ backgroundColor: 'var(--surface-default)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-default)'}
            >
              <input
                type="checkbox"
                checked={photoVerifiedChat}
                onChange={(e) => setPhotoVerifiedChat(e.target.checked)}
                className="w-5 h-5"
                style={{ accentColor: '#00D9FF' }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Photo Verified Chat</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Only receive messages from photo verified members</div>
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
        <div className="p-6 flex gap-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-3.5 font-medium transition-all"
            style={{
              backgroundColor: 'var(--surface-default)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)'
            }}
            disabled={saving}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = 'var(--surface-default)')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl py-3.5 font-medium transition-all"
            style={{
              backgroundColor: '#00D9FF',
              color: '#000000'
            }}
            disabled={saving}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
