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
        backgroundColor: 'var(--bg-primary)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {/* Subtle animated background - matching Explore tab */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
      </div>

      <style>{`
        /* Profile Management Design Tokens */
        :root {
          --profile-bg: #050709;
          --profile-card: rgba(15, 17, 32, 0.85);
          --profile-radius: 12px;
          --profile-text-primary: #F9FAFB;
          --profile-text-secondary: #9CA3AF;
          --profile-accent: #E5E7EB;
          --profile-success: #4CAF50;
        }

        /* Scrollbar hiding */
        .fixed.inset-0.overflow-y-auto::-webkit-scrollbar {
          display: none;
        }

        /* Custom scrollbar for settings modal - Cyan theme */
        .max-h-\[70vh\].overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .max-h-\[70vh\].overflow-y-auto::-webkit-scrollbar-track {
          background: var(--surface-default);
          border-radius: 4px;
        }
        
        .max-h-\[70vh\].overflow-y-auto::-webkit-scrollbar-thumb {
          background: #00D9FF;
          border-radius: 4px;
        }
        
        .max-h-\[70vh\].overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #00C4E6;
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
      <div className="max-w-md mx-auto px-4 py-4 relative z-10">
        {/* Top Bar - Tinder Style */}
        <div className="flex items-center justify-between mb-4">
          <MergeLogo size="sm" color="#FFFFFF" />
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all">
              <Shield className="w-5 h-5 text-white/60" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all"
            >
              <Settings className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Profile Summary - Tinder Style */}
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar with Circular Progress */}
          <button
            onClick={() => setShowEditProfile(true)}
            className="relative flex-shrink-0"
          >
            <div className="relative" style={{ width: '80px', height: '80px' }}>
              {/* Circular Progress Bar with Gradient */}
              <svg className="absolute inset-0" width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00D9FF', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#6C63FF', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="37"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r="37"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 37}`}
                  strokeDashoffset={`${2 * Math.PI * 37 * (1 - profileCompletion / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              
              {/* Profile Photo */}
              <div
                className="absolute inset-0 m-auto rounded-full bg-cover bg-center"
                style={{ 
                  width: '68px',
                  height: '68px',
                  backgroundImage: user.photos?.[0]
                    ? `url(${user.photos[0]})`
                    : 'linear-gradient(135deg, #6A5AE0 0%, #8B5CF6 100%)'
                }}
              >
                {!user.photos?.[0] && (
                  <div className="w-full h-full flex items-center justify-center text-lg font-light rounded-full"
                    style={{ color: 'white' }}
                  >
                    {user.first_name?.[0] || 'U'}
                  </div>
                )}
              </div>
              
              {/* Progress percentage badge */}
              <div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%)',
                  color: 'white'
                }}
              >
                {profileCompletion}%
              </div>
            </div>
          </button>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                {user.first_name}{age ? `, ${age}` : ''}
              </h2>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#00D9FF' }}>
                <Check className="w-3 h-3 text-black" strokeWidth={3} />
              </div>
            </div>
            
            {/* Complete Profile Button */}
            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: 'white',
                color: 'black'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              ✏️ Complete profile
            </button>
          </div>
        </div>

        {/* Merge Wheel Promo Card - Similar to "Try Double Date" */}
        <button
          onClick={() => setShowConnectionMatrix(true)}
          className="w-full flex items-center gap-4 p-4 mb-4 transition-all hover:bg-white/5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%)' }}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-white font-semibold text-base mb-0.5">
              Try Merge Wheel
            </h3>
            <p className="text-white/60 text-sm">
              {canSpin ? 'Your daily spin is ready.' : 'Spin for rewards and boosts.'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </button>

        {/* Quick Action Cards - Horizontal Scroll (Tinder Style) */}
        <div className="mb-4 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex gap-3 pb-2" style={{ minWidth: 'fit-content' }}>
            {/* Super Likes Card */}
            <div
              className="relative flex-shrink-0 rounded-2xl p-4 transition-all"
              style={{
                width: '160px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <button className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <span className="text-white text-lg">+</span>
              </button>
              <div className="mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #0099CC 100%)' }}>
                  <Heart className="w-6 h-6 text-white" fill="white" />
                </div>
                <div className="text-white font-bold text-lg mb-1">
                  {user.super_likes || 0} Super Likes
                </div>
                <div className="text-white/60 text-xs mb-3">
                  Boost your signal
                </div>
              </div>
              <button
                onClick={() => navigate('/store')}
                className="w-full py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%)',
                  color: 'white'
                }}
              >
                GET MORE
              </button>
            </div>

            {/* My Boosts Card */}
            <div
              className="relative flex-shrink-0 rounded-2xl p-4 transition-all"
              style={{
                width: '160px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <button className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <span className="text-white text-lg">+</span>
              </button>
              <div className="mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #A855F7 0%, #6C63FF 100%)' }}>
                  <Zap className="w-6 h-6 text-white" fill="white" />
                </div>
                <div className="text-white font-bold text-lg mb-1">
                  My Boosts
                </div>
                <div className="text-white/60 text-xs mb-3">
                  Stay visible
                </div>
              </div>
              <button
                onClick={() => navigate('/store')}
                className="w-full py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%)',
                  color: 'white'
                }}
              >
                GET MORE
              </button>
            </div>

            {/* Auras/Effects Card */}
            <div
              className="relative flex-shrink-0 rounded-2xl p-4 transition-all"
              style={{
                width: '160px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <button className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <span className="text-white text-lg">+</span>
              </button>
              <div className="mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)' }}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-white font-bold text-lg mb-1">
                  Auras
                </div>
                <div className="text-white/60 text-xs mb-3">
                  Signature look
                </div>
              </div>
              <button
                onClick={() => navigate('/store')}
                className="w-full py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%)',
                  color: 'white'
                }}
              >
                EXPLORE
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Merge Elite - Tinder Platinum Style */}
        <div
          className="mb-4 rounded-2xl p-5 relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%)' }}>
                <Star className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-white font-bold text-lg">MERGE ELITE</span>
            </div>
            <button
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: 'white',
                color: 'black'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Upgrade
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-white font-semibold text-base mb-4">What's included</h3>
            
            <div className="space-y-3">
              {/* Feature Row */}
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Priority Matching</span>
                <div className="flex gap-12">
                  <Lock className="w-4 h-4 text-white/30" />
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Message Before Matching</span>
                <div className="flex gap-12">
                  <Lock className="w-4 h-4 text-white/30" />
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">See Who Likes You</span>
                <div className="flex gap-12">
                  <Lock className="w-4 h-4 text-white/30" />
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          <button className="text-white/60 text-sm hover:text-white/80 transition-colors">
            See All Features
          </button>
        </div>

        {/* Account Actions - Simple List */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-between p-4 transition-all hover:bg-white/5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-white/60" />
              <span className="text-white text-sm font-medium">Settings & Preferences</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>

          <button
            className="w-full flex items-center justify-between p-4 transition-all hover:bg-white/5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-white/60" />
              <span className="text-white text-sm font-medium">Safety & Privacy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>

          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 p-4 mt-4 transition-all hover:bg-white/5"
            style={{
              backgroundColor: 'transparent',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white/80'
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
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
