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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                A Sign
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="text-sm font-medium">{user.zodiac_sign}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Matches ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'likes'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Likes You ({likes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto p-4">
          {activeTab === 'matches' ? (
            // Matches Tab
            matches.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">💫</div>
                <h3 className="text-2xl font-bold text-white mb-3">No matches yet</h3>
                <p className="text-purple-200 mb-6">
                  Start swiping to find your cosmic connections
                </p>
                <Button
                  onClick={() => navigate('/discover')}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                >
                  Start Discovering
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {matches.map((match) => {
                  const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
                  const age = calculateAge(otherUser.birth_date);
                  
                  return (
                    <div
                      key={match.id}
                      className="bg-black/30 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-pink-400/50 transition-all cursor-pointer group"
                      onClick={() => openChat(match.id)}
                    >
                      {/* Photo */}
                      <div
                        className="h-64 bg-cover bg-center relative"
                        style={{
                          backgroundImage: `url(${otherUser.photos?.[0] || 'https://via.placeholder.com/300x400'})`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                        
                        {/* Compatibility Badge */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500/80 to-purple-500/80 backdrop-blur-md px-3 py-1 rounded-full">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-xs font-bold">
                              {match.compatibility_score}%
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-lg mb-1">
                            {otherUser.first_name}, {age}
                          </h3>
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{otherUser.zodiac_sign}</span>
                          </div>
                          {otherUser.current_location && (
                            <div className="flex items-center gap-1 text-white/70 text-xs mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{otherUser.current_location.city}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Button */}
                      <div className="p-3 bg-black/20">
                        <Button
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white flex items-center justify-center gap-2 group-hover:scale-105 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChat(match.id);
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Message</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // Likes Tab
            likes.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">❤️</div>
                <h3 className="text-2xl font-bold text-white mb-3">No likes yet</h3>
                <p className="text-purple-200 mb-6">
                  Keep swiping to find people who appreciate your cosmic energy
                </p>
                <Button
                  onClick={() => navigate('/discover')}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                >
                  Continue Discovering
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {likes.map((likedUser) => {
                  const age = calculateAge(likedUser.birth_date);
                  
                  return (
                    <div
                      key={likedUser.id}
                      className="bg-black/30 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-pink-400/50 transition-all"
                    >
                      {/* Photo */}
                      <div
                        className="h-64 bg-cover bg-center relative"
                        style={{
                          backgroundImage: `url(${likedUser.photos?.[0] || 'https://via.placeholder.com/300x400'})`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                        
                        {/* Likes You Badge */}
                        <div className="absolute top-3 right-3 bg-pink-500/80 backdrop-blur-md px-3 py-1 rounded-full">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-white text-white" />
                            <span className="text-white text-xs font-bold">Likes You</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-lg mb-1">
                            {likedUser.first_name}, {age}
                          </h3>
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{likedUser.zodiac_sign}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-3 bg-black/20 flex gap-2">
                        <Button
                          className="flex-1 bg-white/10 text-white hover:bg-white/20"
                          onClick={() => {/* Handle pass */}}
                        >
                          Pass
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                          onClick={() => {/* Handle like back */}}
                        >
                          <Heart className="w-4 h-4 fill-white" />
                        </Button>
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
