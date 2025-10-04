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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-lg">Finding your cosmic matches...</p>
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="border-b border-white/10 bg-black">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <h1 className="text-3xl font-light text-white">A Sign</h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
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

  const age = calculateAge(currentMatch.birth_date);
  const compatibility = currentMatch.compatibility_score || Math.floor(Math.random() * 30) + 70;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-light text-white">A Sign</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-purple-400">
              <Star className="w-4 h-4" />
              <span className="text-sm">{user.zodiac_sign}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Card */}
      <div className="flex-1 flex items-center justify-center p-6 pb-32">
        <div className="w-full max-w-lg">
          <div 
            ref={cardRef}
            className={`relative bg-white/5 rounded-3xl overflow-hidden border border-white/10 transition-transform duration-300 ${
              swipeDirection === 'right' ? 'translate-x-[150%] rotate-12' : 
              swipeDirection === 'left' ? '-translate-x-[150%] -rotate-12' :
              swipeDirection === 'up' ? '-translate-y-[150%] scale-110' : ''
            }`}
            style={{ height: '70vh', maxHeight: '650px' }}
          >
            {/* Photo */}
            <div 
              className="absolute inset-0 bg-cover bg-center cursor-pointer"
              style={{ 
                backgroundImage: `url(${currentMatch.photos?.[currentPhotoIndex] || 'https://via.placeholder.com/400x600'})` 
              }}
              onClick={(e) => {
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
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-sm">{compatibility}% Compatible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 pb-4">
        <div className="max-w-lg mx-auto px-6">
          <div className="flex items-center justify-center gap-3">
            {/* Reverse Button */}
            <button
              onClick={handleUndo}
              disabled={swipeHistory.length === 0}
              className="bg-white/5 rounded-full p-3 hover:bg-white/10 transition-all border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
              title="Undo"
            >
              <RotateCcw className="w-5 h-5 text-yellow-400" />
            </button>

            {/* Pass Button */}
            <button
              ref={passButtonRef}
              onClick={handlePass}
              className="bg-white/5 rounded-full p-4 hover:bg-white/10 transition-all border border-white/10 hover:scale-110"
              title="Pass"
            >
              <X className="w-6 h-6 text-red-400" />
            </button>

            {/* Super Like Button */}
            <button
              ref={superLikeButtonRef}
              onClick={handleSuperLike}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3 hover:scale-110 transition-all shadow-xl"
              title="Super Like"
            >
              <Star className="w-5 h-5 text-white fill-white" />
            </button>

            {/* Like Button */}
            <button
              ref={likeButtonRef}
              onClick={handleLike}
              className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-full p-5 hover:scale-110 transition-all shadow-xl cosmic-glow"
              title="Like"
            >
              <Heart className="w-7 h-7 text-white fill-white" />
            </button>

            {/* Direct Message Button */}
            <button
              onClick={handleDirectMessage}
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 hover:bg-purple-600 transition-all shadow-xl hover:scale-110"
              title="Direct Message"
            >
              <MessageCircle className="w-5 h-5 text-white" />
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
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-around">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-2 transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate('/connections')}
          className={`flex flex-col items-center gap-2 transition-colors ${
            currentTab === 'connections' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs">Connections</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-2 transition-colors ${
            currentTab === 'profile' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
