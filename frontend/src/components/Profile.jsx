import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Settings, LogOut, Sparkles, Users, Home, Zap, Heart, MessageCircle, Award, Gift, Clock, RotateCcw, Coins, Eye, Flame, Trophy, ChevronRight, Camera, Music, Check } from 'lucide-react';
import ConnectionMatrix from './ConnectionMatrix';
import BottomNav from './BottomNav';
import ConstellationIcon from './ConstellationIcon';
import PremiumSkinRenderer from './PremiumSkinRenderer';
import TarotStreakCard from './TarotStreakCard';
import MergeLogo from './MergeLogo';
import PhotoEditorModal from './PhotoEditorModal';
import SpotifyConnect from './SpotifyConnect';
import MusicConnect from './MusicConnect';
import { getZodiacTheme, getGradientString } from '../utils/zodiacSeasonThemes';
import '../styles/tarotCard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Map zodiac sign to unicode symbol
const zodiacSymbol = (sign) => {
  if (!sign) return '✧';
  const s = sign.toLowerCase();
  const map = {
    aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
    libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
  };
  return map[s] || '✧';
};

axios.defaults.withCredentials = true;

export default function Profile({ user, logout }) {
  const navigate = useNavigate();
  const [showConnectionMatrix, setShowConnectionMatrix] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [wheelStatus, setWheelStatus] = useState(null);
  const [cooldownCountdown, setCooldownCountdown] = useState('');
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [inventory, setInventory] = useState(null);
  const [storeItems, setStoreItems] = useState([]);
  const [streakStatus, setStreakStatus] = useState(null);
  const [showStreakClaim, setShowStreakClaim] = useState(false);
  const [claimingStreak, setClaimingStreak] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showSpotifyConnect, setShowSpotifyConnect] = useState(false);
  const [showMusicConnect, setShowMusicConnect] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedInterests, setEditedInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  // Basic info editing
  const [editedName, setEditedName] = useState('');
  const [editedIndustry, setEditedIndustry] = useState('');
  const [editedJobTitle, setEditedJobTitle] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  // Discovery settings
  const [showAge, setShowAge] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true);
  const location = window.location;

  useEffect(() => {
    checkDailySpinStatus();
    calculateTimeRemaining();
    loadStoreInventory();
    loadStreakStatus();
    const interval = setInterval(() => {
      calculateTimeRemaining();
      updateCooldownCountdown();
    }, 1000);
    try {
      const params = new URLSearchParams(location.search);
      const openWheel = params.get('openWheel');
      if (openWheel === '1') {
        setShowConnectionMatrix(true);
        const newUrl = window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (e) {}
    return () => clearInterval(interval);
  }, [user, wheelStatus]);

  const loadStoreInventory = async () => {
    try {
      const [inventoryRes, itemsRes] = await Promise.all([
        axios.get(`${API}/store/inventory`),
        axios.get(`${API}/store/items`)
      ]);
      setInventory(inventoryRes.data);
      setStoreItems(itemsRes.data || []);
    } catch (error) {
      console.error('Error loading store inventory:', error);
    }
  };

  const loadStreakStatus = async () => {
    try {
      const response = await axios.get(`${API}/streaks/status`);
      setStreakStatus(response.data);
    } catch (error) {
      console.error('Error loading streak status:', error);
    }
  };

  const claimStreakReward = async () => {
    if (claimingStreak) return;
    setClaimingStreak(true);
    try {
      const response = await axios.post(`${API}/streaks/claim`);
      if (response.data.success) {
        setShowStreakClaim(true);
        // Reload streak status and user data
        await loadStreakStatus();
        // Optionally reload user data to show updated coins
        window.location.reload();
      }
    } catch (error) {
      console.error('Error claiming streak reward:', error);
      alert(error.response?.data?.detail || 'Failed to claim reward');
    } finally {
      setClaimingStreak(false);
    }
  };

  const startEditingProfile = () => {
    setEditedBio(user.bio || '');
    setEditedInterests(user.interests || []);
    setEditedName(user.first_name || '');
    setEditedIndustry(user.industry || '');
    setEditedJobTitle(user.job_title || '');
    setEditedLocation(user.location || '');
    setShowAge(user.show_age !== false); // default true
    setShowDistance(user.show_distance !== false); // default true
    setDiscoveryEnabled(user.discovery_enabled !== false); // default true
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    setEditedBio('');
    setEditedInterests([]);
    setNewInterest('');
    setEditedName('');
    setEditedIndustry('');
    setEditedJobTitle('');
    setEditedLocation('');
  };

  const saveProfileEdits = async () => {
    try {
      await axios.put(`${API}/users/me`, {
        bio: editedBio,
        interests: editedInterests,
        first_name: editedName,
        industry: editedIndustry,
        job_title: editedJobTitle,
        location: editedLocation,
        show_age: showAge,
        show_distance: showDistance,
        discovery_enabled: discoveryEnabled
      });
      // Reload the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handlePhotosUpdate = async (photos) => {
    try {
      await axios.put(`${API}/users/photos`, {
        photos: photos
      });
      // Reload the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating photos:', error);
      alert('Failed to update photos. Please try again.');
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !editedInterests.includes(newInterest.trim())) {
      setEditedInterests([...editedInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setEditedInterests(editedInterests.filter(i => i !== interest));
  };

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
    const totalCooldownHours = status.is_premium ? 24 : 24;
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
      <div className="flex-shrink-0" style={{ backgroundColor: '#000000' }}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between mb-4">
            <MergeLogo size="md" color="#FFFFFF" />
          </div>
          <h2 className="text-3xl font-light text-white">Profile</h2>
          
          {/* 21-Day Streak Progress Bar */}
          {streakStatus && (
            <div 
              className="mt-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-400/20 cursor-pointer hover:border-orange-400/40 transition-all"
              onClick={() => setShowStreakClaim(true)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-sm font-medium">Daily Streak: Day {streakStatus.current_streak}/21</span>
                </div>
                {streakStatus.can_claim && (
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    Claim!
                  </div>
                )}
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${(streakStatus.current_streak / 21) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4">
          
          {/* PROFILE HEADER CARD */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 relative">
            {/* Discreet Edit Button - Top Right */}
            <button
              onClick={isEditingProfile ? saveProfileEdits : startEditingProfile}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              title={isEditingProfile ? "Save Changes" : "Edit Profile"}
            >
              {isEditingProfile ? (
                <Check className="w-5 h-5" />
              ) : (
                <Settings className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-cover bg-center border-3 border-white/20 shadow-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                  style={{ backgroundImage: user.photos?.[0] ? `url(${user.photos[0]})` : 'none' }}
                >
                  {!user.photos?.[0] && (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-light">
                      {user.first_name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                
                {/* Streak Badge Overlay */}
                {streakStatus && streakStatus.current_streak > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-black flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {streakStatus.current_streak}
                  </div>
                )}
                
                {/* Photo Edit Button */}
                <button
                  onClick={() => setShowPhotoEditor(true)}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-2 rounded-full hover:scale-110 transition-all shadow-lg border border-purple-300/30"
                  title="Edit Photos"
                >
                  <Camera className="w-4 h-4" />
                </button>
                
                {/* Preview Button - Hidden on mobile, shown on desktop */}
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="hidden md:flex absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-medium items-center gap-1.5 hover:scale-105 transition-all shadow-lg border border-purple-300/30 whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview Card
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                {/* Name & Age - Large, Bold */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{user.first_name}, {age}</h1>
                
                {/* Zodiac & Coins - Smaller, lighter */}
                <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                  <span className="flex items-center gap-1.5">
                    <span>{user.zodiac_sign}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-white/80">{user.star_coins || 0}</span>
                  </span>
                </div>
                
                {/* Industry - Same small font */}
                {!isEditingProfile && user.industry && (
                  <p className="text-sm text-white/60">Industry: {user.industry}</p>
                )}
                {!isEditingProfile && user.location && (
                  <p className="text-sm text-white/60">{user.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* INTERESTS CARD */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-white/80 text-xs uppercase tracking-wider font-medium mb-4">INTERESTS</h2>
            {isEditingProfile ? (
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editedInterests.map((interest, i) => (
                    <span 
                      key={i} 
                      className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white flex items-center gap-2 hover:bg-white/15 transition-colors"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="text-red-400 hover:text-red-300 text-lg"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    placeholder="Add interest..."
                    className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={addInterest}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-white/40 text-sm italic">No interests added yet</span>
                )}
              </div>
            )}
          </div>

          {/* ABOUT ME CARD */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-white/80 text-xs uppercase tracking-wider font-medium mb-4">ABOUT ME</h2>
            {isEditingProfile ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Tell others about yourself..."
                maxLength={500}
                rows={5}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 resize-none"
              />
            ) : (
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                {user.bio || <span className="text-white/40 italic">No bio added yet</span>}
              </p>
            )}
          </div>

          {/* BASIC INFO EDITING SECTION */}
          {isEditingProfile && (
                  <div className="mb-4 space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white/80 text-xs uppercase tracking-wide mb-2">Basic Information</h3>
                    
                    {/* Name */}
                    <div>
                      <label className="text-white/60 text-xs mb-1 block">Display Name</label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="text-white/60 text-xs mb-1 block">Industry</label>
                      <select
                        value={editedIndustry}
                        onChange={(e) => setEditedIndustry(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Design">Design</option>
                        <option value="Legal">Legal</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="text-white/60 text-xs mb-1 block">Job Title</label>
                      <input
                        type="text"
                        value={editedJobTitle}
                        onChange={(e) => setEditedJobTitle(e.target.value)}
                        placeholder="What you do"
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-white/60 text-xs mb-1 block">Location</label>
                      <input
                        type="text"
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        placeholder="City, State"
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Discovery Settings */}
                    <div className="pt-2 border-t border-white/10">
                      <h4 className="text-white/80 text-xs uppercase tracking-wide mb-2">Discovery Settings</h4>
                      
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showAge}
                          onChange={(e) => setShowAge(e.target.checked)}
                          className="w-4 h-4 accent-purple-500"
                        />
                        <span className="text-white/70 text-sm">Show my age to others</span>
                      </label>
                      
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showDistance}
                          onChange={(e) => setShowDistance(e.target.checked)}
                          className="w-4 h-4 accent-purple-500"
                        />
                        <span className="text-white/70 text-sm">Show my distance to others</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={discoveryEnabled}
                          onChange={(e) => setDiscoveryEnabled(e.target.checked)}
                          className="w-4 h-4 accent-purple-500"
                        />
                        <span className="text-white/70 text-sm">Allow others to discover my profile</span>
                      </label>
                    </div>
                    
                    {/* Cancel Button */}
                    <div className="pt-3 border-t border-white/10">
                      <button
                        onClick={cancelEditingProfile}
                        className="text-white/60 hover:text-white text-sm transition-colors"
                      >
                        Cancel Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Display current info when not editing */}
                {!isEditingProfile && (user.industry || user.job_title || user.location) && (
                  <div className="mb-3 space-y-1">
                    {user.job_title && (
                      <div className="text-white/70 text-xs md:text-sm">
                        <span className="text-white/50">Job:</span> {user.job_title}
                      </div>
                    )}
                    {user.industry && (
                      <div className="text-white/70 text-xs md:text-sm">
                        <span className="text-white/50">Industry:</span> {user.industry}
                      </div>
                    )}
                    {user.location && (
                      <div className="text-white/70 text-xs md:text-sm">
                        <span className="text-white/50">Location:</span> {user.location}
                      </div>
                    )}
                  </div>
                )}

                {/* Interests and Bio sections moved to separate cards above */}

                {user.angel_number && (
                  <div className="inline-flex items-center gap-1.5 md:gap-2 bg-white/10 px-2 py-1 md:px-4 md:py-2 rounded-full mt-2">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                    <span className="text-white/80 text-[11px] md:text-sm">Angel Number: {user.angel_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Aura Lab Entry Point */}
          <button
            onClick={() => navigate('/store')}
            className="w-full bg-[#F4F4F5] hover:bg-[#FAFAFA] rounded-2xl p-6 border border-[#E4E4E7] hover:border-[#2563EB]/30 mb-6 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#2563EB] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-medium text-[#3F3F46] mb-1 flex items-center gap-2">
                    Aura Lab
                    <ChevronRight className="w-5 h-5 text-[#A1A1AA] group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-[#A1A1AA] text-sm">Browse enhancements & customizations</p>
                </div>
              </div>
              
              {/* Coin Balance Reminder */}
              <div className="flex items-center gap-2 bg-[#E4E4E7] px-4 py-2 rounded-full">
                <Coins className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[#3F3F46] font-medium">{user.star_coins || 0}</span>
              </div>
            </div>
          </button>

          {/* My Vibe - Universal Music */}
          <button
            onClick={() => setShowMusicConnect(true)}
            className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 hover:border-purple-400/50 mb-6 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Music className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-medium text-white mb-1 flex items-center gap-2">
                    My Vibe
                    <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-white/60 text-sm">
                    {user.vibe_song ? 
                      `${user.vibe_song.title || user.vibe_song.track_name} - ${user.vibe_song.artist}` : 
                      '🌍 Add your anthem (no account needed)'
                    }
                  </p>
                </div>
              </div>
              
              {/* Status Badge */}
              {user.vibe_song && (
                <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-400/30">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 font-medium text-sm">Set</span>
                </div>
              )}
            </div>
          </button>

          {/* Connection Matrix */}
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#0A0A0A', border: '1px solid #3B82F6' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2" style={{ color: '#FAFAFA' }}>
                  <Gift className="w-5 h-5" style={{ color: '#3B82F6' }} />
                  Connection Matrix
                </h3>
                <p className="text-sm" style={{ color: '#A3A3A3' }}>Analyze patterns for rewards</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-400 cosmic-pulse-icon" />
            </div>
            {wheelStatus && (
              <div className="space-y-3 mb-4">
                {!canSpin && cooldownCountdown && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-white/80 text-sm">Next spin available</span>
                      </div>
                      <span className="text-purple-200 font-medium">{cooldownCountdown}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 mt-3">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-1 rounded-full transition-all duration-500 ease-out" style={{ width: `${cooldownProgress}%` }}></div>
                    </div>
                  </div>
                )}
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
                </div>
              </div>
            )}
            <button 
              onClick={() => setShowConnectionMatrix(true)} 
              disabled={!canSpin} 
              className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
              style={{ 
                backgroundColor: canSpin ? '#3B82F6' : '#171717',
                color: canSpin ? '#FAFAFA' : '#737373',
                border: canSpin ? '1px solid #3B82F6' : '1px solid #262626'
              }}
              onMouseEnter={(e) => canSpin && (e.currentTarget.style.backgroundColor = '#2563EB')}
              onMouseLeave={(e) => canSpin && (e.currentTarget.style.backgroundColor = '#3B82F6')}
            >
              {canSpin ? '🔷 Analyze Now' : `⏳ Next analysis: ${cooldownCountdown || 'Soon'}`}
            </button>
          </div>

          {/* Rewards Piggy Bank */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
            <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Your Rewards
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Profile Boosts */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl" />
                <Zap className="w-6 h-6 text-purple-300 mb-2" />
                <div className="text-3xl font-light text-white">{user.profile_boosts || 0}</div>
                <div className="text-xs text-white/50 mt-1">Profile Boosts</div>
                {timeRemaining.boosts && (
                  <div className="flex items-center gap-1 text-xs text-orange-400 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining.boosts}</span>
                  </div>
                )}
              </div>

              {/* Super Likes */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-pink-500/10 blur-2xl" />
                <Heart className="w-6 h-6 text-pink-300 mb-2" />
                <div className="text-3xl font-light text-white">{user.super_likes || 0}</div>
                <div className="text-xs text-white/50 mt-1">Super Likes</div>
                {timeRemaining.super_likes && (
                  <div className="flex items-center gap-1 text-xs text-orange-400 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining.super_likes}</span>
                  </div>
                )}
              </div>

              {/* Direct Messages */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden col-span-2 md:col-span-1">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl" />
                <MessageCircle className="w-6 h-6 text-blue-300 mb-2" />
                <div className="text-3xl font-light text-white">{user.direct_messages || 0}</div>
                <div className="text-xs text-white/50 mt-1">Direct Messages</div>
                {timeRemaining.dms && (
                  <div className="flex items-center gap-1 text-xs text-orange-400 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining.dms}</span>
                  </div>
                )}
              </div>

              {/* Redos */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-yellow-500/10 blur-2xl" />
                <RotateCcw className="w-6 h-6 text-yellow-300 mb-2" />
                <div className="text-3xl font-light text-white">{user.redos || 0}</div>
                <div className="text-xs text-white/50 mt-1">Redos</div>
              </div>

              {/* Star Coins */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl" />
                <Coins className="w-6 h-6 text-amber-300 mb-2" />
                <div className="text-3xl font-light text-white">{user.star_coins || 0}</div>
                <div className="text-xs text-white/50 mt-1">Star Coins</div>
              </div>
            </div>

            {/* Helper text */}
            <p className="text-xs mt-4" style={{ color: '#525252' }}>Items you've purchased or earned from the Connection Matrix live here.</p>
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

          {/* Logout Button */}
          <div className="flex gap-3">
            <button onClick={logout} className="flex-1 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 transition-all">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
            <button
              onClick={async () => {
                try {
                  await fetch(`${API}/rewards/reset-cosmic-wheel`, { method: 'POST', credentials: 'include' });
                  await checkDailySpinStatus();
                  setShowConnectionMatrix(true);
                } catch (e) {
                  console.error('Reset Connection Matrix failed', e);
                }
              }}
              className="flex-1 text-white border rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Reset Wheel (Dev)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="profile" navigate={navigate} />

      {/* Connection Matrix Modal */}
      <ConnectionMatrix isOpen={showConnectionMatrix} onClose={() => setShowConnectionMatrix(false)} onRewardClaimed={handleRewardClaimed} />
      
      {/* Streak Details Modal - Tarot Card Edition */}
      {showStreakClaim && streakStatus && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowStreakClaim(false)}
        >
          <div 
            className="relative max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowStreakClaim(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors text-3xl z-10"
            >
              ✕
            </button>

            {/* Title */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-6 h-6 text-orange-400" />
                <h3 className="text-2xl font-light text-white">Day {streakStatus.current_streak} — Keep the cosmic flow alive!</h3>
              </div>
              <p className="text-white/60 text-sm">Every day you flip a new card of destiny</p>
            </div>

            {/* Tarot Card */}
            <TarotStreakCard
              streakDay={streakStatus.current_streak + 1}
              reward={streakStatus.current_reward}
              onClaim={claimStreakReward}
              canClaim={streakStatus.can_claim}
              isClaiming={claimingStreak}
            />

            {/* 21-Star Progress Tracker */}
            <div className="mt-6 px-4">
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {[...Array(21)].map((_, i) => {
                  const day = i + 1;
                  const isCurrent = day === streakStatus.current_streak;
                  const isCompleted = day <= streakStatus.current_streak;
                  const isMilestone = [7, 14, 21].includes(day);
                  
                  return (
                    <div
                      key={day}
                      className={`relative transition-all ${
                        isCurrent ? 'scale-125' : 'scale-100'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full transition-all ${
                          isCompleted
                            ? isMilestone
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg'
                              : 'bg-gradient-to-br from-orange-400 to-red-500'
                            : 'bg-white/20'
                        } ${isCurrent ? 'animate-pulse' : ''}`}
                        style={{
                          boxShadow: isCompleted
                            ? isMilestone
                              ? '0 0 10px #fbbf24'
                              : '0 0 6px #f97316'
                            : 'none'
                        }}
                      />
                      {isMilestone && (
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                          <Trophy className={`w-3 h-3 ${isCompleted ? 'text-yellow-400' : 'text-white/30'}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-white/40">
                <span>Day 1</span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  Day 21
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Preview Modal */}
      {showPreviewModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div 
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <span>Close</span>
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                ✕
              </div>
            </button>

            {/* Title */}
            <div className="mb-4 text-center">
              <h3 className="text-xl font-light text-white mb-1 flex items-center justify-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                How Others See You
              </h3>
              <p className="text-white/60 text-sm">
                Your profile card on the swipe deck
              </p>
            </div>

            {/* Preview Card */}
            <div
              className="relative bg-white/5 rounded-2xl overflow-hidden border border-white/10"
              style={{
                height: '500px',
                boxShadow: inventory?.active_light 
                  ? `0 0 40px ${storeItems.find(i => i.id === inventory.active_light)?.effect?.color || '#a78bfa'}40, 0 0 80px ${storeItems.find(i => i.id === inventory.active_light)?.effect?.color || '#a78bfa'}20`
                  : `0 0 40px ${getZodiacTheme(user.zodiac_sign).accentColor}40, 0 0 80px ${getZodiacTheme(user.zodiac_sign).accentColor}20`
              }}
            >
              {/* Zodiac Season Background Glow */}
              {(() => {
                const zodiacTheme = getZodiacTheme(user.zodiac_sign);
                return (
                  <div 
                    className={`zodiac-season-bg zodiac-motion-${zodiacTheme.motionType}`}
                    style={{
                      background: getGradientString(zodiacTheme),
                      opacity: zodiacTheme.opacity,
                      '--zodiac-duration': zodiacTheme.duration
                    }}
                  />
                );
              })()}

              {/* Active Premium Skin Background */}
              {inventory?.active_skin && (() => {
                const skinItem = storeItems.find(i => i.id === inventory.active_skin);
                if (skinItem?.effect) {
                  return <PremiumSkinRenderer skinEffect={skinItem.effect} zodiacSign={user.zodiac_sign} />;
                }
                return null;
              })()}

              {/* Photo */}
              <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                  backgroundImage: user.photos?.[0] ? `url(${user.photos[0]})` : 'none',
                  backgroundColor: !user.photos?.[0] ? '#1a1a2e' : 'transparent'
                }}
              >
                {!user.photos?.[0] && (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-6xl">
                    {user.first_name?.[0] || 'U'}
                  </div>
                )}
              </div>

              {/* Active Light Effect */}
              {inventory?.active_light && (() => {
                const lightItem = storeItems.find(i => i.id === inventory.active_light);
                if (lightItem?.effect) {
                  const effect = lightItem.effect;
                  
                  if (effect.type === 'glow') {
                    return (
                      <div 
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${effect.color}60, transparent 70%)`,
                          animation: 'pulse 3s ease-in-out infinite'
                        }}
                      />
                    );
                  }
                  
                  if (effect.type === 'aurora' && effect.colors) {
                    return (
                      <div 
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${effect.colors.map((c, i) => `${c}${i === 0 ? '40' : i === 1 ? '20' : '10'}`).join(', ')})`,
                          animation: 'shimmer 4s ease-in-out infinite',
                          backgroundSize: '200% 200%'
                        }}
                      />
                    );
                  }
                  
                  if (effect.type === 'flames' && effect.colors) {
                    return (
                      <div 
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{
                          background: `linear-gradient(0deg, ${effect.colors[0]}50, ${effect.colors[1]}30, transparent)`,
                          animation: 'flicker 2s ease-in-out infinite'
                        }}
                      />
                    );
                  }
                  
                  if (effect.type === 'rays') {
                    return (
                      <div 
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse at top, ${effect.color}40, transparent 60%)`,
                          animation: 'pulse 4s ease-in-out infinite'
                        }}
                      />
                    );
                  }
                }
                return null;
              })()}

              {/* Card Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-20" />
              
              {/* Profile Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
                <h2 className="text-4xl font-light text-white mb-2">
                  {user.first_name}, {age}
                </h2>
                <div className="flex items-center gap-2 text-white/80 mb-3">
                  {/* Constellation with compatibility-based glow */}
                  <div 
                    className="relative"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.4))'
                    }}
                  >
                    <ConstellationIcon 
                      sign={user.zodiac_sign?.toLowerCase() || 'leo'} 
                      className="w-5 h-5"
                    />
                  </div>
                  <span className="text-base">{user.zodiac_sign}</span>
                </div>
                {user.bio && (
                  <p className="text-white/70 text-sm line-clamp-2">{user.bio}</p>
                )}
              </div>

              {/* Active Items Badges */}
              {(inventory?.active_light || inventory?.active_skin) && (
                <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                  {inventory.active_light && (
                    <div className="bg-purple-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-purple-300/30">
                      <Zap className="w-3 h-3" />
                      {storeItems.find(i => i.id === inventory.active_light)?.name || 'Light'}
                    </div>
                  )}
                  {inventory.active_skin && (
                    <div className="bg-pink-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-pink-300/30">
                      <Sparkles className="w-3 h-3" />
                      {storeItems.find(i => i.id === inventory.active_skin)?.name || 'Skin'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Go to Store CTA */}
            {(!inventory?.active_light && !inventory?.active_skin) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    navigate('/store');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:scale-105 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Customize in Store
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Photo Editor Modal */}
      {showPhotoEditor && (
        <PhotoEditorModal
          currentPhotos={user.photos || []}
          onSave={handlePhotosUpdate}
          onClose={() => setShowPhotoEditor(false)}
        />
      )}
      
      {/* Spotify Connect Modal (Optional - for advanced users) */}
      {showSpotifyConnect && (
        <SpotifyConnect
          user={user}
          onClose={() => setShowSpotifyConnect(false)}
          onVibeSongSet={() => window.location.reload()}
        />
      )}
      
      {/* Universal Music Connect Modal */}
      {showMusicConnect && (
        <MusicConnect
          user={user}
          onClose={() => setShowMusicConnect(false)}
          onAnthemSet={() => window.location.reload()}
        />
      )}
      
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
