import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Heart, X, Info, MapPin, Briefcase, Sparkles, MessageCircle, Star, Zap, Moon, Sun } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

// Astrology Icebreakers
const ASTRO_ICEBREAKERS = {
  'Aries': ['What adventure are you planning next?', 'Gym or outdoor workout?'],
  'Taurus': ['Favorite comfort food?', 'Netflix or a nice dinner out?'],
  'Gemini': ['What are you reading right now?', 'Deep conversation or fun banter?'],
  'Cancer': ['Ideal cozy night in?', 'How do you show you care?'],
  'Leo': ['What makes you feel most confident?', 'Karaoke song of choice?'],
  'Virgo': ['What is your morning routine?', 'Organization tips?'],
  'Libra': ['Art museum or music festival?', 'How do you find balance?'],
  'Scorpio': ['What is your deepest passion?', 'Mystery novel or thriller?'],
  'Sagittarius': ['Dream travel destination?', 'Philosophy or stand-up comedy?'],
  'Capricorn': ['Biggest goal right now?', 'Work hard, play hard?'],
  'Aquarius': ['Most unique interest?', 'Change the world how?'],
  'Pisces': ['Favorite way to daydream?', 'Ocean or mountains?']
};

// Compatibility insights
const getCompatibilityInsight = (sign1, sign2, percentage) => {
  if (percentage >= 80) return `🔥 ${sign1} and ${sign2} have incredible chemistry!`;
  if (percentage >= 70) return `✨ ${sign1} and ${sign2} make a great match!`;
  if (percentage >= 60) return `💫 ${sign1} and ${sign2} complement each other well!`;
  return `🌟 ${sign1} and ${sign2} could be an interesting pair!`;
};

// Element compatibility
const ELEMENT_MAP = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
};

