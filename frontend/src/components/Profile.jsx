import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Settings, LogOut, Sparkles, Users, Home, Zap, Heart, MessageCircle, Award, Gift, Clock, RotateCcw, Coins, Eye } from 'lucide-react';
import CosmicWheel from './CosmicWheel';
import BottomNav from './BottomNav';
import ConstellationIcon from './ConstellationIcon';
import { getZodiacTheme, getGradientString } from '../utils/zodiacSeasonThemes';

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
  const [showCosmicWheel, setShowCosmicWheel] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [wheelStatus, setWheelStatus] = useState(null);
  const [cooldownCountdown, setCooldownCountdown] = useState('');
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [inventory, setInventory] = useState(null);
  const [storeItems, setStoreItems] = useState([]);
  const location = window.location;

  useEffect(() => {
    checkDailySpinStatus();
    calculateTimeRemaining();
    loadStoreInventory();
    const interval = setInterval(() => {
      calculateTimeRemaining();
      updateCooldownCountdown();
    }, 1000);
    try {
      const params = new URLSearchParams(location.search);
      const openWheel = params.get('openWheel');
      if (openWheel === '1') {
        setShowCosmicWheel(true);
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
      <div className="border-b border-white/10 bg-black flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <img src="/asign-logo.png" alt="A Sign" className="h-8" />
            <button onClick={() => navigate('/settings')} className="text-white/60 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-3xl font-light text-white">Profile</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Profile Header */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-6">
            <div className="flex items-start gap-6">
              <div
                className="w-32 h-32 rounded-2xl bg-cover bg-center flex-shrink-0 border-2 border-white/20 bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                style={{ backgroundImage: user.photos?.[0] ? `url(${user.photos[0]})` : 'none' }}
              >
                {!user.photos?.[0] && (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-light">
                    {user.first_name?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-4xl font-light text-white mb-3">{user.first_name}, {age}</h2>
                <div className="flex items-center gap-3 text-white/60 mb-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white text-sm">
                    {zodiacSymbol(user.zodiac_sign)}
                  </div>
                  <span className="text-lg">{user.zodiac_sign}</span>
                </div>
                {user.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {user.interests.slice(0, 4).map((interest, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-white/70">{interest}</span>
                    ))}
                  </div>
                )}
                {user.angel_number && (
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-white/80 text-sm">Angel Number: {user.angel_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* As Others See You Preview */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-light text-white">As Others See You</h3>
            </div>
            <p className="text-white/60 text-sm mb-4">
              This is how your profile card appears to others when they're swiping
            </p>
            
            {/* Preview Card */}
            <div className="max-w-md mx-auto">
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

                {/* Active Skin Background */}
                {inventory?.active_skin && (() => {
                  const skinItem = storeItems.find(i => i.id === inventory.active_skin);
                  if (skinItem?.effect?.colors) {
                    return (
                      <div 
                        className="absolute inset-0 z-0"
                        style={{
                          background: `linear-gradient(135deg, ${skinItem.effect.colors.join(', ')})`,
                          opacity: 0.6
                        }}
                      />
                    );
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
                    <p className="text-white/70 text-sm mb-2 line-clamp-2">{user.bio}</p>
                  )}
                  {user.interests && user.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {user.interests.slice(0, 3).map((interest, i) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/70 border border-white/20">
                          {interest}
                        </span>
                      ))}
                    </div>
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
                    onClick={() => navigate('/store')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Customize in Store
                  </button>
                </div>
              )}
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
            <button onClick={() => setShowCosmicWheel(true)} disabled={!canSpin} className={`w-full py-3 rounded-xl font-medium transition-all ${canSpin ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-105 shadow-lg shadow-purple-500/30' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}>
              {canSpin ? '✨ Spin Now' : `⏳ Next spin: ${cooldownCountdown || 'Soon'}`}
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
            <p className="text-white/50 text-xs mt-4">This is your piggy bank — items you've purchased or won from the Cosmic Wheel live here.</p>
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
                  <span key={idx} className="px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm border border-white/10">{interest}</span>
                ))}
              </div>
            </div>
          )}

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
      <CosmicWheel isOpen={showCosmicWheel} onClose={() => setShowCosmicWheel(false)} onRewardClaimed={handleRewardClaimed} />
    </div>
  );
}
