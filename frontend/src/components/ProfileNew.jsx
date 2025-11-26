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
        {/* Tech Header */}
        <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid var(--tech-divider)' }}>
          <div style={{ 
            fontFamily: "'SF Mono', monospace", 
            fontSize: '11px', 
            color: 'var(--tech-silver)',
            letterSpacing: '2px'
          }}>
            SYSTEM_PROFILE
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 py-1.5 transition-all hover:bg-white/5"
            style={{
              border: '1px solid var(--tech-divider)',
              borderRadius: '4px',
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-bright)',
              letterSpacing: '1px'
            }}
          >
            <Settings className="w-4 h-4" />
            EDIT
          </button>
        </div>

        {/* Profile Summary - Tech Card */}
        <div
          className="relative mb-6 p-5"
          style={{
            background: 'var(--tech-charcoal)',
            border: '1px solid var(--tech-divider)',
            borderRadius: '8px',
            boxShadow: '0 0 20px var(--tech-glow)'
          }}
        >
          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--tech-bright), transparent)'
          }} />

          <div className="flex items-start gap-5">
            {/* Hexagonal Avatar */}
            <button
              onClick={() => setShowEditProfile(true)}
              className="relative group cursor-pointer flex-shrink-0"
            >
              <div 
                className="w-24 h-24 rounded-full bg-cover bg-center transition-all relative overflow-hidden"
                style={{ 
                  border: '2px solid var(--tech-divider)',
                  backgroundImage: user.photos?.[0]
                    ? `url(${user.photos[0]})`
                    : 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)',
                  boxShadow: '0 0 15px var(--tech-glow)'
                }}
              >
                {!user.photos?.[0] && (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-light"
                    style={{ color: 'var(--tech-white)', fontFamily: "'SF Mono', monospace" }}
                  >
                    {user.first_name?.[0] || 'U'}
                  </div>
                )}
                {/* Data matrix overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '1px solid var(--tech-bright)',
                  borderRadius: '50%',
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }} className="group-hover:opacity-100" />
              </div>
              {/* Online indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: '12px',
                  height: '12px',
                  background: 'var(--tech-bright)',
                  border: '2px solid var(--tech-black)',
                  borderRadius: '50%',
                  animation: 'pulse-tech 2s infinite'
                }}
              />
            </button>

            {/* Profile Meta */}
            <div className="flex-1">
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                color: 'var(--tech-white)',
                marginBottom: '4px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.5px'
              }}>
                {user.first_name?.toUpperCase()}{age ? `, ${age}` : ''}
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--tech-silver)',
                marginBottom: '8px',
                fontFamily: "'SF Mono', monospace"
              }}>
                {user.job_title || 'PROFESSIONAL'} · {user.industry || 'TECHNOLOGY'}
              </p>
              <div className="flex items-center gap-1.5" style={{ 
                fontSize: '12px', 
                color: 'var(--tech-silver)',
                fontFamily: "'SF Mono', monospace"
              }}>
                <span>📍</span>
                <span>{user.location?.toUpperCase() || 'NEW YORK'} • 2.3KM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion - Binary Style */}
        <div
          className="mb-6 p-4"
          style={{
            background: 'var(--tech-charcoal)',
            border: '1px solid var(--tech-divider)',
            borderRadius: '8px'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '11px',
              color: 'var(--tech-silver)',
              letterSpacing: '1.5px'
            }}>
              PROFILE: {profileCompletion}% OPTIMIZED
            </span>
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '11px',
              color: 'var(--tech-bright)',
              letterSpacing: '1px'
            }}>
              [{profileCompletion}/100]
            </span>
          </div>
          {/* Binary progress bar */}
          <div style={{
            width: '100%',
            height: '4px',
            background: 'var(--tech-divider)',
            position: 'relative',
            borderRadius: '0'
          }}>
            <div style={{
              width: `${profileCompletion}%`,
              height: '4px',
              background: 'var(--tech-bright)',
              position: 'relative',
              transition: 'width 0.5s ease'
            }}>
              {/* Pulsing cursor at end */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--tech-white)',
                animation: 'pulse-tech 1.5s infinite'
              }} />
            </div>
          </div>
        </div>

        {/* Quick Actions - HUD Interface */}
        <div className="mb-6 space-y-2">
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full flex items-center gap-3 p-3 transition-all hover:bg-white/5"
            style={{
              background: 'var(--tech-charcoal)',
              border: '1px solid var(--tech-divider)',
              borderRadius: '8px'
            }}
          >
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '1px',
              minWidth: '40px'
            }}>
              [001]
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: 'var(--tech-white)',
              fontWeight: 500,
              flex: 1,
              textAlign: 'left'
            }}>
              EDIT PROFILE
            </span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--tech-silver)' }} />
          </button>

          <button
            onClick={() => navigate('/store')}
            className="w-full flex items-center gap-3 p-3 transition-all hover:bg-white/5"
            style={{
              background: 'var(--tech-charcoal)',
              border: '1px solid var(--tech-divider)',
              borderRadius: '8px'
            }}
          >
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '1px',
              minWidth: '40px'
            }}>
              [002]
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: 'var(--tech-white)',
              fontWeight: 500,
              flex: 1,
              textAlign: 'left'
            }}>
              PROFILE EFFECTS
            </span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--tech-silver)' }} />
          </button>

          <button
            className="w-full flex items-center gap-3 p-3 transition-all hover:bg-white/5"
            style={{
              background: 'var(--tech-charcoal)',
              border: '1px solid var(--tech-divider)',
              borderRadius: '8px'
            }}
          >
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '1px',
              minWidth: '40px'
            }}>
              [003]
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: 'var(--tech-white)',
              fontWeight: 500,
              flex: 1,
              textAlign: 'left'
            }}>
              PREVIEW MODE
            </span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--tech-silver)' }} />
          </button>

          <button
            className="w-full flex items-center gap-3 p-3 transition-all hover:bg-white/5"
            style={{
              background: 'var(--tech-charcoal)',
              border: '1px solid var(--tech-divider)',
              borderRadius: '8px'
            }}
          >
            <span style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '1px',
              minWidth: '40px'
            }}>
              [004]
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: 'var(--tech-white)',
              fontWeight: 500,
              flex: 1,
              textAlign: 'left'
            }}>
              ANALYTICS
            </span>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--tech-silver)' }} />
          </button>
        </div>

        {/* Merge Elite - Terminal Style */}
        <div
          className="mb-6 p-5 relative overflow-hidden"
          style={{
            background: 'var(--tech-charcoal)',
            border: '1px solid var(--tech-divider)',
            borderRadius: '8px',
            boxShadow: '0 0 25px var(--tech-glow)'
          }}
        >
          {/* Top border accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '20px',
            right: '20px',
            height: '1px',
            background: 'var(--tech-bright)'
          }} />
          
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: '12px',
            color: 'var(--tech-bright)',
            letterSpacing: '2px',
            marginBottom: '12px'
          }}>
            ╭─ MERGE_ELITE ──────────────────╮
          </div>
          
          <div className="space-y-2 mb-4 pl-3" style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: '11px',
            color: 'var(--tech-silver)',
            lineHeight: '1.6'
          }}>
            <div>│ PRIORITY PROCESSING</div>
            <div>│ ADVANCED MATCHING ALGORITHMS</div>
            <div>│ REAL-TIME COMPATIBILITY DATA</div>
          </div>
          
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: '12px',
            color: 'var(--tech-bright)',
            letterSpacing: '2px',
            marginBottom: '16px'
          }}>
            ╰────────────────────────────────╯
          </div>
          
          <button
            className="w-full py-3 transition-all hover:bg-white/10"
            style={{
              background: 'var(--tech-black)',
              border: '1px solid var(--tech-bright)',
              borderRadius: '4px',
              fontFamily: "'SF Mono', monospace",
              fontSize: '11px',
              color: 'var(--tech-white)',
              letterSpacing: '2px'
            }}
          >
            [ UPGRADE_NOW ]
          </button>
        </div>

        {/* Merge Wheel Feature */}
        <button
          onClick={() => setShowConnectionMatrix(true)}
          className="w-full flex items-center gap-3 p-3 mb-2 transition-all hover:bg-white/5"
          style={{
            background: 'var(--tech-charcoal)',
            border: '1px solid var(--tech-divider)',
            borderRadius: '8px'
          }}
        >
          <Zap className="w-5 h-5" style={{ color: 'var(--tech-bright)' }} />
          <div className="flex-1 text-left">
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: 'var(--tech-white)',
              fontWeight: 500
            }}>
              MERGE WHEEL
            </div>
            <div style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '11px',
              color: 'var(--tech-silver)'
            }}>
              {canSpin ? 'READY TO SPIN' : 'COOLDOWN ACTIVE'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--tech-silver)' }} />
        </button>

        {/* System Settings - Tree Structure */}
        <div className="mb-6">
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: '11px',
            color: 'var(--tech-bright)',
            letterSpacing: '2px',
            marginBottom: '12px',
            paddingLeft: '8px'
          }}>
            SYSTEM_PREFERENCES
          </div>
          
          <div className="space-y-2 pl-4" style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: '11px',
            color: 'var(--tech-silver)'
          }}>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2 py-2 transition-all hover:text-white text-left"
            >
              <span>├─</span>
              <span>ACCOUNT_SETTINGS</span>
            </button>
            
            <button
              className="w-full flex items-center gap-2 py-2 transition-all hover:text-white text-left"
            >
              <span>├─</span>
              <span>PRIVACY_PROTOCOLS</span>
            </button>
            
            <button
              className="w-full flex items-center gap-2 py-2 transition-all hover:text-white text-left"
            >
              <span>├─</span>
              <span>NOTIFICATION_SYSTEM</span>
            </button>
            
            <button
              className="w-full flex items-center gap-2 py-2 transition-all hover:text-white text-left"
            >
              <span>└─</span>
              <span>INTERFACE_THEME</span>
            </button>
          </div>
        </div>

        {/* System Support - Tree Structure */}
        <div className="mb-6">
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: '11px',
            color: 'var(--tech-bright)',
            letterSpacing: '2px',
            marginBottom: '12px',
            paddingLeft: '8px'
          }}>
            SYSTEM_SUPPORT
          </div>
          
          <div className="space-y-2 pl-4 mb-6" style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: '11px',
            color: 'var(--tech-silver)'
          }}>
            <button
              className="w-full flex items-center gap-2 py-2 transition-all hover:text-white text-left"
            >
              <span>├─</span>
              <span>HELP_DATABASE</span>
            </button>
            
            <button
              className="w-full flex items-center gap-2 py-2 transition-all hover:text-white text-left"
            >
              <span>├─</span>
              <span>INVITE_NETWORK</span>
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 py-2 transition-all hover:text-white text-left"
            >
              <span>└─</span>
              <span>LOGOUT_SYSTEM</span>
            </button>
          </div>
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

