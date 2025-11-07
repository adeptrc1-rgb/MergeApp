import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, X, Star, Sparkles, Users, Home as HomeIcon, RotateCcw, MessageCircle, Zap, XCircle, ChevronDown, ChevronUp, Music } from 'lucide-react';
import ConstellationIcon from './ConstellationIcon';
import BottomNav from './BottomNav';
import PremiumSkinRenderer from './PremiumSkinRenderer';
import AnimatedProfileText from './AnimatedProfileText';
import LightEffectRenderer from './LightEffectRenderer';
import { 
  createStarburstEffect, 
  createSparkleTrail, 
  createShootingStar,
  createHeartBurst,
  createFloatingSign,
  createMatchAnimation,
  createStardustTrail
,
  createFloatingHearts
} from '../utils/particleEffects';
import { getZodiacTheme, getGradientString } from '../utils/zodiacSeasonThemes';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

axios.defaults.withCredentials = true;

// Element compatibility map (kept for potential use)
const ELEMENT_MAP = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
};

export default function Home({ user }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [todayHoroscope, setTodayHoroscope] = useState(null);
  const [showHoroscopeModal, setShowHoroscopeModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [storeItems, setStoreItems] = useState([]);
  const [userInventory, setUserInventory] = useState(null);
  const cardRef = useRef(null);
  const likeButtonRef = useRef(null);
  const passButtonRef = useRef(null);
  const superLikeButtonRef = useRef(null);

  // Touch/Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadMatches();
    loadTodayHoroscope();
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const [itemsRes, inventoryRes] = await Promise.all([
        axios.get(`${API}/store/items`),
        axios.get(`${API}/store/inventory`)
      ]);
      setStoreItems(itemsRes.data || []);
      setUserInventory(inventoryRes.data);
    } catch (error) {
      console.error('Error loading store data:', error);
    }
  };

  // Add touch event listener with passive: false to allow preventDefault
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchMove = (e) => {
      if (isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStart.x;
        const deltaY = touch.clientY - dragStart.y;
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          e.preventDefault();
        }
      }
    };

    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      card.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, dragStart]);

  const loadTodayHoroscope = async () => {
    try {
      const response = await axios.get(`${API}/horoscope/today`);
      setTodayHoroscope(response.data);
    } catch (error) {
      console.error('Error loading horoscope:', error);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await axios.get(`${API}/users/potential-matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
    setLoading(false);
  };

  const currentMatch = matches[currentIndex];

  const handleLike = async () => {
    if (!currentMatch) return;
    setSwipeDirection('right');
    setShowDropdown(false);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = rect.right - 50;
      const y = rect.top + rect.height / 2;
      createStarburstEffect(x, y);
      createSparkleTrail(x, y);
      createStardustTrail(x, y, 10);
    }

    setSwipeHistory([...swipeHistory, { index: currentIndex, action: 'like', userId: currentMatch.id }]);
    try {
      await axios.post(`${API}/users/like/${currentMatch.id}`);
      const matchResponse = await axios.get(`${API}/users/check-match/${currentMatch.id}`);
      if (matchResponse.data.is_match) {
        createHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => {
          alert(`🎉 It's a match! You and ${currentMatch.first_name} both liked each other!`);
        }, 500);
      }
    } catch (error) {
      console.error('Error liking:', error);
    }

    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
    }, 300);
  };

  const handleSuperLike = async () => {
    if (!currentMatch) return;
    if ((user.super_likes || 0) <= 0) {
      alert('No super likes remaining!');
      return;
    }
    setSwipeDirection('up');
    setShowDropdown(false);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      createStarburstEffect(x, y);
      createHeartBurst(x, y - 50);
      createStardustTrail(x, y, 20);
    }

    setSwipeHistory([...swipeHistory, { index: currentIndex, action: 'superlike', userId: currentMatch.id }]);
    try {
      await axios.post(`${API}/users/super-like/${currentMatch.id}`);
      alert(`⭐ Super liked ${currentMatch.first_name}!`);
    } catch (error) {
      console.error('Error super liking:', error);
    }

    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
    }, 300);
  };

  const handlePass = async () => {
    if (!currentMatch) return;
    setSwipeDirection('left');
    setShowDropdown(false);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = rect.left + 50;
      const y = rect.top + rect.height / 2;
      createShootingStar(x, y, 'left');
    }

    setSwipeHistory([...swipeHistory, { index: currentIndex, action: 'pass', userId: currentMatch.id }]);
    try {
      await axios.post(`${API}/users/pass/${currentMatch.id}`);
    } catch (error) {
      console.error('Error passing:', error);
    }

    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
    }, 300);
  };

  const handleDirectMessage = async () => {
    if (!currentMatch) return;
    if ((user.direct_messages || 0) <= 0) {
      alert('No direct messages remaining! Spin the cosmic wheel or match with someone to get more.');
      return;
    }
    if (likeButtonRef.current) {
      createFloatingSign(likeButtonRef.current);
    }
    try {
      const response = await axios.post(`${API}/users/direct-message/${currentMatch.id}`);
      if (response.data.success) {
        await axios.post(`${API}/users/use-direct-message`);
        const matchId = String(response.data.match_id);
        // Navigate to Messages within app shell and open the conversation inline
        navigate(`/messages?chat=${encodeURIComponent(matchId)}`);
      }
    } catch (error) {
      console.error('Error sending direct message:', error);
      alert('Failed to send direct message. Please try again.');
    }
  };

  const handleUndo = async () => {
    if (swipeHistory.length === 0) return;
    const lastSwipe = swipeHistory[swipeHistory.length - 1];
    try {
      await axios.delete(`${API}/users/undo-swipe/${lastSwipe.userId}`);
      setSwipeHistory(swipeHistory.slice(0, -1));
      setCurrentIndex(Math.max(0, currentIndex - 1));
      setCurrentPhotoIndex(0);
    } catch (error) {
      console.error('Error undoing swipe:', error);
    }
  };

  const nextPhoto = () => {
    if (currentMatch?.photos && currentMatch.photos.length > 0) {
      setCurrentPhotoIndex((currentPhotoIndex + 1) % currentMatch.photos.length);
    }
  };

  const prevPhoto = () => {
    if (currentMatch?.photos && currentMatch.photos.length > 0) {
      setCurrentPhotoIndex(currentPhotoIndex > 0 ? currentPhotoIndex - 1 : currentMatch.photos.length - 1);
    }
  };

  // Touch/Drag handlers
  const handleDragStart = (e) => {
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const swipeThreshold = 100;
    const superLikeThreshold = -150; // Swipe up
    if (dragOffset.y < superLikeThreshold && Math.abs(dragOffset.x) < 100) {
      handleSuperLike();
    } else if (dragOffset.x > swipeThreshold) {
      handleLike();
    } else if (dragOffset.x < -swipeThreshold) {
      handlePass();
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const getSwipeOpacity = () => {
    if (Math.abs(dragOffset.x) < 50 && Math.abs(dragOffset.y) > -100) return 0;
    return Math.min(Math.abs(dragOffset.x) / 100, 1);
  };

  const getSwipeLabel = () => {
    if (dragOffset.y < -100 && Math.abs(dragOffset.x) < 100) {
      return { text: 'SUPER LIKE', color: 'text-blue-500', show: true };
    }
    if (dragOffset.x > 50) {
      return { text: 'LIKE', color: 'text-green-500', show: true };
    }
    if (dragOffset.x < -50) {
      return { text: 'NOPE', color: 'text-red-500', show: true };
    }
    return { show: false };
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance);
  };

  const getDistance = (match) => {
    if (user?.current_location && match?.current_location) {
      const distance = calculateDistance(
        user.current_location.latitude,
        user.current_location.longitude,
        match.current_location.latitude,
        match.current_location.longitude
      );
      return distance;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-lg">Finding your cosmic matches...</p>
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="h-screen bg-black flex flex-col overflow-hidden">
        <div className="border-b border-white/10 bg-black flex-shrink-0">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <img src="/asign-logo.png" alt="A Sign" className="h-10" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">✨</div>
            <h3 className="text-2xl font-light text-white mb-3">No more profiles</h3>
            <p className="text-white/40 mb-8">Check back later for more cosmic connections</p>
            <button
              onClick={() => navigate('/connections')}
              className="px-8 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all font-medium"
            >
              View Connections
            </button>
          </div>
        </div>

        <BottomNav currentTab="home" navigate={navigate} />
      </div>
    );
  }

  const age = currentMatch.birth_date ? calculateAge(currentMatch.birth_date) : 25;
  const compatibility = Math.round(currentMatch.compatibility_score || Math.floor(Math.random() * 30) + 70);

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Horoscope Modal */}
      {showHoroscopeModal && todayHoroscope && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowHoroscopeModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-purple-900/90 via-black to-pink-900/90 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ConstellationIcon sign={todayHoroscope.constellation} className="w-10 h-10" />
                <h2 className="text-2xl font-light text-white">{todayHoroscope.sign}</h2>
              </div>
              <button 
                onClick={() => setShowHoroscopeModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-white/90 text-base font-light leading-relaxed">
                {todayHoroscope.message_long || todayHoroscope.message}
              </p>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/50 text-sm text-center">
                  Your cosmic energy for today
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-black flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          {todayHoroscope ? (
            <button 
              onClick={() => setShowHoroscopeModal(true)}
              className="hover:scale-110 transition-transform cursor-pointer"
              title="View today's horoscope"
            >
              <ConstellationIcon sign={todayHoroscope.constellation} className="w-7 h-7" />
            </button>
          ) : (
            <div className="w-7 h-7 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-purple-400">
              <Star className="w-4 h-4" />
              <span className="text-sm">{user.zodiac_sign}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center bg-gradient-to-b from-black via-purple-900/20 to-black pt-8 px-4 pb-20">
        <div className="w-full max-w-md relative flex flex-col space-y-4">
          <div 
            className="w-full"
            style={{ 
              perspective: '1000px',
              height: showDropdown ? '78vh' : '68vh',
              maxHeight: showDropdown ? '720px' : '620px'
            }}
          >
            <div 
              ref={cardRef}
              onMouseDown={!showDropdown ? handleDragStart : undefined}
              onMouseMove={!showDropdown ? handleDragMove : undefined}
              onMouseUp={!showDropdown ? handleDragEnd : undefined}
              onMouseLeave={!showDropdown ? handleDragEnd : undefined}
              onTouchStart={!showDropdown ? handleDragStart : undefined}
              onTouchMove={!showDropdown ? handleDragMove : undefined}
              onTouchEnd={!showDropdown ? handleDragEnd : undefined}
              className={`relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing w-full transition-all duration-500 ${
                swipeDirection === 'right' ? 'translate-x-full rotate-12' :
                swipeDirection === 'left' ? '-translate-x-full -rotate-12' :
                swipeDirection === 'up' ? '-translate-y-full scale-110' :
                ''
              }`}
              style={{
                height: showDropdown ? '80vh' : '68vh',
                maxHeight: showDropdown ? '750px' : '620px',
                transform: isDragging 
                  ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)` 
                  : swipeDirection ? undefined : 'translate(0, 0)',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                // Apply light effect if user has active light, otherwise use zodiac glow
                ...(userInventory?.active_light && (() => {
                  const activeLight = storeItems.find(item => item.id === userInventory.active_light);
                  if (activeLight?.effect) {
                    return LightEffectRenderer({ lightEffect: activeLight.effect });
                  }
                  return {};
                })() || {
                  boxShadow: `0 0 40px ${getZodiacTheme(currentMatch.zodiac_sign).accentColor}40, 0 0 80px ${getZodiacTheme(currentMatch.zodiac_sign).accentColor}20`
                })
              }}
            >
              {/* Swipe Overlay Labels */}
              {isDragging && getSwipeLabel().show && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div 
                    className={`text-6xl font-bold ${getSwipeLabel().color} border-4 border-current px-8 py-4 rounded-2xl rotate-12`}
                    style={{ opacity: getSwipeOpacity() }}
                  >
                    {getSwipeLabel().text}
                  </div>
                </div>
              )}

              {/* Photo */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                style={{ 
                  backgroundImage: `url(${currentMatch.photos?.[currentPhotoIndex] || 'https://via.placeholder.com/400x600'})`
                }}
              >
                {/* Photo nav tap zones */}
                {currentMatch.photos && currentMatch.photos.length > 1 && (
                  <>
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                    />
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                    />
                  </>
                )}

                {/* Dots */}
                {/* Dots removed as per design */}

                {/* Progress dots hidden */}

                {/* subtle background gradient to dark */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />
                {/* Temporary readability dark scrim when expanded */}
                {showDropdown && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.8)'
                    }}
                  />
                )}
              </div>

              {/* Bottom info + dropdown */}
              <div className="absolute bottom-0 left-0 right-0 text-white">
                {/* Zodiac Season Glow */}
                {currentMatch.season_spotlight_active && (
                  <div className="absolute -inset-2 rounded-3xl pointer-events-none" style={{
                    boxShadow: `0 0 24px 8px ${currentMatch.season_color || '#a78bfa'}`,
                    opacity: 0.75,
                    filter: 'saturate(120%)'
                  }} />
                )}
                <div className={`bg-gradient-to-t from-black/70 via-black/40 to-transparent px-6 pb-6 pt-6 relative transition-all rounded-2xl ${showDropdown ? 'pb-1' : ''}`}>
                  {/* Season badge */}
                  {currentMatch.season_spotlight_active && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border mb-2" style={{
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      borderColor: (currentMatch.season_color || '#a78bfa') + '55',
                      color: currentMatch.season_color || '#a78bfa'
                    }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentMatch.season_color || '#a78bfa' }} />
                      {currentMatch.season_sign} Season
                    </div>
                  )}
                  <h2 className="text-4xl font-light mb-2">
                    {userInventory?.active_skin && (() => {
                      const activeSkin = storeItems.find(item => item.id === userInventory.active_skin);
                      if (activeSkin?.effect?.nameAnimation) {
                        return (
                          <AnimatedProfileText 
                            animationType={activeSkin.effect.nameAnimation}
                            glowColor={activeSkin.effect.textGlow}
                          >
                            {currentMatch.first_name}, {age}
                          </AnimatedProfileText>
                        );
                      }
                      return `${currentMatch.first_name}, ${age}`;
                    })() || `${currentMatch.first_name}, ${age}`}
                  </h2>
                  <div className="flex items-center gap-2 text-white/80 mb-3">
                    {/* Constellation with skin-based animation */}
                    {(() => {
                      const activeSkin = storeItems.find(item => item.id === userInventory?.active_skin);
                      const glowColor = activeSkin?.effect?.textGlow || '#a78bfa';
                      const baseGlow = compatibility >= 90 
                        ? 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.9)) drop-shadow(0 0 16px rgba(168, 85, 247, 0.6))'
                        : compatibility >= 80
                        ? 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.7)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.4))'
                        : compatibility >= 75
                        ? 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.5)) drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))'
                        : 'drop-shadow(0 0 2px rgba(168, 85, 247, 0.3))';
                      
                      // Add skin-specific glow and animation
                      let customGlow = baseGlow;
                      let animationClass = '';
                      
                      if (activeSkin?.effect) {
                        if (activeSkin.effect.type === 'galaxy') {
                          customGlow = `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 12px ${glowColor}80)`;
                          animationClass = 'animate-pulse-glow';
                        } else if (activeSkin.effect.type === 'pastel') {
                          customGlow = `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 8px ${glowColor}60)`;
                          animationClass = 'animate-float-gentle';
                        } else if (activeSkin.effect.type === 'zodiac') {
                          customGlow = `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor}80)`;
                          animationClass = 'animate-text-shimmer';
                        } else if (activeSkin.effect.type === 'neon') {
                          customGlow = `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 20px ${glowColor})`;
                          animationClass = 'animate-neon-pulse';
                        }
                      }
                      
                      return (
                        <div 
                          className={`relative ${animationClass}`}
                          style={{ filter: customGlow }}
                        >
                          <ConstellationIcon 
                            sign={currentMatch.zodiac_sign?.toLowerCase() || 'leo'} 
                            className="w-5 h-5"
                          />
                        </div>
                      );
                    })()}
                    <span className="text-base">{currentMatch.zodiac_sign}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-sm">
                      {getDistance(currentMatch) !== null ? `${getDistance(currentMatch)} miles away` : 'Location unavailable'}
                    </span>
                  </div>

                  {/* Compatibility + toggle */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-sm font-medium">{compatibility}% Compatible</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDropdown((prev) => !prev); }}
                      className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
                    >
                      <span className="text-sm font-light">{showDropdown ? 'Show less' : 'Show more'}</span>
                      {showDropdown ? (<ChevronUp className="w-4 h-4" />) : (<ChevronDown className="w-4 h-4" />)}
                    </button>
                  </div>

                  {/* Expandable Dropdown Content */}
                  <div 
                    className={`transition-all duration-300 ease-in-out ${showDropdown ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'}`}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onScroll={(e) => e.stopPropagation()}
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                      overflowY: showDropdown ? 'auto' : 'hidden',
                      overflowX: 'hidden'
                    }}
                  >
                    <div className="space-y-4 pt-2 pb-12">
                      {/* No data fallback */}
                      {!currentMatch.bio && (!currentMatch.interests || currentMatch.interests.length === 0) && !currentMatch.deal_breakers?.relationship_goals && !currentMatch.lifestyle_factors && !currentMatch.preferences?.music && (
                        <div className="text-center py-4">
                          <p className="text-white/50 text-sm italic">No additional profile information available</p>
                        </div>
                      )}

                      {/* Bio */}
                      {currentMatch.bio && (
                        <div className="space-y-2">
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium">About</h3>
                          <p className="text-white/90 text-sm leading-relaxed">{currentMatch.bio}</p>
                        </div>
                      )}

                      {/* Interests */}
                      {currentMatch.interests && currentMatch.interests.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium">Interests</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentMatch.interests.map((interest, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white/90">{interest}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Relationship Goals */}
                      {currentMatch.deal_breakers?.relationship_goals && (
                        <div className="space-y-2">
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Looking For
                          </h3>
                          <p className="text-white/90 text-sm capitalize">{currentMatch.deal_breakers.relationship_goals.replace(/_/g, ' ')}</p>
                        </div>
                      )}

                      {/* Lifestyle */}
                      {currentMatch.lifestyle_factors && (
                        <div className="space-y-2">
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Lifestyle
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {currentMatch.lifestyle_factors.fitness_health && (
                              <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                                <span className="text-white/80">Fitness</span>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < currentMatch.lifestyle_factors.fitness_health ? 'bg-purple-400' : 'bg-white/20'}`}></div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {currentMatch.lifestyle_factors.social_energy && (
                              <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                                <span className="text-white/80">Social</span>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < currentMatch.lifestyle_factors.social_energy ? 'bg-pink-400' : 'bg-white/20'}`}></div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {currentMatch.lifestyle_factors.travel_adventure && (
                              <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                                <span className="text-white/80">Travel</span>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < currentMatch.lifestyle_factors.travel_adventure ? 'bg-cyan-400' : 'bg-white/20'}`}></div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {currentMatch.lifestyle_factors.family_future && (
                              <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                                <span className="text-white/80">Family</span>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < currentMatch.lifestyle_factors.family_future ? 'bg-rose-400' : 'bg-white/20'}`}></div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Music */}
                      {currentMatch.preferences?.music && (
                        <div className="space-y-2">
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            Music
                          </h3>
                          <p className="text-white/90 text-sm">{currentMatch.preferences.music}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!showDropdown && (
            <div
              className="w-full flex items-center justify-center gap-5 px-3 mt-2 z-50 fixed md:static left-0 right-0"
              style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}
            >
              {/* Undo */}
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createStardustTrail(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
                  handleUndo();
                }}
                disabled={swipeHistory.length === 0}
                className="bg-white/10 backdrop-blur-md rounded-full p-3.5 hover:bg-white/20 active:scale-95 transition-all border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 shadow-xl"
                title="Undo"
              >
                <RotateCcw className="w-5 h-5 text-yellow-400" />
              </button>

              {/* Pass */}
              <button
                ref={passButtonRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createStardustTrail(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
                  handlePass();
                }}
                className="bg-white/10 backdrop-blur-md rounded-full p-4 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl border-2 border-white/20 hover:shadow-red-500/50"
                title="Pass"
              >
                <X className="w-6 h-6 text-red-500" />
              </button>

              {/* Like */}
              <button
                ref={likeButtonRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createFloatingHearts(rect.left + rect.width / 2, rect.top, 8);
                  handleLike();
                }}
                className="bg-white/10 backdrop-blur-md rounded-full p-4 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl border-2 border-white/20 hover:shadow-green-500/50"
                title="Like"
              >
                <Heart className="w-6 h-6 text-green-500" />
              </button>

              {/* Super Like */}
              <button
                ref={superLikeButtonRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createStarburstEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
                  handleSuperLike();
                }}
                className="bg-white/10 backdrop-blur-md rounded-full p-4 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl border-2 border-white/20 hover:shadow-blue-500/50"
                title="Super Like"
              >
                <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
              </button>

              {/* Direct Message */}
              <button
                onClick={(e) => { createFloatingSign(e.currentTarget); handleDirectMessage(); }}
                className="bg-white/10 backdrop-blur-md rounded-full p-3.5 hover:bg-white/20 active:scale-95 transition-all shadow-xl hover:scale-110 border border-white/20 hover:shadow-purple-500/50"
                title="Direct Message"
              >
                <MessageCircle className="w-5 h-5 text-purple-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="home" navigate={navigate} />
    </div>
  );
}