export default function AstroMatchDashboard({ user, logout }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dailyHoroscope, setDailyHoroscope] = useState(null);

  useEffect(() => {
    loadMatches();
    loadDailyHoroscope();
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

  const loadDailyHoroscope = async () => {
    try {
      const response = await axios.get(`${API}/astrology/daily-horoscope/${user.zodiac_sign}`);
      setDailyHoroscope(response.data);
    } catch (error) {
      console.error('Error loading horoscope:', error);
    }
  };

  const currentMatch = matches[currentIndex];

  const handleLike = async () => {
    if (!currentMatch) return;
    setSwipeDirection('right');
    
    try {
      await axios.post(`${API}/users/like/${currentMatch.id}`);
      // Check for mutual match
      const matchResponse = await axios.get(`${API}/users/check-match/${currentMatch.id}`);
      if (matchResponse.data.is_match) {
        // Show match notification
        alert(`🎉 It's a match! You and ${currentMatch.first_name} both liked each other!`);
      }
    } catch (error) {
      console.error('Error liking:', error);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
      setShowIcebreakers(false);
      setCurrentIndex(currentIndex + 1);
    }, 300);
  };

  const handlePass = async () => {
    if (!currentMatch) return;
    setSwipeDirection('left');

    try {
      await axios.post(`${API}/users/pass/${currentMatch.id}`);
    } catch (error) {
      console.error('Error passing:', error);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
      setShowIcebreakers(false);
      setCurrentIndex(currentIndex + 1);
    }, 300);
  };

  const handleDragStart = (e) => {
    setDragStart(e.clientX || e.touches?.[0]?.clientX);
  };

  const handleDragMove = (e) => {
    if (dragStart === null) return;
    const currentX = e.clientX || e.touches?.[0]?.clientX;
    const diff = currentX - dragStart;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handlePass();
      }
    }
    setDragStart(null);
    setDragOffset(0);
  };

  const photos = currentMatch?.profile_photos 
    ? [currentMatch.profile_photos.face_photo, currentMatch.profile_photos.body_photo, currentMatch.profile_photos.lifestyle_photo].filter(Boolean)
    : [];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">✨</div>
          <p className="text-white text-lg">Reading the stars...</p>
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="text-3xl font-bold text-white mb-4">You've seen everyone!</h2>
          <p className="text-purple-200 mb-6">Check back later for more cosmic connections</p>
          <Button 
            onClick={() => navigate('/feed')} 
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
          >
            View Daily Star Feed
          </Button>
        </div>
      </div>
    );
  }

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

  const age = calculateAge(currentMatch.birth_date);
  const compatibility = currentMatch.compatibility_score || Math.floor(Math.random() * 30) + 70;
  const userElement = ELEMENT_MAP[user.zodiac_sign];
  const matchElement = ELEMENT_MAP[currentMatch.zodiac_sign];
  const compatibilityInsight = getCompatibilityInsight(user.zodiac_sign, currentMatch.zodiac_sign, compatibility);
  const icebreakers = ASTRO_ICEBREAKERS[currentMatch.zodiac_sign] || ['Tell me about yourself', 'What are you looking for?'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              A Sign
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span className="text-sm font-medium">{user.zodiac_sign}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/feed')}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className="text-white/80 hover:text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={logout}
              className="text-sm text-white/60 hover:text-white font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Daily Horoscope Banner */}
      {dailyHoroscope && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 py-2 text-center">
            <p className="text-white text-sm">
              <Star className="inline w-3 h-3 mr-1" />
              Today's vibe: {dailyHoroscope.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="pt-28 pb-24 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md relative">
          {/* Profile Card */}
          <div
            className={`relative bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-500/30 transition-all duration-300 ${
              swipeDirection === 'right' ? 'translate-x-[150%] rotate-12 opacity-0' :
              swipeDirection === 'left' ? '-translate-x-[150%] -rotate-12 opacity-0' : ''
            }`}
            style={{
              transform: dragOffset !== 0 ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)` : '',
              transition: dragStart === null ? 'transform 0.3s ease-out' : 'none'
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* Photo Section */}
            <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-900 to-pink-900">
              {photos.length > 0 && (
                <img 
                  src={photos[currentPhotoIndex]} 
                  alt={currentMatch.first_name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Photo Navigation */}
              <div className="absolute inset-0 flex">
                <button onClick={prevPhoto} className="flex-1 cursor-w-resize" disabled={photos.length <= 1} />
                <button onClick={nextPhoto} className="flex-1 cursor-e-resize" disabled={photos.length <= 1} />
              </div>

              {/* Photo Indicators */}
              {photos.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
                  {photos.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        idx === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Astro Compatibility Badge */}
              <div className="absolute top-6 right-4 space-y-2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  {compatibility}% Match
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {matchElement} Sign
                </div>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <h2 className="text-3xl font-bold mb-1 flex items-center gap-2">
                      {currentMatch.first_name} {currentMatch.last_name?.charAt(0)}.
                      <span className="text-2xl">{currentMatch.zodiac_sign === 'Aries' ? '♈' : 
                                                     currentMatch.zodiac_sign === 'Taurus' ? '♉' :
                                                     currentMatch.zodiac_sign === 'Gemini' ? '♊' :
                                                     currentMatch.zodiac_sign === 'Cancer' ? '♋' :
                                                     currentMatch.zodiac_sign === 'Leo' ? '♌' :
                                                     currentMatch.zodiac_sign === 'Virgo' ? '♍' :
                                                     currentMatch.zodiac_sign === 'Libra' ? '♎' :
                                                     currentMatch.zodiac_sign === 'Scorpio' ? '♏' :
                                                     currentMatch.zodiac_sign === 'Sagittarius' ? '♐' :
                                                     currentMatch.zodiac_sign === 'Capricorn' ? '♑' :
                                                     currentMatch.zodiac_sign === 'Aquarius' ? '♒' : '♓'}</span>
                    </h2>
                    <div className="flex items-center gap-2 text-lg mb-2">
                      <span>{age}</span>
                      <span>•</span>
                      <span>{currentMatch.zodiac_sign}</span>
                    </div>
                    <div className="text-sm text-purple-200 mb-2">
                      {compatibilityInsight}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowIcebreakers(!showIcebreakers)}
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                  >
                    <Sparkles className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {currentMatch.current_location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{currentMatch.current_location.city}</span>
                    </div>
                  )}
                  {currentMatch.industry && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{currentMatch.industry}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Icebreakers Panel */}
            {showIcebreakers && (
              <div className="p-6 bg-gradient-to-br from-purple-900 to-pink-900 border-t-2 border-purple-500/30">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Cosmic Conversation Starters
                </h3>
                <div className="space-y-2">
                  {icebreakers.map((question, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white text-sm hover:bg-white/20 transition-all border border-white/20"
                    >
                      "{question}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Details Panel */}
            {showDetails && (
              <div className="p-6 max-h-64 overflow-y-auto bg-gradient-to-br from-purple-900 to-pink-900 border-t-2 border-purple-500/30">
                {currentMatch.bio && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-white mb-2">About</h3>
                    <p className="text-purple-100">{currentMatch.bio}</p>
                  </div>
                )}

                {currentMatch.interests && currentMatch.interests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-white mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.interests.map((interest, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-100 rounded-full text-sm border border-purple-400/30"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Swipe Direction Indicators */}
          {dragOffset > 50 && (
            <div className="absolute top-1/3 left-8 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl shadow-2xl rotate-12">
              LIKE ✨
            </div>
          )}
          {dragOffset < -50 && (
            <div className="absolute top-1/3 right-8 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl shadow-2xl -rotate-12">
              PASS 💫
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md border-t border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-6">
            {/* Pass Button */}
            <button
              onClick={handlePass}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white border-2 border-red-500/50 hover:border-red-500 transition-all shadow-lg hover:shadow-xl hover:shadow-red-500/20 active:scale-95 flex items-center justify-center"
            >
              <X className="w-8 h-8" strokeWidth={2.5} />
            </button>

            {/* Super Like / Icebreaker */}
            <button
              onClick={() => setShowIcebreakers(!showIcebreakers)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6" />
            </button>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white transition-all shadow-lg hover:shadow-2xl hover:shadow-pink-500/40 active:scale-95 flex items-center justify-center"
            >
              <Heart className="w-9 h-9" fill="white" strokeWidth={2} />
            </button>

            {/* Info Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white border-2 border-purple-500/50 hover:border-purple-500 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/20 active:scale-95 flex items-center justify-center"
            >
              <Info className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}