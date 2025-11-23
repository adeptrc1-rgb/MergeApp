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
        background: '#0F0B1F',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none' /* IE and Edge */
      }}
    >
      {/* Subtle animated background - matching onboarding */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}></div>
      </div>

      <style>{`
        /* Profile Management Design Tokens */
        :root {
          --profile-bg: #0F0B1F;
          --profile-card: #1A1734;
          --profile-radius: 12px;
          --profile-text-primary: #F5F5F5;
          --profile-text-secondary: #A5A3C3;
          --profile-accent: #6A5AE0;
          --profile-success: #4CAF50;
        }

        /* Scrollbar hiding */
        .fixed.inset-0.overflow-y-auto::-webkit-scrollbar {
          display: none;
        }

        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 1;
            box-shadow: 0 0 5px var(--tech-glow);
          }
          50% { 
            opacity: 0.6;
            box-shadow: 0 0 10px var(--tech-glow);
          }
        }

        /* Micro-interactions & Animations */
        .feature-card-enhanced {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }

        .feature-card-enhanced:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(108, 99, 255, 0.15);
        }

        .feature-card-enhanced:active {
          transform: translateY(0);
        }

        /* Progress ring animation */
        @keyframes progress-ring {
          from { stroke-dashoffset: 339.292; }
          to { stroke-dashoffset: 0; }
        }

        /* Pulse animation for ready state */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Card hover glow effect */
        .card-glow {
          position: relative;
          overflow: hidden;
        }

        .card-glow::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(108, 99, 255, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .card-glow:hover::after {
          opacity: 1;
        }

        /* Premium gradient border effect */
        .premium-border {
          position: relative;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 16px;
        }

        .premium-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          padding: 1px;
          background: linear-gradient(135deg, #6C63FF, #4ECDC4);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        /* Smooth icon transitions */
        .icon-transition {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .icon-transition:hover {
          transform: scale(1.1);
        }

        /* Completion step animations */
        .completion-step {
          opacity: 0;
          transform: translateX(-10px);
          animation: slideIn 0.3s ease forwards;
        }

        .completion-step:nth-child(1) { animation-delay: 0.1s; }
        .completion-step:nth-child(2) { animation-delay: 0.2s; }
        .completion-step:nth-child(3) { animation-delay: 0.3s; }
        .completion-step:nth-child(4) { animation-delay: 0.4s; }

        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Accessibility: Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Quantum Buttons */
        .quantum-btn {
          position: relative;
          background: var(--bg-elevated);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .quantum-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .quantum-btn:hover::before {
          left: 100%;
        }

        .btn-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          background: radial-gradient(circle, var(--tech-glow) 0%, transparent 70%);
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .quantum-btn:hover .btn-glow {
          width: 200%;
          height: 200%;
        }

        /* Neural Navigation */
        .neural-nav {
          display: flex;
          background: var(--bg-surface);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 8px;
          margin: 20px;
        }

        .nav-item {
          flex: 1;
          text-align: center;
          padding: 12px;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-item.active {
          background: rgba(108, 99, 255, 0.1);
          border: 1px solid rgba(108, 99, 255, 0.3);
        }

        .nav-indicator {
          width: 4px;
          height: 4px;
          background: var(--tech-glow);
          border-radius: 50%;
          margin: 4px auto 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .nav-item.active .nav-indicator {
          opacity: 1;
          animation: pulseGlow 2s infinite;
        }

        /* Accessibility: High contrast mode */
        @media (prefers-contrast: high) {
          .feature-card-enhanced {
            border: 2px solid #FFFFFF !important;
          }
        }

        /* Enhanced backdrop blur */
        .backdrop-blur-premium {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* Shimmer loading effect */
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .skeleton-loader {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Single Scrollable Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="pb-6 mb-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--profile-text-primary)' }}>
              Profile Management
            </h1>
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 flex items-center justify-center rounded-[16px] transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <Settings className="w-6 h-6" style={{ color: 'var(--profile-text-secondary)' }} />
            </button>
          </div>

          {/* Profile Summary */}
          <div
            className="flex items-start gap-4 p-4"
            style={{
              backgroundColor: 'var(--profile-card)',
              borderRadius: '12px'
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
              </div>
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
        </div>

        {/* Quick Action Blocks */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Super Liked Block */}
          <button
            onClick={() => navigate('/store')}
            className="rounded-[12px] p-3 transition-all group relative overflow-hidden"
            style={{
              backgroundColor: 'var(--profile-card)',
              borderRadius: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(78, 205, 196, 0.08) 0%, rgba(10, 10, 10, 0.9) 100%)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 205, 196, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(78, 205, 196, 0.05) 0%, rgba(10, 10, 10, 0.8) 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
              background: 'radial-gradient(circle at top right, rgba(78, 205, 196, 0.1), transparent 60%)'
            }}></div>
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative w-11 h-11 rounded-full flex items-center justify-center mb-2" style={{
                backgroundColor: 'rgba(255,255,255,0.04)'
              }}>
                <Heart className="w-5 h-5" style={{ color: 'var(--profile-accent)' }} strokeWidth={2.0} />
              </div>
              <div className="text-[17px] font-semibold mb-0.5" style={{ color: 'var(--profile-text-primary)' }}>0</div>
              <div className="text-[13px] mb-1.5" style={{ color: 'var(--profile-text-secondary)' }}>Super Likes</div>
              <div
                className="text-[13px] font-medium px-3 py-1 rounded-[16px] mt-1"
                style={{
                  backgroundColor: 'rgba(106, 90, 224, 0.16)',
                  color: 'var(--profile-accent)'
                }}
              >
                Get More
              </div>
            </div>
          </button>

          {/* Merge Pulse Block */}
          <button
            onClick={() => navigate('/store')}
            className="rounded-[12px] p-3 transition-all group relative overflow-hidden"
            style={{
              backgroundColor: 'var(--profile-card)',
              borderRadius: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(10, 10, 10, 0.9) 100%)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(108, 99, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108, 99, 255, 0.05) 0%, rgba(10, 10, 10, 0.8) 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
              background: 'radial-gradient(circle at top right, rgba(108, 99, 255, 0.1), transparent 60%)'
            }}></div>
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative w-11 h-11 rounded-full flex items-center justify-center mb-2" style={{
                backgroundColor: 'rgba(255,255,255,0.04)'
              }}>
                <Zap className="w-5 h-5" style={{ color: 'var(--profile-accent)' }} strokeWidth={2.0} />
              </div>
              <div className="text-[17px] font-semibold mb-0.5" style={{ color: 'var(--profile-text-primary)' }}>Merge</div>
              <div className="text-[13px] mb-1.5" style={{ color: 'var(--profile-text-secondary)' }}>Pulse</div>
              <div
                className="text-[13px] font-medium px-3 py-1 rounded-[16px] mt-1"
                style={{
                  backgroundColor: 'rgba(106, 90, 224, 0.16)',
                  color: 'var(--profile-accent)'
                }}
              >
                Get More
              </div>
            </div>
          </button>

          {/* Auras Block */}
          <button
            onClick={() => navigate('/store')}
            className="rounded-[12px] p-3 transition-all group relative overflow-hidden"
            style={{
              backgroundColor: 'var(--profile-card)',
              borderRadius: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(10, 10, 10, 0.9) 100%)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(10, 10, 10, 0.8) 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
              background: 'radial-gradient(circle at top right, rgba(102, 126, 234, 0.1), transparent 60%)'
            }}></div>
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative w-11 h-11 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform" style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                boxShadow: '0 0 20px rgba(102, 126, 234, 0.1)'
              }}>
                <Sparkles className="w-5 h-5" style={{ color: '#667EEA' }} strokeWidth={2.5} />
              </div>
              <div className="text-xs font-semibold text-white mb-2">Auras</div>
              <div className="text-[9px] font-semibold px-2.5 py-0.5 rounded-full text-white/80 group-hover:text-white transition-all" style={{
                background: 'rgba(102, 126, 234, 0.15)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                EXPLORE
              </div>
            </div>
          </button>
        </div>

        {/* Premium Upsell - Gold Theme */}
        <div className="rounded-2xl p-4 mb-4 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer" style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 4px 16px rgba(255, 215, 0, 0.1)'
        }}>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="w-full h-full" style={{
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)'
            }} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
            }}>
              <Star className="w-3 h-3" />
              MERGE PREMIUM
            </div>
            <h4 className="text-white font-bold text-base mb-1.5">Enhanced Experience</h4>
            <p className="text-white/70 text-xs mb-3">
              Unlimited likes, advanced filters, and profile analytics
            </p>
            <button className="w-full py-2.5 rounded-lg text-white text-xs font-bold transition-all hover:scale-105" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
              color: '#000'
            }}>
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Merge Features - Sophisticated Treatment */}
        <div className="space-y-2 mb-6">
          {/* Merge Wheel */}
          <button
            onClick={() => setShowConnectionMatrix(true)}
            className="w-full bg-[#0A0A0A] rounded-xl p-4 border border-white/10 flex items-center gap-4 hover:bg-[#1A1A1A] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center" style={{ color: '#6C63FF' }}>
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-white font-medium text-sm mb-0.5">Merge Wheel</h4>
              <p className="text-white/50 text-xs">
                {canSpin ? 'Your daily spin is ready' : 'Come back later for rewards'}
              </p>
              {canSpin && (
                <div className="mt-1">
                  <span className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded-full">Ready to spin</span>
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </button>

          {/* Profile Energy */}
          <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center" style={{ color: '#4ECDC4' }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm mb-0.5">Profile Energy</h4>
              <p className="text-white/50 text-xs mb-2">Your profile is radiating positive energy</p>
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
            className="w-full bg-[#0A0A0A] rounded-xl p-4 border border-white/10 flex items-center justify-between hover:bg-[#1A1A1A] transition-all"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-white/60" />
              <span className="text-white font-medium text-sm">Settings & Preferences</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </button>

          <button className="w-full bg-[#0A0A0A] rounded-xl p-4 border border-white/10 flex items-center justify-between hover:bg-[#1A1A1A] transition-all">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-white/60" />
              <span className="text-white font-medium text-sm">Safety & Privacy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </button>

          <button 
            onClick={logout} 
            className="w-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 transition-all mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
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
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Age Preferences */}
          <div className="space-y-3">
            <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Age Preferences</h3>
            <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-white text-sm font-medium">Min Age</label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={ageMin}
                    onChange={(e) => setAgeMin(Math.max(18, Math.min(99, parseInt(e.target.value) || 18)))}
                    className="w-full mt-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-white text-sm font-medium">Max Age</label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={ageMax}
                    onChange={(e) => setAgeMax(Math.max(18, Math.min(99, parseInt(e.target.value) || 99)))}
                    className="w-full mt-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="text-white/50 text-xs">
                Looking for people aged {ageMin} to {ageMax}
              </div>
            </div>
          </div>

          {/* Distance Preferences */}
          <div className="space-y-3">
            <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Distance Preferences</h3>
            <div className="space-y-3 p-4 rounded-lg border border-white/10 bg-white/5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white text-sm font-medium">Maximum Distance</label>
                  <span className="text-purple-400 text-sm font-medium">{maxDistance} mi</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${maxDistance}%, rgba(255,255,255,0.1) ${maxDistance}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
              <div className="text-white/50 text-xs">
                Show me people within {maxDistance} miles
              </div>
            </div>
          </div>

          {/* Control Who Sees You */}
          <div className="space-y-3">
            <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Control Who Sees You</h3>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all border border-white/10">
                <input
                  type="radio"
                  name="showMeMode"
                  checked={showMeMode === 'balanced'}
                  onChange={() => setShowMeMode('balanced')}
                  className="mt-0.5 w-4 h-4 accent-purple-500"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Balanced Recommendations</div>
                  <div className="text-white/50 text-xs">Show me to people based on compatibility</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all border border-white/10">
                <input
                  type="radio"
                  name="showMeMode"
                  checked={showMeMode === 'recently_active'}
                  onChange={() => setShowMeMode('recently_active')}
                  className="mt-0.5 w-4 h-4 accent-purple-500"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Recently Active</div>
                  <div className="text-white/50 text-xs">Prioritize showing me to active users</div>
                </div>
              </label>
            </div>
          </div>

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
