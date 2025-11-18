import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, X, Star, Sparkles, Users, Home as HomeIcon, RotateCcw, XCircle, ChevronDown, ChevronUp, Music, MessageCircle, Zap } from 'lucide-react';
import ConstellationIcon from './ConstellationIcon';
import BottomNav from './BottomNav';
import PremiumSkinRenderer from './PremiumSkinRenderer';
import VibePlayer from './VibePlayer';
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
import MergeLogo from './MergeLogo';
import CosmicStarfield from './CosmicStarfield';
import CompatibilityInsights from './CompatibilityInsights';
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
  
  // Merge Score breakdown modal state
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  
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

  // Handle "Show more" toggle for profile details
  const handleShowMore = () => {
    setShowDropdown(!showDropdown);
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
      console.log('[DEBUG] Loaded matches:', response.data);
      console.log('[DEBUG] First match has vibe_song:', response.data[0]?.vibe_song);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
      // Use mock data for testing when API fails
      const mockProfiles = [
        {
          id: 'mock-1',
          first_name: 'Luna',
          age: 28,
          zodiac_sign: 'Pisces',
          photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'],
          bio: 'Dreamer, artist, and stargazer. Looking for cosmic connections. I believe in the universe\'s timing and creating meaningful moments.',
          interests: ['Art', 'Music', 'Astrology', 'Photography', 'Painting', 'Stargazing'],
          industry: 'Creative Arts',
          job_title: 'Illustrator',
          location: 'Brooklyn, NY',
          compatibility_score: 89,
          current_location: { city: 'Brooklyn, NY' },
          education: { college: 'Rhode Island School of Design' },
          deal_breakers: { relationship_goals: 'long_term_relationship' },
          lifestyle_factors: {
            occupation: 'Creative Arts',
            fitness_health: 3,
            social_habits: 4,
            travel_frequency: 5
          },
          vibe_song: {
            title: 'Cosmic Girl',
            artist: 'Jamiroquai',
            preview_url: null
          }
        },
        {
          id: 'mock-2',
          first_name: 'Alex',
          age: 30,
          zodiac_sign: 'Leo',
          photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'],
          bio: 'Tech entrepreneur with a passion for innovation and adventure. Building products that make a difference. Always up for trying new restaurants and exploring hidden gems.',
          interests: ['Technology', 'Travel', 'Fitness', 'Coffee', 'Hiking', 'Startups'],
          industry: 'Technology',
          job_title: 'Founder',
          location: 'San Francisco, CA',
          compatibility_score: 92,
          current_location: { city: 'San Francisco, CA' },
          education: { college: 'Stanford University' },
          deal_breakers: { relationship_goals: 'serious_dating' },
          lifestyle_factors: {
            occupation: 'Technology',
            fitness_health: 5,
            social_habits: 4,
            travel_frequency: 5
          },
          vibe_song: {
            title: 'High Hopes',
            artist: 'Panic! At The Disco',
            preview_url: null
          }
        },
        {
          id: 'mock-3',
          first_name: 'Maya',
          age: 26,
          zodiac_sign: 'Scorpio',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80'],
          bio: 'Yoga instructor by day, poet by night. Seeking deep connections.',
          interests: ['Yoga', 'Writing', 'Nature', 'Meditation'],
          industry: 'Wellness',
          job_title: 'Yoga Instructor',
          location: 'Los Angeles, CA',
          compatibility_score: 85,
          vibe_song: {
            title: 'Breathe Me',
            artist: 'Sia',
            preview_url: null
          }
        },
        {
          id: 'mock-4',
          first_name: 'Jordan',
          age: 29,
          zodiac_sign: 'Gemini',
          photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80'],
          bio: 'Music producer and DJ. Let\'s vibe to good energy.',
          interests: ['Music', 'DJing', 'Concerts', 'Food'],
          industry: 'Entertainment',
          job_title: 'Music Producer',
          location: 'Austin, TX',
          compatibility_score: 78,
          vibe_song: {
            title: 'One More Time',
            artist: 'Daft Punk',
            preview_url: null
          }
        }
      ];
      console.log('[DEBUG] Using mock profiles for testing');
      setMatches(mockProfiles);
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
      <div className="flex-shrink-0" style={{ backgroundColor: '#000000' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Merge wordmark */}
          <MergeLogo size="md" color="#FAFAFA" />
          
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
      <div className="flex-1 flex flex-col items-center pt-8 md:pt-12 px-4 pb-32 md:pb-20 relative overflow-hidden" style={{ backgroundColor: '#000000' }}>
        {/* Pure Black background */}
        
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
              className={`relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 ${showDropdown ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} w-full transition-all duration-500 ${
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
              <div className="absolute bottom-0 left-0 right-0 z-30" style={{ pointerEvents: 'auto', color: '#FAFAFA' }}>
                <div className={`px-6 pb-6 pt-6 relative transition-all rounded-2xl ${showDropdown ? 'pb-1' : ''}`} style={{ background: 'linear-gradient(to top, #0A0A0A, rgba(10, 10, 10, 0.95), transparent)' }}>
                  <h2 className="text-4xl font-light mb-2" style={{ color: '#FAFAFA' }}>
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
                  
                  {/* Merge Score & Show More */}
                  <div className="mb-2 flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowScoreBreakdown(!showScoreBreakdown);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105"
                      style={{ 
                        backgroundColor: '#171717', 
                        border: '1px solid #404040',
                        boxShadow: compatibility >= 95 ? '0 0 15px #00FFFF, 0 0 30px rgba(0, 255, 255, 0.3)' :
                                   compatibility >= 85 ? '0 0 15px #8B5CF6, 0 0 30px rgba(139, 92, 246, 0.3)' :
                                   compatibility >= 75 ? '0 0 15px #3B82F6, 0 0 30px rgba(59, 130, 246, 0.3)' :
                                   'none'
                      }}
                    >
                      <Zap className="w-3.5 h-3.5" style={{ 
                        color: compatibility >= 95 ? '#00FFFF' :
                               compatibility >= 85 ? '#8B5CF6' :
                               compatibility >= 75 ? '#3B82F6' :
                               '#A3A3A3'
                      }} />
                      <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>
                        <span style={{ 
                          color: compatibility >= 95 ? '#00FFFF' :
                                 compatibility >= 85 ? '#8B5CF6' :
                                 compatibility >= 75 ? '#3B82F6' :
                                 '#A3A3A3'
                        }}>{compatibility}%</span> Merge Score
                      </span>
                    </button>
                    
                    {/* Show More toggle - right next to Merge Score */}
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        handleShowMore(); 
                      }}
                      className="flex items-center gap-1 transition-colors touch-manipulation"
                      style={{ color: '#A3A3A3', pointerEvents: 'auto' }}
                    >
                      <span className="text-sm font-light">{showDropdown ? 'Show less' : 'Show more'}</span>
                      {showDropdown ? (<ChevronUp className="w-4 h-4" />) : (<ChevronDown className="w-4 h-4" />)}
                    </button>
                  </div>

                  {/* Industry & Distance */}
                  <div className="mb-3 mt-3">
                    <span className="text-sm" style={{ color: '#A3A3A3' }}>
                      {currentMatch.lifestyle_factors?.occupation || 'Technology'} • {getDistance(currentMatch) !== null ? `${getDistance(currentMatch)} miles away` : '5 miles away'}
                    </span>
                  </div>

                  {/* Expandable Dropdown Content */}
                  <div 
                    className={`custom-scrollbar transition-all duration-300 ease-in-out ${showDropdown ? 'opacity-100' : 'max-h-0 opacity-0'}`}
                    onWheel={(e) => {
                      // Allow scrolling within this container
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      // Allow touch scrolling to start
                      e.stopPropagation();
                    }}
                    onTouchMove={(e) => {
                      // Allow touch scrolling
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      // Prevent card drag when interacting with scroll area
                      e.stopPropagation();
                    }}
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                      overflowY: showDropdown ? 'scroll' : 'hidden',
                      overflowX: 'hidden',
                      pointerEvents: showDropdown ? 'auto' : 'none',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(139, 92, 246, 0.6) rgba(255, 255, 255, 0.1)',
                      height: showDropdown ? '500px' : '0px',
                      maxHeight: '60vh',
                      touchAction: 'pan-y',
                      cursor: 'default'
                    }}
                  >
                    <div className="space-y-0 pt-2 pb-12">
                      {/* No data fallback */}
                      {!currentMatch.bio && !currentMatch.vibe_song && (!currentMatch.interests || currentMatch.interests.length === 0) && !currentMatch.deal_breakers?.relationship_goals && !currentMatch.lifestyle_factors && (
                        <div className="text-center py-4">
                          <p className="text-white/50 text-sm italic">No additional profile information available</p>
                        </div>
                      )}

                      {/* My Vibe - Song Player */}
                      {currentMatch?.vibe_song && (
                        <div className="py-4 border-b" style={{ borderColor: '#262626' }}>
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            My Vibe
                          </h3>
                          <VibePlayer song={currentMatch.vibe_song} />
                        </div>
                      )}

                      {/* Bio */}
                      {currentMatch.bio && (
                        <div className="py-4 border-b" style={{ borderColor: '#262626' }}>
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium mb-2">About</h3>
                          <p className="text-white/90 text-sm leading-relaxed">{currentMatch.bio}</p>
                        </div>
                      )}

                      {/* Background */}
                      {(currentMatch.current_location?.city || currentMatch.education?.college || currentMatch.education?.school || currentMatch.education) && (
                        <div className="py-4 border-b" style={{ borderColor: '#262626' }}>
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium mb-2">Background</h3>
                          <div className="space-y-1.5">
                            {currentMatch.current_location?.city && (
                              <div className="flex items-start gap-2">
                                <span className="text-white/60 text-sm font-medium" style={{ minWidth: '90px' }}>From:</span>
                                <span className="text-white/90 text-sm flex-1">{currentMatch.current_location.city}</span>
                              </div>
                            )}
                            {(currentMatch.education?.college || currentMatch.education?.school || (typeof currentMatch.education === 'string' && currentMatch.education)) && (
                              <div className="flex items-start gap-2">
                                <span className="text-white/60 text-sm font-medium" style={{ minWidth: '90px' }}>Education:</span>
                                <span className="text-white/90 text-sm flex-1">
                                  {currentMatch.education?.college || currentMatch.education?.school || currentMatch.education}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Interests */}
                      {currentMatch.interests && currentMatch.interests.length > 0 && (
                        <div className="py-4 border-b" style={{ borderColor: '#262626' }}>
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium mb-2">Interests</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentMatch.interests.map((interest, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white/90">{interest}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Relationship Goals */}
                      {currentMatch.deal_breakers?.relationship_goals && (
                        <div className="py-4 border-b" style={{ borderColor: '#262626' }}>
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium mb-2">Looking For</h3>
                          <p className="text-white/90 text-sm">{currentMatch.deal_breakers.relationship_goals.replace(/_/g, ' ')}</p>
                        </div>
                      )}

                      {/* Lifestyle */}
                      {currentMatch.lifestyle_factors && (
                        <div className="py-4 border-b" style={{ borderColor: '#262626' }}>
                          <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium mb-2">Lifestyle</h3>
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

                      {/* AI Compatibility Insights */}
                      <div className="py-4" style={{ backgroundColor: '#1F1F1F', borderRadius: '8px', marginTop: '8px' }}>
                        <CompatibilityInsights
                          currentUserId={user.id}
                          otherUserId={currentMatch.id}
                          context="profile_view"
                          depth="standard"
                        />
                      </div>
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

      {/* Merge Score Breakdown Modal */}
      {showScoreBreakdown && currentMatch && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          onClick={() => setShowScoreBreakdown(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-2xl p-6 animate-fade-in-up"
            style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowScoreBreakdown(false)}
              className="absolute top-4 right-4 transition-opacity hover:opacity-70"
              style={{ color: '#A3A3A3' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-1" style={{ 
                color: compatibility >= 95 ? '#00FFFF' :
                       compatibility >= 85 ? '#8B5CF6' :
                       compatibility >= 75 ? '#3B82F6' :
                       '#FAFAFA'
              }}>
                Merge Score: {compatibility}%
              </h2>
              <p className="text-sm" style={{ color: '#A3A3A3' }}>Why you mesh</p>
            </div>

            {/* Breakdown */}
            <div className="space-y-4 mb-6">
              {/* Lifestyle Sync */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                    <span className="text-xs" style={{ color: '#FAFAFA' }}>✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>Lifestyle Sync</span>
                    <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>88%</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#A3A3A3' }}>
                    {currentMatch.interests ? `You both enjoy ${currentMatch.interests.slice(0, 2).join(', ')}` : 'Shared interests create connection'}
                  </p>
                </div>
              </div>

              {/* Conversation Flow */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                    <span className="text-xs" style={{ color: '#FAFAFA' }}>✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>Conversation Flow</span>
                    <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>90%</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#A3A3A3' }}>
                    Your communication styles complement each other
                  </p>
                </div>
              </div>

              {/* Emotional Rhythm */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                    <span className="text-xs" style={{ color: '#FAFAFA' }}>✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>Emotional Rhythm</span>
                    <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>95%</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#A3A3A3' }}>
                    Natural emotional understanding and connection
                  </p>
                </div>
              </div>

              {/* Future Alignment */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                    <span className="text-xs" style={{ color: '#FAFAFA' }}>✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: '#FAFAFA' }}>Future Alignment</span>
                    <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>95%</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#A3A3A3' }}>
                    {currentMatch.relationship_goal || 'You\'re both looking for meaningful connections'}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Level Footer */}
            <div className="pt-4" style={{ borderTop: '1px solid #404040' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#A3A3A3' }}>Trust Level</span>
                <span className="text-sm font-medium" style={{ 
                  color: (currentMatch.trustScore || 0) >= 90 ? '#3B82F6' : 
                         (currentMatch.trustScore || 0) >= 75 ? '#F59E0B' : 
                         '#A3A3A3'
                }}>
                  {
                    (currentMatch.trustScore || 0) >= 90 ? 'Reliable' :
                    (currentMatch.trustScore || 0) >= 75 ? 'Solid' :
                    'Building Trust'
                  } ({currentMatch.trustScore || 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
