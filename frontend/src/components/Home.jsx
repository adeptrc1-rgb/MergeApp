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
import { generateCosmicInsights } from '../utils/cosmicTemplates';
import { generateAIConversationStarters, trackStarterUsed } from '../services/aiConversationService';
import MergeLogo from './MergeLogo';
import LogoStateTester from './LogoStateTester';
import CosmicStarfield from './CosmicStarfield';
import { updateLogoState } from '../utils/logoStateManager';
import logoStateManager from '../utils/logoStateManager';
import '../styles/swipeButtons.css';
import '../styles/cosmicStarfield.css';

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
  const [justSwiped, setJustSwiped] = useState(false);
  
  // AI Conversation Starters State
  const [cosmicInsights, setCosmicInsights] = useState(null);
  const [aiStarters, setAiStarters] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIStarters, setShowAIStarters] = useState(false);
  
  // Cosmic Insights expansion state
  const [showCosmicInsights, setShowCosmicInsights] = useState(false);
  
  // Unread messages state
  const [unreadCount, setUnreadCount] = useState(0);
  
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
    loadUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
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

  const loadUnreadCount = async () => {
    try {
      const response = await axios.get(`${API}/messages/unread-count`);
      const count = response.data.unread_count || 0;
      setUnreadCount(count);
      
      // Update logo state based on unread messages
      if (count > 0) {
        updateLogoState('connected');
      } else {
        // Only revert to default if currently in connected state
        const currentState = logoStateManager.getState();
        if (currentState === 'connected') {
          updateLogoState('default');
        }
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Generate cosmic insights and AI starters
  const generateInsightsAndStarters = async (matchUser, compatibilityScore) => {
    try {
      // Generate cosmic insights from templates
      const insights = generateCosmicInsights(
        user.zodiac_sign || 'Leo',
        matchUser.zodiac_sign || 'Aries',
        compatibilityScore
      );
      setCosmicInsights(insights);
      
      // Generate AI conversation starters
      setLoadingAI(true);
      const starters = await generateAIConversationStarters(
        {
          id: user.id,
          first_name: user.first_name,
          age: calculateAge(user.birth_date),
          zodiac_sign: user.zodiac_sign,
          interests: user.interests,
          bio: user.bio
        },
        {
          id: matchUser.id,
          first_name: matchUser.first_name,
          age: calculateAge(matchUser.birth_date),
          zodiac_sign: matchUser.zodiac_sign,
          interests: matchUser.interests,
          bio: matchUser.bio
        },
        insights
      );
      setAiStarters(starters);
      setShowAIStarters(true);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  // Handle "Show more" toggle for profile details
  const handleShowMore = (matchUser, compatibilityScore) => {
    const newState = !showDropdown;
    setShowDropdown(newState);
    
    // Generate insights when Show more is expanded for the first time
    if (newState && !cosmicInsights) {
      generateInsightsAndStarters(matchUser, compatibilityScore);
    }
  };
  
  // Handle Cosmic Insights toggle - expands upward
  const handleCosmicInsightsToggle = (matchUser, compatibilityScore) => {
    setShowCosmicInsights(!showCosmicInsights);
  };
  
  // Regenerate AI starters
  const regenerateStarters = async () => {
    if (!currentMatch || !cosmicInsights) return;
    
    setLoadingAI(true);
    try {
      const starters = await generateAIConversationStarters(
        {
          id: user.id,
          first_name: user.first_name,
          age: calculateAge(user.birth_date),
          zodiac_sign: user.zodiac_sign,
          interests: user.interests,
          bio: user.bio
        },
        {
          id: currentMatch.id,
          first_name: currentMatch.first_name,
          age: calculateAge(currentMatch.birth_date),
          zodiac_sign: currentMatch.zodiac_sign,
          interests: currentMatch.interests,
          bio: currentMatch.bio
        },
        cosmicInsights,
        true // Force new generation
      );
      setAiStarters(starters);
    } catch (error) {
      console.error('Error regenerating starters:', error);
    } finally {
      setLoadingAI(false);
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

    // Trigger logo state for high compatibility
    const compatibility = Math.round(currentMatch.compatibility_score || 70);
    if (compatibility >= 85) {
      updateLogoState('highMatch');
    }

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
        // Trigger new match logo state
        updateLogoState('newMatch');
        createHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => {
          alert(`🎉 It's a match! You and ${currentMatch.first_name} both liked each other!`);
        }, 500);
      }
    } catch (error) {
      console.error('Error liking:', error);
    }

    setJustSwiped(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
      setCosmicInsights(null);
      setAiStarters([]);
      setShowAIStarters(false);
      setShowCosmicInsights(false);
      setShowDropdown(false);
      setTimeout(() => setJustSwiped(false), 1500);
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

    setJustSwiped(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
      setCosmicInsights(null);
      setAiStarters([]);
      setShowAIStarters(false);
      setShowCosmicInsights(false);
      setShowDropdown(false);
      setTimeout(() => setJustSwiped(false), 1500);
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

    setJustSwiped(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
      setCosmicInsights(null);
      setAiStarters([]);
      setShowAIStarters(false);
      setShowCosmicInsights(false);
      setShowDropdown(false);
      setTimeout(() => setJustSwiped(false), 1500);
    }, 300);
  };

  const handleBoost = async () => {
    if (!currentMatch) return;
    if ((user.profile_boosts || 0) <= 0) {
      alert('No boosts remaining! Spin the cosmic wheel or claim your daily streak to get more.');
      return;
    }
    
    // Visual effect
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      createStarburstEffect(x, y);
      createSparkleTrail(x, y);
    }
    
    try {
      // Use profile boost to increase visibility
      await axios.post(`${API}/users/use-boost`, { target_user_id: currentMatch.id });
      alert(`⚡ Boosted! Your profile will be shown to ${currentMatch.first_name} with higher priority.`);
    } catch (error) {
      console.error('Error using boost:', error);
      alert('Failed to use boost. Please try again.');
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
            {/* Logo removed */}
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
      <div className="bg-black flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Empty left space */}
          <div></div>
          
          {/* Messages icon on the right - Elegant design */}
          <button
            onClick={() => navigate('/messages')}
            className="relative group"
            title="Messages"
          >
            {/* Elegant container with gradient border */}
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group-hover:scale-105">
              <MessageCircle className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" />
              
              {/* Elegant notification badge */}
              {unreadCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-md opacity-60 animate-pulse" />
                  
                  {/* Badge */}
                  <div className="relative bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-red-400/50 shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                </div>
              )}
              
              {/* Subtle shine effect on hover */}
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center bg-gradient-to-b from-black via-black to-black pt-8 md:pt-12 px-4 pb-32 md:pb-20 relative overflow-hidden">
        {/* Background removed for clean interface */}
        
        <div className="w-full max-w-md relative flex flex-col space-y-4" style={{ zIndex: 10 }}>
          <div 
            className="w-full"
            style={{ 
              perspective: '1000px',
              height: showDropdown ? '78vh' : '62vh',
              maxHeight: showDropdown ? '720px' : '560px'
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
                height: showDropdown ? '80vh' : '62vh',
                maxHeight: showDropdown ? '750px' : '560px',
                transform: isDragging 
                  ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)` 
                  : swipeDirection ? undefined : 'translate(0, 0)',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                // Apply light effect ONLY if user has purchased and activated a light
                ...(userInventory?.active_light && (() => {
                  const activeLight = storeItems.find(item => item.id === userInventory.active_light);
                  if (activeLight?.effect) {
                    return LightEffectRenderer({ lightEffect: activeLight.effect });
                  }
                  return {};
                })())
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
                {/* Photo nav tap zones - Only cover photo area, not buttons */}
                {currentMatch.photos && currentMatch.photos.length > 1 && !showDropdown && (
                  <>
                    <div 
                      className="absolute left-0 top-0 w-1/3 z-20 cursor-pointer"
                      style={{ height: '70%' }}
                      onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                    />
                    <div 
                      className="absolute right-0 top-0 w-1/3 z-20 cursor-pointer"
                      style={{ height: '70%' }}
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
              <div className="absolute bottom-0 left-0 right-0 text-white z-30" style={{ pointerEvents: 'auto' }}>
                <div className={`bg-gradient-to-t from-black/70 via-black/40 to-transparent px-6 pb-6 pt-6 relative transition-all rounded-2xl ${showDropdown ? 'pb-1' : ''}`}>
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
                  {/* Connection Integrity Badge + Location */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 bg-[#F4F4F5] px-3 py-1.5 rounded-full border border-[#E4E4E7]">
                      <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span className="text-xs font-medium text-[#3F3F46]">
                        {currentMatch.trustScore || 0}% Verified
                      </span>
                    </div>
                    <span className="text-white/40">•</span>
                    <span className="text-sm text-white/80">
                      {getDistance(currentMatch) !== null ? `${getDistance(currentMatch)} miles away` : 'Location unavailable'}
                    </span>
                  </div>

                  {/* Merge Score + Show More toggle */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                      <Zap className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-sm font-medium">{compatibility}% Merge Score</span>
                    </div>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        handleShowMore(currentMatch, compatibility); 
                      }}
                      className="flex items-center gap-1 text-white/80 hover:text-white transition-colors touch-manipulation"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <span className="text-sm font-light">{showDropdown ? 'Show less' : 'Show more'}</span>
                      {showDropdown ? (<ChevronUp className="w-4 h-4" />) : (<ChevronDown className="w-4 h-4" />)}
                    </button>
                  </div>

                  {/* Cosmic Insights - Only visible when Show more is expanded */}
                  {showDropdown && (
                    <div className="mb-3">
                      {/* Cosmic Insights Button */}
                      <button
                        onClick={(e) => { 
                          e.stopPropagation();
                          handleCosmicInsightsToggle(currentMatch, compatibility); 
                        }}
                        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 transition-all touch-manipulation"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#2563EB]" />
                          <span className="text-sm font-medium text-white/90">Compatibility Insights</span>
                        </div>
                        {showCosmicInsights ? (<ChevronUp className="w-4 h-4 text-white/60" />) : (<ChevronDown className="w-4 h-4 text-white/60" />)}
                      </button>
                      
                      {/* Cosmic Insights Content - Expands DOWNWARD */}
                      <div 
                        className={`transition-all duration-300 ease-in-out overflow-y-auto ${
                          showCosmicInsights ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                        }`}
                        style={{
                          WebkitOverflowScrolling: 'touch',
                          overscrollBehavior: 'contain'
                        }}
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                      >
                        {cosmicInsights ? (
                          <div className="space-y-4">
                            {/* Compatibility Insights */}
                            <div className="bg-transparent rounded-xl p-4 border border-white/10 space-y-3">
                              <div className="flex items-start gap-2 text-white/90 text-sm">
                                <span className="text-base">🔥</span>
                                <p className="leading-relaxed">{cosmicInsights.elementalInsight}</p>
                              </div>
                              <div className="flex items-start gap-2 text-white/90 text-sm">
                                <span className="text-base">💫</span>
                                <p className="leading-relaxed">{cosmicInsights.compatibilityInsight}</p>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-white/10 rounded-full text-white/80">{cosmicInsights.element1}</span>
                                <span className="text-white/40">+</span>
                                <span className="px-2 py-1 bg-white/10 rounded-full text-white/80">{cosmicInsights.element2}</span>
                              </div>
                            </div>

                            {/* AI Conversation Starters */}
                            {showAIStarters && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-white/90 text-sm font-medium flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#2563EB]" />
                                    AI Conversation Starters
                                  </h3>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); regenerateStarters(); }}
                                    disabled={loadingAI}
                                    className="text-xs text-[#2563EB] hover:text-[#60a5fa] disabled:opacity-50"
                                    style={{ pointerEvents: 'auto' }}
                                  >
                                    {loadingAI ? 'Generating...' : 'Generate More'}
                                  </button>
                                </div>
                                
                                {loadingAI ? (
                                  <div className="flex items-center justify-center py-8 bg-transparent rounded-xl border border-white/10">
                                    <Sparkles className="w-6 h-6 text-[#2563EB] animate-spin" />
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {aiStarters.map((starter, index) => (
                                      <div
                                        key={index}
                                        className="bg-transparent border border-white/10 rounded-lg p-3 hover:bg-white/5 transition-all group"
                                      >
                                        <p className="text-white/90 text-sm mb-2 leading-relaxed">{starter}</p>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            trackStarterUsed(currentMatch.id, index, starter);
                                            navigate(`/chat/${currentMatch.id}`, { state: { messageText: starter } });
                                          }}
                                          className="text-xs text-[#2563EB] hover:text-[#60a5fa] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                          style={{ pointerEvents: 'auto' }}
                                        >
                                          <MessageCircle className="w-3 h-3" />
                                          Send This Message
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : loadingAI ? (
                          <div className="flex items-center justify-center py-8 bg-transparent rounded-xl border border-white/10">
                            <Sparkles className="w-6 h-6 text-[#2563EB] animate-spin" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Expandable Dropdown Content - Hidden when Cosmic Insights is expanded */}
                  <div 
                    className={`transition-all duration-300 ease-in-out ${showDropdown && !showCosmicInsights ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'}`}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onScroll={(e) => e.stopPropagation()}
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                      overflowY: showDropdown && !showCosmicInsights ? 'auto' : 'hidden',
                      overflowX: 'hidden',
                      pointerEvents: 'auto'
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
              className={`swipe-buttons-container w-full flex items-center justify-center gap-5 px-3 mt-2 z-50 fixed md:static left-0 right-0 ${justSwiped ? 'after-swipe' : ''}`}
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
                className="swipe-button undo rounded-full p-4 md:p-5 shadow-xl"
                title="Undo"
              >
                <RotateCcw className="w-6 h-6 md:w-7 md:h-7 text-white transition-all" strokeWidth={1.5} />
              </button>

              {/* Pass */}
              <button
                ref={passButtonRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createStardustTrail(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
                  handlePass();
                }}
                className="swipe-button pass rounded-full p-5 md:p-6 shadow-xl"
                title="Pass"
              >
                <X className="w-7 h-7 md:w-8 md:h-8 text-white transition-all" strokeWidth={1.5} />
              </button>

              {/* Like */}
              <button
                ref={likeButtonRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createFloatingHearts(rect.left + rect.width / 2, rect.top, 8);
                  handleLike();
                }}
                className={`swipe-button like rounded-full p-5 md:p-6 shadow-xl ${compatibility >= 85 ? 'high-compatibility' : ''}`}
                title="Like"
              >
                <Heart className="icon-heart w-7 h-7 md:w-8 md:h-8 text-white transition-all" strokeWidth={1.5} fill="none" />
              </button>

              {/* Super Like */}
              <button
                ref={superLikeButtonRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createStarburstEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
                  handleSuperLike();
                }}
                className={`swipe-button super rounded-full p-5 md:p-6 shadow-xl ${compatibility < 50 ? 'low-compatibility' : ''}`}
                title="Super Like"
              >
                <Star className="icon-star w-7 h-7 md:w-8 md:h-8 text-white transition-all" strokeWidth={1.5} fill="none" />
              </button>

              {/* Boost */}
              <button
                onClick={(e) => { 
                  const rect = e.currentTarget.getBoundingClientRect();
                  createSparkleTrail(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
                  handleBoost(); 
                }}
                className="swipe-button boost rounded-full p-4 md:p-5 shadow-xl"
                title="Boost Profile"
              >
                <Zap className="icon-boost w-6 h-6 md:w-7 md:h-7 text-white transition-all" strokeWidth={1.5} fill="none" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="home" navigate={navigate} />
      
      {/* Logo State Tester (Developer Tool) */}
      <LogoStateTester />
    </div>
  );
}
