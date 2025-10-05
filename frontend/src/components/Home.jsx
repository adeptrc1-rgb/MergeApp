import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, X, Star, Sparkles, Users, Home as HomeIcon, RotateCcw, MessageCircle, Zap } from 'lucide-react';
import { 
  createStarburstEffect, 
  createSparkleTrail, 
  createShootingStar,
  createHeartBurst,
  createFloatingSign,
  createMatchAnimation,
  createStardustTrail
} from '../utils/particleEffects';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  }, []);

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
    if (currentMatch?.photos && currentPhotoIndex < currentMatch.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
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
    
    // Prevent page scrolling during drag
    e.preventDefault();
    
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
            <h1 className="text-3xl font-light text-white">A Sign</h1>
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
      {/* Header */}
      <div className="border-b border-white/10 bg-black flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/asign-logo.png" alt="A Sign" className="h-10" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-purple-400">
              <Star className="w-4 h-4" />
              <span className="text-sm">{user.zodiac_sign}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Card */}
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
            className={`relative bg-white/5 rounded-3xl overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing w-full ${
              swipeDirection === 'right' ? 'animate-swipe-right' : 
              swipeDirection === 'left' ? 'animate-swipe-left' :
              swipeDirection === 'up' ? 'animate-swipe-up' : ''
            }`}
            style={{ 
              height: '65vh',
              maxHeight: '600px',
              transform: isDragging 
                ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)` 
                : 'translate(0, 0) rotate(0)',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
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
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${currentMatch.photos?.[currentPhotoIndex] || 'https://via.placeholder.com/400x600'})` 
              }}
              onClickCapture={(e) => {
                if (isDragging) {
                  e.preventDefault();
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width / 2) {
                  prevPhoto();
                } else {
                  nextPhoto();
                }
              }}
            >
              {/* Photo Navigation Dots */}
              {currentMatch.photos && currentMatch.photos.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
                  {currentMatch.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        idx === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
            </div>

            {/* Info Section */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-4xl font-light mb-2">
                {currentMatch.first_name}, {age}
              </h2>
              <div className="flex items-center gap-2 text-white/80 mb-3">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-base">{currentMatch.zodiac_sign}</span>
                <span className="text-white/40">•</span>
                <span className="text-sm">{ELEMENT_MAP[currentMatch.zodiac_sign]} Sign</span>
              </div>

              {/* Compatibility Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-sm font-medium">{compatibility}% Compatible</span>
              </div>
            </div>
          </div>

          {/* Cosmic Action Buttons Container */}
          <div className="w-full -mt-12 relative z-10">
            {/* Cosmic Background Panel */}
            <div className="relative mx-auto max-w-lg px-6 py-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-950 border border-purple-500/20 shadow-2xl overflow-hidden">
              {/* Constellation Stars Background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-12 right-12 w-1 h-1 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-8 left-16 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-20 left-24 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute bottom-12 right-20 w-1 h-1 bg-pink-300 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
              </div>

              {/* Typography */}
              <div className="text-center mb-6 relative z-10">
                <h3 className="text-white/90 text-sm font-light tracking-[0.2em] uppercase">
                  A Sign – Built Around Astrology
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-5 relative z-10">
                {/* Reverse Button - Crescent Moon */}
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    createStardustTrail(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
                    handleUndo();
                  }}
                  disabled={swipeHistory.length === 0}
                  className="cosmic-button w-[54px] h-[54px] rounded-full bg-gradient-to-br from-yellow-600/20 to-amber-700/20 backdrop-blur-sm border border-yellow-500/30 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 disabled:opacity-30 disabled:cursor-not-allowed relative group"
                  title="Undo"
                  style={{boxShadow: '0 0 20px rgba(251, 191, 36, 0.2), inset 0 0 20px rgba(251, 191, 36, 0.1)'}}
                >
                  <svg className="w-6 h-6 absolute inset-0 m-auto text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c2.5 0 4.8-0.9 6.5-2.5" strokeLinecap="round"/>
                    <path d="M19 15l-3-3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Pass Button - Shooting Stars X */}
                <button
                  ref={passButtonRef}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    createShootingStar(rect.left + rect.width / 2, rect.top + rect.height / 2, 'left');
                    handlePass();
                  }}
                  className="cosmic-button w-[60px] h-[60px] rounded-full bg-gradient-to-br from-slate-600/20 to-blue-900/20 backdrop-blur-sm border border-slate-400/30 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-400/20 hover:shadow-slate-400/40 relative group"
                  title="Pass"
                  style={{boxShadow: '0 0 20px rgba(148, 163, 184, 0.2), inset 0 0 20px rgba(148, 163, 184, 0.1)'}}
                >
                  <svg className="w-7 h-7 absolute inset-0 m-auto text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/>
                    <circle cx="6" cy="6" r="1" fill="currentColor"/>
                    <circle cx="18" cy="6" r="1" fill="currentColor"/>
                    <circle cx="6" cy="18" r="1" fill="currentColor"/>
                    <circle cx="18" cy="18" r="1" fill="currentColor"/>
                  </svg>
                </button>

                {/* Like Button - Gradient Heart (Largest) */}
                <button
                  ref={likeButtonRef}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    createStarburstEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
                    createSparkleTrail(rect.left + rect.width / 2, rect.top + rect.height / 2);
                    handleLike();
                  }}
                  className="cosmic-button w-[72px] h-[72px] rounded-full bg-gradient-to-br from-pink-500 to-purple-600 hover:scale-110 active:scale-95 transition-all shadow-2xl relative group"
                  title="Like"
                  style={{boxShadow: '0 0 30px rgba(236, 72, 153, 0.4), inset 0 0 30px rgba(236, 72, 153, 0.2)'}}
                >
                  <svg className="w-9 h-9 absolute inset-0 m-auto text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-xl"></div>
                </button>

                {/* Super Like Button - Radiant Star */}
                <button
                  ref={superLikeButtonRef}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    createStarburstEffect(rect.left + rect.width / 2, rect.top + rect.height / 2);
                    createHeartBurst(rect.left + rect.width / 2, rect.top);
                    handleSuperLike();
                  }}
                  className="cosmic-button w-[60px] h-[60px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 hover:scale-110 active:scale-95 transition-all shadow-2xl relative group"
                  title="Super Like"
                  style={{boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.2)'}}
                >
                  <svg className="w-7 h-7 absolute inset-0 m-auto text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <div className="absolute inset-0 rounded-full">
                    <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                    <div className="absolute top-1/2 right-0 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                  </div>
                </button>

                {/* Direct Message Button - Speech Bubble with Planet */}
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    createFloatingSign(e.currentTarget);
                    handleDirectMessage();
                  }}
                  className="cosmic-button w-[54px] h-[54px] rounded-full bg-gradient-to-br from-purple-600/20 to-violet-700/20 backdrop-blur-sm border border-purple-500/30 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 relative group"
                  title="Direct Message"
                  style={{boxShadow: '0 0 20px rgba(168, 85, 247, 0.2), inset 0 0 20px rgba(168, 85, 247, 0.1)'}}
                >
                  <svg className="w-6 h-6 absolute inset-0 m-auto text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="11" r="3" fill="none" strokeWidth="1.5"/>
                    <ellipse cx="12" cy="11" rx="5" ry="2" fill="none" strokeWidth="0.8"/>
                  </svg>
                </button>
              </div>
            </div>
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
