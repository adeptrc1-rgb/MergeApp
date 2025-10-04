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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-light text-white">A Sign</h1>
            <button className="text-white/60 hover:text-white">
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-4xl font-light text-white mb-6">Discover</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveFilter('compatible')}
              className={`px-6 py-2 rounded-full text-sm transition-all ${
                activeFilter === 'compatible'
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
              }`}
            >
              Compatible Today
            </button>
            <button
              onClick={() => setActiveFilter('trending')}
              className={`px-6 py-2 rounded-full text-sm transition-all ${
                activeFilter === 'trending'
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
              }`}
            >
              Trending Energies
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {matches.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">✨</div>
              <h3 className="text-2xl font-light text-white mb-3">No matches yet</h3>
              <p className="text-white/40">Check back later for more cosmic connections</p>
            </div>
          ) : (
            <div className="space-y-6">
              {matches.map((match) => {
                const age = calculateAge(match.birth_date);
                const compatibility = match.compatibility_score || Math.floor(Math.random() * 30) + 70;
                
                return (
                  <div
                    key={match.id}
                    onClick={() => handleProfileClick(match)}
                    className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    {/* Profile Photo */}
                    <div
                      className="w-24 h-24 rounded-2xl bg-cover bg-center flex-shrink-0"
                      style={{
                        backgroundImage: `url(${match.photos?.[0] || 'https://via.placeholder.com/200'})`
                      }}
                    />

                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-light text-white mb-1">
                        {match.first_name} {match.last_name || 'Owens'}
                      </h3>
                      <div className="flex items-center gap-3 text-white/60 text-sm">
                        <span>{compatibility}% Vibe Score</span>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="text-white/40 group-hover:text-white/60 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-around">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Home className="w-5 h-5" />
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
