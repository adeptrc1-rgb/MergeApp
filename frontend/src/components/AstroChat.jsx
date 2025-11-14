import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, Heart, Star, Sparkles } from 'lucide-react';
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
    if (!routeMatchId || matches.length === 0) return;
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex">
      {/* Matches Sidebar */}
      <div className={`w-full md:w-96 bg-black/30 backdrop-blur-md border-r border-white/10 flex flex-col ${selectedMatch ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
              Matches
            </h2>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <p className="text-purple-200 text-sm">{matches.length} cosmic connection{matches.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto">
          {matches.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">✨</div>
              <p className="text-purple-200 mb-2">No matches yet!</p>
              <p className="text-purple-300 text-sm mb-4">Start swiping to find your cosmic connections</p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Start Swiping
              </Button>
            </div>
          ) : (
            matches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${
                  selectedMatch?.id === match.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                  {match.first_name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">
                      {match.first_name} {match.last_name?.charAt(0)}.
                    </h3>
                    <span className="text-yellow-400 text-xs">
                      {match.zodiac_sign}
                    </span>
                  </div>
                  <p className="text-purple-200 text-sm">
                    {calculateAge(match.birth_date)} • {match.current_location?.city || 'Unknown'}
                  </p>
                  <p className="text-purple-300 text-xs mt-1">
                    {match.compatibility_score}% Match
                  </p>
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
            <div className="p-4 bg-black/30 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="md:hidden text-white/60 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedMatch.first_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    {selectedMatch.first_name} {selectedMatch.last_name?.charAt(0)}.
                    <span className="text-yellow-400 text-sm">
                      {selectedMatch.zodiac_sign}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-purple-200 text-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{selectedMatch.compatibility_score}% Compatible</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={logout}
                className="text-white/60 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                        isMe 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-br-sm' 
                          : 'bg-white/10 backdrop-blur-sm text-white rounded-bl-sm border border-white/20'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-purple-300'}`}>
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
            <div className="p-4 bg-black/30 backdrop-blur-md border-t border-white/10">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 rounded-full px-4 py-3"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-center hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-purple-200 text-lg">Select a match to start chatting</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation on mobile for consistency */}
      {isMobile && (
        <BottomNav currentTab="messages" navigate={navigate} />
      )}
    </div>
  );
}
