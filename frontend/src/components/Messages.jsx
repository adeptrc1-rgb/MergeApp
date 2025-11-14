import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, Sparkles, Users, Home, Star, Send } from 'lucide-react';
import BottomNav from './BottomNav';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;
axios.defaults.withCredentials = true;

export default function Messages({ user }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coinflipMap, setCoinflipMap] = useState({});
  const [coinflipToast, setCoinflipToast] = useState(null);
  const [creating, setCreating] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const matchesResponse = await axios.get(`${API}/matches`);

      const matches = matchesResponse.data || [];

      const conversationsWithMessages = await Promise.all(
        matches.map(async (match) => {
          try {
            const messagesResponse = await axios.get(`${API}/matches/${match.id}/messages`);
            const messages = messagesResponse.data || [];
  // Auto-open chat when arriving with ?chat=<matchId>
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const matchId = params.get('chat');
      if (matchId) {
        setTimeout(() => openChat(matchId), 200);
      }
    } catch (e) {}
  }, []);

            const lastMessage = messages[messages.length - 1];
            const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
            return {
              id: match.id,
              user: otherUser,
              lastMessage: lastMessage?.content || 'Start the conversation!',
              lastMessageTime: lastMessage?.created_at || match.matched_at,
              unreadCount: 0,
              match
            };
          } catch (error) {
            const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
            return {
              id: match.id,
              user: otherUser,
              lastMessage: 'Start the conversation!',
              lastMessageTime: match.matched_at,
              unreadCount: 0,
              match
            };
          }
        })
      );

      conversationsWithMessages.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      setConversations(conversationsWithMessages);

      const updatedMap = {};
      for (const c of conversationsWithMessages) {
        try {
          const st = await axios.get(`${API}/matches/${c.id}/coinflip-status`);
          if (st.data && st.data.set) {
            updatedMap[c.id] = st.data;
          } else {
            if (!c.lastMessage || c.lastMessage === 'Start the conversation!') {
              const res = await axios.post(`${API}/matches/${c.id}/coinflip`);
              if (res.data) {
                updatedMap[c.id] = { 
                  set: true, 
                  first_user_id: res.data.first_user_id, 
                  second_user_id: res.data.second_user_id,
                  winner_user_id: res.data.winner_user_id,
                  animation_start_time: res.data.animation_start_time
                };
              }
            }
          }
        } catch (e) {
          // ignore per-conversation failures
        }
      }
      setCoinflipMap(updatedMap);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    setLoading(false);
  };

  const openChat = async (matchId) => {
    const conversation = conversations.find(c => c.id === matchId);
    const cf = coinflipMap[matchId];
    
    // If coinflip not set yet, trigger it with simple loading
    if (!cf || !cf.set) {
      setOpeningChat(true);
      try {
        await axios.post(`${API}/matches/${matchId}/coinflip`);
        await loadConversations(); // Reload to update coinflip status
      } catch (e) {
        console.error('Coinflip error:', e);
      }
      setOpeningChat(false);
    }
    
    // Navigate directly to chat
    navigate(`/chat/${matchId}`);
  };

  // Auto-open chat when navigated with state (disabled in favor of direct /chat/:matchId navigation)
  useEffect(() => {}, []);

  const createTestMatch = async () => {
    try {
      setCreating(true);
      const res = await axios.post(`${API}/matches/test-create`, { compatibility_score: 88 });
      if (res.data && res.data.match_id) {
        const matchId = res.data.match_id;
        await loadConversations();
        
        // Create coinflip (backend logic still runs)
        await axios.post(`${API}/matches/${matchId}/coinflip`);
        
        // Navigate directly to chat
        navigate(`/chat/${matchId}`);
      }
    } catch (e) {
      console.error('Error creating test match:', e);
      alert('Unable to create match');
    } finally {
      setCreating(false);
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
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-black flex-shrink-0 select-none" style={{ borderColor: '#262626', WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none', userSelect: 'none' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h2 className="text-3xl font-semibold mb-3" style={{ color: '#FAFAFA' }}>Messages</h2>
          {coinflipToast && (
            <div className="mt-3 rounded-xl px-4 py-2 inline-flex items-center gap-2" style={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#FAFAFA' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#3B82F6' }} />
              <span className="text-sm">{coinflipToast}</span>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button 
              onClick={createTestMatch} 
              disabled={creating} 
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={{ 
                backgroundColor: '#171717', 
                border: '1px solid #404040', 
                color: '#A3A3A3'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#262626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#171717'}
            >
              {creating ? 'Creating…' : 'Create Test Match (Dev)'}
            </button>
            <button 
              onClick={() => {
                console.log('Navigating to test starters...');
                navigate('/chat/test-starters');
              }} 
              className="px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all"
              style={{ 
                backgroundColor: '#3B82F6', 
                color: '#FAFAFA'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
            >
              <Sparkles className="w-4 h-4" />
              Test AI Starters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          {conversations.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">💬</div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#FAFAFA' }}>No messages yet</h3>
              <p className="mb-8" style={{ color: '#525252' }}>Start swiping to make connections!</p>
              <button 
                onClick={() => navigate('/home')} 
                className="px-8 py-3 rounded-full font-medium transition-all"
                style={{ backgroundColor: '#3B82F6', color: '#FAFAFA' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
              >
                Start Swiping
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const age = calculateAge(conversation.user.birth_date);
                const cf = coinflipMap[conversation.id];
                const youStart = cf?.set ? (cf.first_user_id === user.id || cf.winner_user_id === user.id) : null;
                return (
                  <div 
                    key={conversation.id} 
                    onClick={() => openChat(conversation.id)} 
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#171717'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${conversation.user.photos?.[0] || 'https://via.placeholder.com/200'})` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold" style={{ color: '#FAFAFA' }}>{conversation.user.first_name}, {age}</h3>
                        {youStart !== null && (
                          <span 
                            className="text-[11px] px-2 py-0.5 rounded-full border"
                            style={{ 
                              borderColor: youStart ? '#22C55E40' : '#40404040', 
                              color: youStart ? '#22C55E' : '#737373'
                            }}
                          >
                            {youStart ? 'You start' : 'They start'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm truncate" style={{ color: '#737373' }}>{conversation.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs" style={{ color: '#525252' }}>{formatTime(conversation.lastMessageTime)}</span>
                      {conversation.unreadCount > 0 && (
                        <div 
                          className="text-xs rounded-full w-5 h-5 flex items-center justify-center"
                          style={{ backgroundColor: '#3B82F6', color: '#FAFAFA' }}
                        >
                          {conversation.unreadCount}
                        </div>
                      )}
                      <Send className="w-5 h-5 transition-colors" style={{ color: '#525252' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav currentTab="messages" navigate={navigate} />
      
      {/* Simple loading overlay when opening chat */}
      {openingChat && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-lg">Opening chat...</p>
          </div>
        </div>
      )}
    </div>
  );
}
