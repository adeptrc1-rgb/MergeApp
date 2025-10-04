import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Heart, X, Info, MapPin, Briefcase, Sparkles, Star, Zap, RotateCcw, Home, Users } from 'lucide-react';

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

// Element compatibility
const ELEMENT_MAP = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
};

export default function Discover({ user }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('compatible'); // 'compatible' or 'trending'

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

  const handleProfileClick = (match) => {
    // Navigate to detailed profile view or handle interaction
    console.log('Profile clicked:', match);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Finding your cosmic matches...</p>
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              A Sign
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🌟</div>
            <h2 className="text-3xl font-bold text-white mb-4">You've seen everyone!</h2>
            <p className="text-purple-200 mb-6">Check back later for more cosmic connections</p>
            <Button 
              onClick={() => navigate('/connections')} 
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
            >
              View Your Connections
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav currentTab="discover" navigate={navigate} />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
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
              onClick={handleUndo}
              disabled={swipeHistory.length === 0}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-30"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-24">
        <div className="w-full max-w-md">
          {/* Profile Card */}
          <div 
            className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-transform duration-300 ${
              swipeDirection === 'right' ? 'translate-x-[150%] rotate-12' : 
              swipeDirection === 'left' ? '-translate-x-[150%] -rotate-12' : ''
            }`}
            style={{ height: '600px' }}
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
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            </div>

            {/* Info Section */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <h2 className="text-4xl font-bold mb-1">
                    {currentMatch.first_name}, {age}
                  </h2>
                  <div className="flex items-center gap-2 text-white/90 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{currentMatch.zodiac_sign}</span>
                    <span className="text-white/60">•</span>
                    <span>{ELEMENT_MAP[currentMatch.zodiac_sign]} Sign</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className="bg-white/20 backdrop-blur-md rounded-full p-3 hover:bg-white/30 transition-colors"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Compatibility Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/30 to-purple-500/30 backdrop-blur-md px-4 py-2 rounded-full mb-3">
                <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{compatibility}% Compatible</span>
              </div>

              {/* Quick Info */}
              {!showDetails && (
                <div className="space-y-2">
                  {currentMatch.current_location && (
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{currentMatch.current_location.city}</span>
                    </div>
                  )}
                  {currentMatch.industry && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{currentMatch.industry}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Info */}
              {showDetails && (
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 mt-3 space-y-3 max-h-64 overflow-y-auto">
                  <div>
                    <h4 className="font-semibold text-sm text-white/60 mb-1">About</h4>
                    <p className="text-sm">{currentMatch.bio || 'No bio yet'}</p>
                  </div>
                  {currentMatch.interests && currentMatch.interests.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-white/60 mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentMatch.interests.map((interest, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              onClick={handlePass}
              className="bg-white/10 backdrop-blur-md rounded-full p-5 hover:bg-white/20 transition-all hover:scale-110 border border-white/20"
            >
              <X className="w-8 h-8 text-red-400" />
            </button>
            <button
              onClick={handleLike}
              className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-full p-6 hover:scale-110 transition-all shadow-xl"
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="discover" navigate={navigate} />
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ currentTab, navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
        <button
          onClick={() => navigate('/discover')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'discover' ? 'text-pink-400' : 'text-white/60 hover:text-white'
          }`}
        >
          <Sparkles className={`w-6 h-6 ${currentTab === 'discover' ? 'fill-pink-400' : ''}`} />
          <span className="text-xs font-medium">Discover</span>
        </button>
        <button
          onClick={() => navigate('/connections')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'connections' ? 'text-pink-400' : 'text-white/60 hover:text-white'
          }`}
        >
          <Users className={`w-6 h-6 ${currentTab === 'connections' ? 'fill-pink-400' : ''}`} />
          <span className="text-xs font-medium">Connections</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'profile' ? 'text-pink-400' : 'text-white/60 hover:text-white'
          }`}
        >
          <Home className={`w-6 h-6 ${currentTab === 'profile' ? 'fill-pink-400' : ''}`} />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}
