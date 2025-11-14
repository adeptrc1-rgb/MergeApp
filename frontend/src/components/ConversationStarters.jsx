import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Send, Copy } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

axios.defaults.withCredentials = true;

export default function ConversationStarters({ 
  matchId, 
  matchUser, 
  messageCount = 0, 
  onSelectStarter,
  variant = "empty" // "empty", "inline", "floating"
}) {
  const [starters, setStarters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (matchId) {
      loadStarters();
    }
  }, [matchId]);

  const loadStarters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const conversationStage = messageCount === 0 ? 'first_message' : 
                               messageCount > 0 && messageCount < 5 ? 'active' : 
                               'stalled';
      
      const response = await axios.get(
        `${API}/conversation-starters/${matchId}?conversation_stage=${conversationStage}`
      );
      
      if (response.data.success) {
        setStarters(response.data.starters || []);
      }
    } catch (err) {
      console.error('Error loading conversation starters:', err);
      setError('Unable to load starters');
      // Set fallback starters
      setStarters([
        "Hey! I'd love to get to know you better. What brings you joy?",
        "Your profile caught my attention! What's something you're passionate about?",
        "Let's start with something fun—what's your go-to weekend activity?"
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStarters();
  };

  const handleSelectStarter = async (starter, index) => {
    // Track usage
    try {
      await axios.post(`${API}/conversation-starters/${matchId}/track`, {
        starter_text: starter,
        starter_index: index
      });
    } catch (err) {
      console.error('Error tracking starter usage:', err);
    }
    
    // Call parent handler
    if (onSelectStarter) {
      onSelectStarter(starter);
    }
  };

  const handleCopyStarter = (starter) => {
    navigator.clipboard.writeText(starter);
  };

  // Empty state variant (for when no messages exist)
  if (variant === "empty") {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-lg w-full">
          {/* Match notification */}
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            You matched with {matchUser?.first_name || 'someone special'}!
          </h3>
          <p className="text-purple-200 mb-6">
            Break the ice with a conversation starter
          </p>

          {/* Conversation Starters */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2" style={{ color: '#FAFAFA' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#3B82F6' }} />
                AI Conversation Starters
              </h4>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="text-xs flex items-center gap-1 disabled:opacity-50 transition-all hover:scale-105"
                style={{ color: '#3B82F6' }}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading && starters.length === 0 ? (
              <div className="flex items-center justify-center py-8 rounded-xl" 
                   style={{ backgroundColor: '#171717', border: '1px solid #404040' }}>
                <Sparkles className="w-6 h-6 animate-spin" style={{ color: '#3B82F6' }} />
              </div>
            ) : (
              <div className="space-y-3">
                {starters.map((starter, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-4 transition-all group cursor-pointer hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: '#171717', 
                      border: '1px solid #404040',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                    onClick={() => handleSelectStarter(starter, index)}
                  >
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#FAFAFA' }}>
                      {starter}
                    </p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStarter(starter, index);
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ 
                          backgroundColor: '#3B82F6', 
                          color: '#FAFAFA'
                        }}
                      >
                        <Send className="w-3 h-3" />
                        Send
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyStarter(starter);
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ 
                          backgroundColor: '#262626', 
                          color: '#A3A3A3'
                        }}
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Or type your own */}
          <p className="text-xs" style={{ color: '#525252' }}>
            Or type your own message below
          </p>
        </div>
      </div>
    );
  }

  // Inline variant (shows above message input when conversation is stalled)
  if (variant === "inline") {
    if (loading || starters.length === 0) return null;

    return (
      <div className="px-4 py-3 border-t" style={{ 
        backgroundColor: '#171717', 
        borderColor: '#404040' 
      }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs flex items-center gap-1" style={{ color: '#A3A3A3' }}>
            <Sparkles className="w-3 h-3" />
            Need inspiration?
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs"
            style={{ color: '#3B82F6' }}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {starters.map((starter, index) => (
            <button
              key={index}
              onClick={() => handleSelectStarter(starter, index)}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all hover:scale-105"
              style={{ 
                backgroundColor: '#262626', 
                color: '#FAFAFA',
                border: '1px solid #404040',
                maxWidth: '280px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {starter}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Floating variant (pill-style buttons for quick access)
  if (variant === "floating") {
    if (loading || starters.length === 0) return null;

    return (
      <div className="absolute bottom-16 left-4 right-4 z-10">
        <div className="bg-gradient-to-t from-black/80 to-transparent p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs flex items-center gap-1" style={{ color: '#FAFAFA' }}>
              <Sparkles className="w-3 h-3" />
              Quick starters
            </span>
            <button
              onClick={handleRefresh}
              className="text-xs"
              style={{ color: '#3B82F6' }}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-2">
            {starters.slice(0, 2).map((starter, index) => (
              <button
                key={index}
                onClick={() => handleSelectStarter(starter, index)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all hover:scale-[1.02]"
                style={{ 
                  backgroundColor: '#171717', 
                  color: '#FAFAFA',
                  border: '1px solid #404040'
                }}
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