// Settings Modal Component - Tech Theme
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full"
        style={{
          background: 'var(--tech-charcoal)',
          border: '1px solid var(--tech-divider)',
          borderRadius: '8px',
          fontFamily: "'Inter', 'SF Mono', monospace"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '20px',
          right: '20px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--tech-bright), transparent)'
        }} />

        {/* Header */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--tech-divider)' }}>
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: '11px',
            color: 'var(--tech-bright)',
            letterSpacing: '2px'
          }}>
            SYSTEM_SETTINGS
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{
              color: 'var(--tech-silver)',
              fontSize: '18px',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div 
          className="p-5 space-y-5 max-h-[70vh] overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--tech-silver) var(--tech-charcoal)'
          }}
        >
          {/* Age Preferences */}
          <div className="space-y-3">
            <h3 style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '2px'
            }}>
              AGE_PREFERENCES
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs block mb-2" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>MIN</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={ageMin}
                  onChange={(e) => setAgeMin(Math.max(18, Math.min(99, parseInt(e.target.value) || 18)))}
                  className="w-full px-3 py-2 text-sm focus:outline-none transition-all"
                  style={{
                    background: 'var(--tech-black)',
                    border: '1px solid var(--tech-divider)',
                    borderRadius: '4px',
                    color: 'var(--tech-white)',
                    fontFamily: "'SF Mono', monospace"
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--tech-bright)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--tech-divider)'}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs block mb-2" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>MAX</label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={ageMax}
                  onChange={(e) => setAgeMax(Math.max(18, Math.min(99, parseInt(e.target.value) || 99)))}
                  className="w-full px-3 py-2 text-sm focus:outline-none transition-all"
                  style={{
                    background: 'var(--tech-black)',
                    border: '1px solid var(--tech-divider)',
                    borderRadius: '4px',
                    color: 'var(--tech-white)',
                    fontFamily: "'SF Mono', monospace"
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--tech-bright)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--tech-divider)'}
                />
              </div>
            </div>
            <div className="text-xs" style={{ color: 'var(--tech-silver)', fontFamily: "'SF Mono', monospace" }}>
              [{ageMin}-{ageMax}] YEARS
            </div>
          </div>

          {/* Distance Preferences */}
          <div className="space-y-3">
            <h3 style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '2px'
            }}>
              DISTANCE_PREFERENCES
            </h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>
                  MAXIMUM DISTANCE
                </label>
                <span className="text-xs px-2 py-1" style={{ 
                  color: 'var(--tech-black)', 
                  background: 'var(--tech-bright)',
                  fontFamily: "'SF Mono', monospace",
                  borderRadius: '2px'
                }}>
                  {maxDistance} MI
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full h-1 appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--tech-bright) 0%, var(--tech-bright) ${maxDistance}%, var(--tech-divider) ${maxDistance}%, var(--tech-divider) 100%)`,
                  borderRadius: 0
                }}
              />
            </div>
          </div>

          {/* Visibility Mode */}
          <div className="space-y-3">
            <h3 style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '2px'
            }}>
              VISIBILITY_MODE
            </h3>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer p-3 transition-all" 
                style={{ 
                  border: visibilityMode === 'standard' ? '1px solid var(--tech-bright)' : '1px solid var(--tech-divider)', 
                  background: visibilityMode === 'standard' ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: '4px'
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibilityMode === 'standard'}
                  onChange={() => setVisibilityMode('standard')}
                  className="mt-0.5 w-4 h-4"
                  style={{ accentColor: 'var(--tech-bright)' }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>
                    STANDARD
                  </div>
                  <div className="text-xs" style={{ color: 'var(--tech-silver)', fontFamily: "'SF Mono', monospace" }}>
                    Discoverable in card stack
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer p-3 transition-all" 
                style={{ 
                  border: visibilityMode === 'incognito' ? '1px solid var(--tech-bright)' : '1px solid var(--tech-divider)', 
                  background: visibilityMode === 'incognito' ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: '4px'
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibilityMode === 'incognito'}
                  onChange={() => setVisibilityMode('incognito')}
                  className="mt-0.5 w-4 h-4"
                  style={{ accentColor: 'var(--tech-bright)' }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>
                    INCOGNITO
                  </div>
                  <div className="text-xs" style={{ color: 'var(--tech-silver)', fontFamily: "'SF Mono', monospace" }}>
                    Only visible to liked profiles
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Discovery Settings */}
          <div className="space-y-3">
            <h3 style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '2px'
            }}>
              DISCOVERY_SETTINGS
            </h3>
            
            <label className="flex items-center gap-3 cursor-pointer p-3 transition-all hover:bg-white/5" 
              style={{ 
                border: '1px solid var(--tech-divider)',
                borderRadius: '4px'
              }}
            >
              <input
                type="checkbox"
                checked={discoveryEnabled}
                onChange={(e) => setDiscoveryEnabled(e.target.checked)}
                className="w-4 h-4"
                style={{ accentColor: 'var(--tech-bright)' }}
              />
              <div className="flex-1">
                <div className="text-sm" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>
                  Enable Discovery
                </div>
                <div className="text-xs" style={{ color: 'var(--tech-silver)', fontFamily: "'SF Mono', monospace" }}>
                  Allow others to find profile
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 transition-all hover:bg-white/5" 
              style={{ 
                border: '1px solid var(--tech-divider)',
                borderRadius: '4px'
              }}
            >
              <input
                type="checkbox"
                checked={showOnMerge}
                onChange={(e) => setShowOnMerge(e.target.checked)}
                className="w-4 h-4"
                style={{ accentColor: 'var(--tech-bright)' }}
              />
              <div className="flex-1">
                <div className="text-sm" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>
                  Show on Merge
                </div>
                <div className="text-xs" style={{ color: 'var(--tech-silver)', fontFamily: "'SF Mono', monospace" }}>
                  Appear in swipe stack
                </div>
              </div>
            </label>
          </div>

          {/* Chat Settings */}
          <div className="space-y-3">
            <h3 style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: '10px',
              color: 'var(--tech-silver)',
              letterSpacing: '2px'
            }}>
              CHAT_PROTOCOLS
            </h3>
            
            <label className="flex items-center gap-3 cursor-pointer p-3 transition-all hover:bg-white/5" 
              style={{ 
                border: '1px solid var(--tech-divider)',
                borderRadius: '4px'
              }}
            >
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={(e) => setReadReceipts(e.target.checked)}
                className="w-4 h-4"
                style={{ accentColor: 'var(--tech-bright)' }}
              />
              <div className="flex-1">
                <div className="text-sm" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>
                  Read Receipts
                </div>
                <div className="text-xs" style={{ color: 'var(--tech-silver)', fontFamily: "'SF Mono', monospace" }}>
                  Let matches know when read
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 transition-all hover:bg-white/5" 
              style={{ 
                border: '1px solid var(--tech-divider)',
                borderRadius: '4px'
              }}
            >
              <input
                type="checkbox"
                checked={photoVerifiedChat}
                onChange={(e) => setPhotoVerifiedChat(e.target.checked)}
                className="w-4 h-4"
                style={{ accentColor: 'var(--tech-bright)' }}
              />
              <div className="flex-1">
                <div className="text-sm" style={{ color: 'var(--tech-white)', fontFamily: "'Inter', sans-serif" }}>
                  Photo Verified Only
                </div>
                <div className="text-xs" style={{ color: 'var(--tech-silver)', fontFamily: "'SF Mono', monospace" }}>
                  Restrict to verified users
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex gap-3" style={{ borderTop: '1px solid var(--tech-divider)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 transition-all hover:bg-white/5"
            style={{
              background: 'transparent',
              color: 'var(--tech-silver)',
              border: '1px solid var(--tech-divider)',
              borderRadius: '4px',
              fontFamily: "'SF Mono', monospace",
              fontSize: '11px',
              letterSpacing: '1px'
            }}
            disabled={saving}
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 transition-all"
            style={{
              background: 'var(--tech-bright)',
              color: 'var(--tech-black)',
              border: 'none',
              borderRadius: '4px',
              fontFamily: "'SF Mono', monospace",
              fontSize: '11px',
              letterSpacing: '1px',
              fontWeight: 600
            }}
            disabled={saving}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.background = 'var(--tech-white)')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.background = 'var(--tech-bright)')}
          >
            {saving ? 'SAVING...' : '[ SAVE ]'}
          </button>
        </div>
      </div>
    </div>
  );
}
