import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, X, Star, Sparkles, Users, Home as HomeIcon, RotateCcw, MessageCircle, Zap, XCircle, ChevronDown, ChevronUp, Music, Info, UserCircle } from 'lucide-react';
import ConstellationIcon from './ConstellationIcon';
import { 
  createStarburstEffect, 
  createSparkleTrail, 
  createShootingStar,
  createHeartBurst,
  createFloatingSign,
  createMatchAnimation,
  createStardustTrail
} from '../utils/particleEffects';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

axios.defaults.withCredentials = true;

// Element compatibility
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
  }, []);

  // Add touch event listener with passive: false to allow preventDefault
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchMove = (e) => {
      if (isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStart.x;
        const deltaY = touch.clientY - dragStart.y;
        
        // Prevent scrolling if actually dragging
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
    setShowDropdown(false); // Close dropdown on swipe
    
    // Create starburst and sparkle trail animation
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
        // Create match animation
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
    
    // Check if user has super likes available
    if ((user.super_likes || 0) <= 0) {
      alert('No super likes remaining!');
      return;
    }
    
    setSwipeDirection('up');
    setShowDropdown(false); // Close dropdown on swipe
    
    // Create star burst effect from center going up
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
    setShowDropdown(false); // Close dropdown on swipe
    
    // Create shooting star animation
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
    
    // Check if user has direct messages available
    if ((user.direct_messages || 0) <= 0) {
      alert('No direct messages remaining! Spin the cosmic wheel or match with someone to get more.');
      return;
    }
    
    // Create floating sign animation
    if (likeButtonRef.current) {
      createFloatingSign(likeButtonRef.current);
    }
    
    try {
      // Create a direct message match (bypasses mutual like requirement)
      const response = await axios.post(`${API}/users/direct-message/${currentMatch.id}`);
      
      if (response.data.success) {
        // Decrement DM count
        await axios.post(`${API}/users/use-direct-message`);
        
        // Navigate to chat
        navigate(`/chat/${response.data.match_id}`);
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
      // Loop back to first photo when reaching the end
      setCurrentPhotoIndex((currentPhotoIndex + 1) % currentMatch.photos.length);
    }
  };

  const prevPhoto = () => {
    if (currentMatch?.photos && currentMatch.photos.length > 0) {
      // Loop to last photo when going back from first
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
    
    // Check for super like (swipe up)
    if (dragOffset.y < superLikeThreshold && Math.abs(dragOffset.x) < 100) {
      handleSuperLike();
    }
    // Check for like (swipe right)
    else if (dragOffset.x > swipeThreshold) {
      handleLike();
    }
    // Check for pass (swipe left)
    else if (dragOffset.x < -swipeThreshold) {
      handlePass();
    }
    
    // Reset drag offset
    setDragOffset({ x: 0, y: 0 });
  };

  const getRotation = () => {
    return dragOffset.x / 20; // Convert horizontal drag to rotation
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

  // Calculate distance between two locations using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance); // Return distance in miles, rounded
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          {todayHoroscope ? (
            <button 
              onClick={() => setShowHoroscopeModal(true)}
              className="hover:scale-110 transition-transform cursor-pointer"
              title="View today's horoscope"
            >
              <ConstellationIcon sign={todayHoroscope.constellation} className="w-10 h-10" />
            </button>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-purple-400">
              <Star className="w-4 h-4" />
              <span className="text-sm">{user.zodiac_sign}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Card with 3D Flip */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-32 overflow-hidden">
        <div className="w-full max-w-md relative flex flex-col items-center">
          <div 
            ref={cardRef}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            className={`relative bg-white/5 rounded-3xl border border-white/10 cursor-grab active:cursor-grabbing w-full transition-all duration-500 ${
              swipeDirection === 'right' ? 'translate-x-full rotate-12' :
              swipeDirection === 'left' ? '-translate-x-full -rotate-12' :
              swipeDirection === 'up' ? '-translate-y-full scale-110' :
              ''
            }`}
            style={{
              height: showDropdown ? '75vh' : '65vh',
              maxHeight: showDropdown ? '700px' : '600px',
              transform: isDragging 
                ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)` 
                : swipeDirection ? undefined : 'translate(0, 0)',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out, height 0.3s ease-out, max-height 0.3s ease-out',
              overflow: showDropdown ? 'auto' : 'hidden'
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

            {/* Photo Section */}
            <div 
              className="relative bg-cover bg-center flex-shrink-0"
              style={{ 
                backgroundImage: `url(${currentMatch.photos?.[currentPhotoIndex] || 'https://via.placeholder.com/400x600'})`,
                height: showDropdown ? '50vh' : '100%',
                maxHeight: showDropdown ? '400px' : '100%',
                transition: 'height 0.3s ease-out, max-height 0.3s ease-out'
              }}
            >
              {/* Photo Navigation Tap Zones */}
              {currentMatch.photos && currentMatch.photos.length > 1 && (
                <>
                  {/* Left tap zone - previous photo */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                    }}
                  />
                  
                  {/* Right tap zone - next photo */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                    }}
                  />
                </>
              )}

              {/* Photo Navigation Dots */}
              {currentMatch.photos && currentMatch.photos.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4 z-10 pointer-events-none">
                  {currentMatch.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        idx === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Tap indicator - shows briefly when tapping */}
              {currentMatch.photos && currentMatch.photos.length > 1 && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />
            </div>

            {/* Profile Info Bar with Dropdown */}
            <div className={`flex-shrink-0 text-white bg-gradient-to-b from-black/95 to-black`}>
              <div className="p-6 relative">

                <h2 className="text-4xl font-light mb-2">
                  {currentMatch.first_name}, {age}
                </h2>
                <div className="flex items-center gap-2 text-white/80 mb-3">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="text-base">{currentMatch.zodiac_sign}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-sm">
                    {getDistance(currentMatch) !== null 
                      ? `${getDistance(currentMatch)} miles away` 
                      : 'Location unavailable'}
                  </span>
                </div>

                {/* Compatibility Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-sm font-medium">{compatibility}% Compatible</span>
                  </div>
                  
                  {/* Dropdown Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(!showDropdown);
                    }}
                    className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
                  >
                    <span className="text-sm font-light">
                      {showDropdown ? 'Show less' : 'Show more'}
                    </span>
                    {showDropdown ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expandable Dropdown Content */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    showDropdown ? 'opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="space-y-4 pt-2 pb-4">
                    {/* Check if any data exists */}
                    {!currentMatch.bio && 
                     (!currentMatch.interests || currentMatch.interests.length === 0) && 
                     !currentMatch.deal_breakers?.relationship_goals && 
                     !currentMatch.lifestyle_factors && 
                     !currentMatch.preferences?.music && (
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
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white/90"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Relationship Goals */}
                    {currentMatch.deal_breakers?.relationship_goals && (
                      <div className="space-y-2">
                        <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          Looking For
                        </h3>
                        <p className="text-white/90 text-sm capitalize">
                          {currentMatch.deal_breakers.relationship_goals.replace(/_/g, ' ')}
                        </p>
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

                    {/* Music Preferences */}
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

          {/* Action Buttons - Overlapping card, tucked under compatibility score */}
          <div className={`w-full -mt-8 flex items-center justify-center gap-6 px-4 relative z-10 transition-all duration-300 ${
            showDropdown ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            {/* Reverse Button */}
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

            {/* Pass Button */}
            <button
              ref={passButtonRef}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                createShootingStar(rect.left + rect.width / 2, rect.top + rect.height / 2, 'left');
                handlePass();
              }}
              className="bg-white/10 backdrop-blur-md rounded-full p-4 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl border border-white/20 hover:shadow-red-500/50"
              title="Pass"
            >
              <X className="w-7 h-7 text-red-500" />
            </button>

            {/* Like Button (Swapped with Super Like, now in center) */}
            <button
              ref={likeButtonRef}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                createStarburstEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
                createSparkleTrail(rect.left + rect.width / 2, rect.top + rect.height / 2);
                handleLike();
              }}
              className="bg-white/10 backdrop-blur-md rounded-full p-5 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl border border-white/20 hover:shadow-pink-500/50"
              title="Like"
            >
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
            </button>

            {/* Super Like Button (Swapped with Like) */}
            <button
              ref={superLikeButtonRef}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                createStarburstEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
                createHeartBurst(rect.left + rect.width / 2, rect.top);
                handleSuperLike();
              }}
              className="bg-white/10 backdrop-blur-md rounded-full p-4 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl border border-white/20 hover:shadow-blue-500/50"
              title="Super Like"
            >
              <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
            </button>

            {/* Direct Message Button */}
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                createFloatingSign(e.currentTarget);
                handleDirectMessage();
              }}
              className="bg-white/10 backdrop-blur-md rounded-full p-3.5 hover:bg-white/20 active:scale-95 transition-all shadow-xl hover:scale-110 border border-white/20 hover:shadow-purple-500/50"
              title="Direct Message"
            >
              <MessageCircle className="w-5 h-5 text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="home" navigate={navigate} />
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ currentTab, navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-around">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate('/discover')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'discover' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs">Discover</span>
        </button>
        <button
          onClick={() => navigate('/messages')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'messages' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">Messages</span>
        </button>
        <button
          onClick={() => navigate('/connections')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'connections' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-xs">Connect</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'profile' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
