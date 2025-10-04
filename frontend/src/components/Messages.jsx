import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, Sparkles, Users, Home, Star, Send } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function Messages({ user }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      // Load both matches and direct message conversations
      const matchesResponse = await axios.get(`${API}/matches`);
      const matches = matchesResponse.data;
      
      // Get conversations with message counts
      const conversationsWithMessages = await Promise.all(
        matches.map(async (match) => {
          try {
            const messagesResponse = await axios.get(`${API}/matches/${match.id}/messages`);
            const messages = messagesResponse.data;
            const lastMessage = messages[messages.length - 1];
            
            const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
            
            return {
              id: match.id,
              user: otherUser,
              lastMessage: lastMessage?.content || 'No messages yet',
              lastMessageTime: lastMessage?.created_at || match.matched_at,
              unreadCount: 0, // TODO: Implement unread tracking
              match: match
            };
          } catch (error) {
            const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
            return {
              id: match.id,
              user: otherUser,
              lastMessage: 'Start the conversation!',
              lastMessageTime: match.matched_at,
              unreadCount: 0,
              match: match
            };
          }
        })
      );
      
      // Sort by most recent
      conversationsWithMessages.sort((a, b) => 
        new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
      
      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    setLoading(false);
  };

  const openChat = (matchId) => {
    navigate(`/chat/${matchId}`);
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-lg">Loading messages...</p>
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
          <h2 className="text-4xl font-light text-white">Messages</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {conversations.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">💬</div>
              <h3 className="text-2xl font-light text-white mb-3">No messages yet</h3>
              <p className="text-white/40 mb-8">
                Start swiping to make connections!
              </p>
              <button
                onClick={() => navigate('/home')}
                className="px-8 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all font-medium"
              >
                Start Swiping
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const age = calculateAge(conversation.user.birth_date);
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => openChat(conversation.id)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    {/* Profile Photo */}
                    <div
                      className="w-16 h-16 rounded-2xl bg-cover bg-center flex-shrink-0"
                      style={{
                        backgroundImage: `url(${conversation.user.photos?.[0] || 'https://via.placeholder.com/200'})`
                      }}
                    />

                    {/* Message Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-light text-white">
                          {conversation.user.first_name}, {age}
                        </h3>
                        <Star className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-white/60">{conversation.user.zodiac_sign}</span>
                      </div>
                      <p className="text-sm text-white/60 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {/* Time & Badge */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-white/40">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                      <Send className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="messages" navigate={navigate} />
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
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate('/messages')}
          className={`flex flex-col items-center gap-2 transition-colors ${
            currentTab === 'messages' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Messages</span>
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
