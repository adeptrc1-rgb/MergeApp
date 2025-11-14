import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, Heart, Star, Sparkles, MessageCircle } from 'lucide-react';
import { createMessageSentEffect, createMessageReceivedEffect, createStardustTrail } from '../utils/particleEffects';
import BottomNav from './BottomNav';
import ConversationStarters from './ConversationStarters';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function AstroChat({ user, logout }) {
  const navigate = useNavigate();
  const { matchId: routeMatchId } = useParams();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [inputFocusTime, setInputFocusTime] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showInlineStarters, setShowInlineStarters] = useState(false);
  const messagesEndRef = useRef(null);
  const inputFocusTimer = useRef(null);
  
  // Mobile detection for responsive UI
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.id);
      // Auto-refresh messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedMatch.id);
      }, 3000);
      return () => clearInterval(interval);
  // When route includes /chat/:matchId, auto-select that match for consistent UI
  useEffect(() => {
    if (!routeMatchId) return;
    
    // Handle test-starters route
    if (routeMatchId === 'test-starters') {
      setSelectedMatch({
        id: 'test-match-id',
        first_name: 'Sarah',
        last_name: 'Chen',
        age: 28,
        zodiac_sign: 'Leo',
        photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'],
        bio: 'Adventure seeker, coffee enthusiast, and weekend hiker.',
        interests: ['hiking', 'photography', 'coffee', 'travel']
      });
      setMessages([]);
      setLoading(false);
      return;
    }
    
    if (matches.length === 0) return;
    const m = matches.find(m => String(m.id) === String(routeMatchId) || String(m.match_id) === String(routeMatchId));
    if (m) setSelectedMatch(m);
  }, [routeMatchId, matches]);

    }
  }, [selectedMatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches/my-matches`);
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading matches:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (matchId) => {
    try {
      const response = await axios.get(`${API}/messages/${matchId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      await axios.post(`${API}/messages/send`, {
        match_id: selectedMatch.match_id,
        receiver_id: selectedMatch.id,
        message: newMessage
      });

      setNewMessage('');
      loadMessages(selectedMatch.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    // Start timer to show inline starters after 5 seconds
    if (messages.length > 0 && newMessage.trim() === '') {
      inputFocusTimer.current = setTimeout(() => {
        setShowInlineStarters(true);
      }, 5000);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    if (inputFocusTimer.current) {
      clearTimeout(inputFocusTimer.current);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setShowInlineStarters(false);
    
    // Reset timer if user starts typing
    if (inputFocusTimer.current) {
      clearTimeout(inputFocusTimer.current);
    }
  };

  const handleSelectStarter = (starter) => {
    setNewMessage(starter);
    setShowInlineStarters(false);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💬</div>
          <p className="text-white text-lg">Loading your cosmic connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Matches Sidebar */}
      <div className={`w-full md:w-96 bg-black border-r flex flex-col ${selectedMatch ? 'hidden md:flex' : 'flex'}`} style={{ borderColor: '#262626' }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: '#262626' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
              <MessageCircle className="w-6 h-6" style={{ color: '#3B82F6' }} />
              Connections
            </h2>
            <button 
              onClick={() => navigate('/home')}
              className="transition-colors"
              style={{ color: '#A3A3A3' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FAFAFA'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A3A3A3'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm" style={{ color: '#A3A3A3' }}>{matches.length} active connection{matches.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {matches.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <p className="mb-2" style={{ color: '#FAFAFA' }}>No connections yet</p>
              <p className="text-sm mb-4" style={{ color: '#525252' }}>Start swiping to make connections</p>
              <Button 
                onClick={() => navigate('/home')}
                className="rounded-full px-6 py-2 font-medium transition-all"
                style={{ backgroundColor: '#3B82F6', color: '#FAFAFA' }}
              >
                Start Swiping
              </Button>
            </div>
          ) : (
            matches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`w-full p-4 flex items-center gap-3 transition-colors border-b`}
                style={{ 
                  borderColor: '#262626',
                  backgroundColor: selectedMatch?.id === match.id ? '#171717' : 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#171717'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedMatch?.id === match.id ? '#171717' : 'transparent'}
              >
                <div 
                  className="w-14 h-14 rounded-full bg-cover bg-center flex-shrink-0"
                  style={{ 
                    backgroundImage: match.photos?.[0] ? `url(${match.photos[0]})` : 'none',
                    backgroundColor: !match.photos?.[0] ? '#3B82F6' : 'transparent'
                  }}
                >
                  {!match.photos?.[0] && (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                      {match.first_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold" style={{ color: '#FAFAFA' }}>
                    {match.first_name} {match.last_name?.charAt(0)}.
                  </h3>
                  <p className="text-sm" style={{ color: '#A3A3A3' }}>
                    {calculateAge(match.birth_date)} • {match.current_location?.city || 'Unknown'}
                  </p>
                  {match.compatibility_score && (
                    <p className="text-xs mt-1" style={{ color: '#3B82F6' }}>
                      {match.compatibility_score}% Merge Score
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedMatch ? 'flex' : 'hidden md:flex'}`}>
        {selectedMatch ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: '#0A0A0A', borderColor: '#262626' }}>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="md:hidden transition-colors"
                  style={{ color: '#A3A3A3' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#A3A3A3'}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div 
                  className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0"
                  style={{ 
                    backgroundImage: selectedMatch.photos?.[0] ? `url(${selectedMatch.photos[0]})` : 'none',
                    backgroundColor: !selectedMatch.photos?.[0] ? '#3B82F6' : 'transparent'
                  }}
                >
                  {!selectedMatch.photos?.[0] && (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedMatch.first_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2" style={{ color: '#FAFAFA' }}>
                    {selectedMatch.first_name} {selectedMatch.last_name?.charAt(0)}.
                  </h3>
                  {selectedMatch.compatibility_score && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#3B82F6' }}>
                      <Star className="w-3 h-3 fill-current" />
                      <span>{selectedMatch.compatibility_score}% Merge Score</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ backgroundColor: '#000000' }}>
              {messages.length === 0 ? (
                <ConversationStarters
                  matchId={selectedMatch.id}
                  matchUser={selectedMatch}
                  messageCount={messages.length}
                  onSelectStarter={handleSelectStarter}
                  variant="empty"
                />
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                        style={{
                          backgroundColor: isMe ? '#3B82F6' : '#171717',
                          color: '#FAFAFA',
                          border: isMe ? 'none' : '1px solid #262626'
                        }}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1" style={{ color: isMe ? '#DBEAFE' : '#737373' }}>
                          {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Inline Conversation Starters */}
            {showInlineStarters && messages.length > 0 && (
              <ConversationStarters
                matchId={selectedMatch.id}
                matchUser={selectedMatch}
                messageCount={messages.length}
                onSelectStarter={handleSelectStarter}
                variant="inline"
              />
            )}

            {/* Message Input */}
            <div className="p-4 border-t" style={{ backgroundColor: '#0A0A0A', borderColor: '#262626' }}>
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full px-4 py-3"
                  style={{ 
                    backgroundColor: '#171717', 
                    border: '1px solid #404040', 
                    color: '#FAFAFA'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: newMessage.trim() ? '#3B82F6' : '#262626',
                    color: '#FAFAFA'
                  }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg" style={{ color: '#A3A3A3' }}>Select a connection to start chatting</p>
            </div>
          </div>
        )}
      </div>
      <BottomNav currentTab="messages" navigate={navigate} />
    </div>
  );
}
