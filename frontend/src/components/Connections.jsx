import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Heart, MessageCircle, Star, MapPin, Sparkles, Users, Home, Zap } from 'lucide-react';

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

export default function Connections({ user }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' or 'likes'
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    loadMatches();
    loadLikes();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
    setLoading(false);
  };

  const loadLikes = async () => {
    try {
      // This would be a new endpoint to get users who liked you
      const response = await axios.get(`${API}/users/liked-me`);
      setLikes(response.data);
    } catch (error) {
      console.error('Error loading likes:', error);
      setLikes([]); // Set empty array if endpoint doesn't exist yet
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

  const openChat = (matchId) => {
    navigate(`/chat/${matchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-lg">Loading your connections...</p>
        </div>
      </div>
    );
  }

  // Energy levels for display
  const getEnergyLevel = (match) => {
    const score = match.compatibility_score || 70;
    if (score >= 85) return { text: 'High energy today', color: 'text-green-400' };
    if (score >= 70) return { text: 'Medium', color: 'text-yellow-400' };
    if (score >= 60) return { text: 'Meoum energy', color: 'text-orange-400' };
    return { text: 'Low energy', color: 'text-red-400' };
  };

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
          <h2 className="text-4xl font-light text-white mb-6">Connections</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-2 rounded-full text-sm transition-all ${
                activeTab === 'matches'
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
              }`}
            >
              Matches
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-6 py-2 rounded-full text-sm transition-all ${
                activeTab === 'likes'
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
              }`}
            >
              Likes You
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {activeTab === 'matches' ? (
            // Matches Tab
            matches.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">💫</div>
                <h3 className="text-2xl font-light text-white mb-3">No matches yet</h3>
                <p className="text-white/40 mb-8">
                  Start swiping to find your cosmic connections
                </p>
                <button
                  onClick={() => navigate('/home')}
                  className="px-8 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all font-medium"
                >
                  Start Swiping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((match) => {
                  const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
                  const energy = getEnergyLevel(match);
                  
                  return (
                    <div
                      key={match.id}
                      onClick={() => openChat(match.id)}
                      className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                    >
                      {/* Profile Photo */}
                      <div
                        className="w-20 h-20 rounded-2xl bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: `url(${otherUser.photos?.[0] || 'https://via.placeholder.com/200'})`
                        }}
                      />

                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-light text-white mb-1">
                          {otherUser.first_name} {otherUser.last_name || 'Owens'}
                        </h3>
                        <p className={`text-sm ${energy.color}`}>
                          {energy.text}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <div className="text-white/40 group-hover:text-white/60 transition-colors">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // Likes You Tab
            likes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">❤️</div>
                <h3 className="text-2xl font-light text-white mb-3">No likes yet</h3>
                <p className="text-white/40 mb-8">
                  Keep swiping to find people who appreciate your energy
                </p>
                <button
                  onClick={() => navigate('/home')}
                  className="px-8 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all font-medium"
                >
                  Continue Swiping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {likes.map((likedUser) => {
                  const age = calculateAge(likedUser.birth_date);
                  
                  return (
                    <div
                      key={likedUser.id}
                      className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                    >
                      {/* Profile Photo */}
                      <div
                        className="w-20 h-20 rounded-2xl bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: `url(${likedUser.photos?.[0] || 'https://via.placeholder.com/200'})`
                        }}
                      />

                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-light text-white mb-1">
                          {likedUser.first_name}, {age}
                        </h3>
                        <div className="flex items-center gap-2 text-white/60">
                          <Star className="w-4 h-4 text-purple-400" />
                          <span>{likedUser.zodiac_sign}</span>
                        </div>
                      </div>

                      {/* Like Badge */}
                      <div className="bg-pink-500/20 px-4 py-2 rounded-full border border-pink-500/30">
                        <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="connections" navigate={navigate} />
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
