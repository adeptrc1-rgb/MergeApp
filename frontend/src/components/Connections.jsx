import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Heart, MessageCircle, Star, MapPin, Sparkles, Users, Home, Zap, Timer, RefreshCw } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || '';
axios.defaults.withCredentials = true;

const fmtTime = (secs) => {
  if (!secs || secs <= 0) return '0m';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export default function Connections({ user }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [likes, setLikes] = useState([]);
  const [penalty, setPenalty] = useState({ active: false, remaining_seconds: 0, total_seconds: 0, band: null, reflect_used: false });
  const [showReflect, setShowReflect] = useState(false);
  const isPreview = typeof window !== 'undefined' && window.location.hostname.includes('preview.emergentagent.com');
  const locationObj = typeof window !== 'undefined' ? window.location : { search: '' };

  useEffect(() => {
    loadMatches();
    loadLikes();
    fetchPenalty();
    const t = setInterval(fetchPenalty, 5000);
    // allow query to force show overlay for quick preview
    try {
      const params = new URLSearchParams(locationObj.search);
      if (params.get('penalty') === '1') {
        setPenalty({ active: true, remaining_seconds: 3600, total_seconds: 7200, band: 'TrueMatch', reflect_used: false });
      }
    } catch (e) {}
    return () => clearInterval(t);
  }, []);

  const fetchPenalty = async () => {
    try {
      const res = await axios.get(`${API}/api/penalty/status`);
      setPenalty(res.data || { active: false });
    } catch (e) {
      // noop: overlay can be forced via ?penalty=1
    }
  };

  const reflectNow = async () => {
    try {
      const res = await axios.post(`${API}/api/penalty/reflect`);
      setPenalty((p) => ({ ...p, ...res.data, reflect_used: true }));
    } catch (e) {
      alert(e?.response?.data?.detail || 'Unable to reflect right now');
    }
  };

  const loadMatches = async () => {
    try {
      const response = await axios.get(`${API}/api/matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
    setLoading(false);
  };

  const loadLikes = async () => {
    try {
      const response = await axios.get(`${API}/api/users/liked-me`);
      setLikes(response.data);
    } catch (error) {
      setLikes([]);
    }
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

  // Penalty overlay inside Matches tab - refined to match uploaded design
  const CosmicOverlay = () => {
    const percent = penalty.total_seconds ? Math.min(100, Math.max(0, ((penalty.total_seconds - penalty.remaining_seconds) / penalty.total_seconds) * 100)) : 0;
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        {/* background gradients / glows */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-black to-black" />
        <div className="absolute -top-40 -left-40 w-[26rem] h-[26rem] rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[22rem] h-[22rem] rounded-full bg-pink-500/15 blur-3xl" />

        <div className="relative p-8 text-center">
          {/* top sigil */}
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 mb-4">
            <Sparkles className="w-7 h-7 text-purple-300" />
          </div>
          <h3 className="text-3xl md:text-4xl font-light text-white tracking-wide mb-2">The Universe is Rebalancing</h3>
          <p className="text-white/60 max-w-xl mx-auto mb-8">High-compatibility connections are in a queue. Stay present while energies realign.</p>

          {/* Orbs Row */}
          <div className="flex items-center justify-center gap-8 mb-8">
            {[0,1,2].map((i) => (
              <div key={i} className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full" style={{
                  background: 'conic-gradient(from 0deg, rgba(168,85,247,0.35), rgba(236,72,153,0.35), rgba(255,255,255,0.12), rgba(168,85,247,0.35))',
                  boxShadow: '0 0 30px rgba(168,85,247,0.25)'
                }} />
                <div className="absolute inset-0 m-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 border border-white/15 backdrop-blur-md flex items-center justify-center">
                  <div className="text-white/85 text-sm md:text-base font-medium flex items-center gap-2">
                    <Timer className="w-4 h-4 text-purple-300" />
                    <span>{fmtTime(Math.max(0, (penalty.remaining_seconds || 0) - i * 60))}</span>
                  </div>
                </div>
                {/* twinkles */}
                <div className="absolute -top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                <div className="absolute -bottom-1 right-3 w-1 h-1 rounded-full bg-white/50 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="max-w-xl mx-auto text-left">
            <div className="flex items-center justify-between text-white/60 text-xs mb-2">
              <span>Queue Progress</span>
              <span>{Math.round(percent)}%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="relative h-3 bg-gradient-to-r from-purple-400 to-pink-400" style={{width: `${percent}%`}}>
                <div className="absolute right-0 -top-[6px] w-3 h-3 rounded-full bg-white/90 shadow" />
              </div>
            </div>
          </div>

          {/* Actions & band */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => setShowReflect(true)}
              disabled={penalty.reflect_used}
              className={`px-7 py-3 rounded-full font-medium shadow-lg transition-all ${penalty.reflect_used ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-105'}`}
            >
              {penalty.reflect_used ? 'Reflection Complete' : 'Reflect to Realign Faster'}
            </button>
            <div className="text-white/60 text-xs flex items-center gap-2">
              {penalty.band ? <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">Band: {penalty.band}</span> : null}
              {isPreview && (
                <>
                  <button
                    onClick={async () => { try { await axios.post(`${API}/api/penalty/test-start`, { compatibility_score: 92 }); fetchPenalty(); } catch {} }}
                    className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
                  >Start Penalty (Dev)</button>
                  <button
                    onClick={async () => { try { await axios.post(`${API}/api/penalty/clear`); fetchPenalty(); } catch {} }}
                    className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
                  >Clear (Dev)</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-black flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <img src="/asign-logo.png" alt="A Sign" className="h-10" />
            <button className="text-white/60 hover:text-white">
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-4xl font-light text-white mb-2">Connections</h2>
          {penalty.active && (
            <p className="text-white/60 text-sm">Penalty active. Your cosmic alignments will resume when the timer ends.</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          {activeTab === 'matches' ? (
            (penalty.active || isPreview && new URLSearchParams(locationObj.search).get('penalty') === '1') ? (
              <CosmicOverlay />
            ) : (
              matches.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-6">💫</div>
                  <h3 className="text-2xl font-light text-white mb-3">No matches yet</h3>
                  <p className="text-white/40 mb-8">Start swiping to find your cosmic connections</p>
                  <button onClick={() => navigate('/home')} className="px-8 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all font-medium">Start Swiping</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {matches.map((match) => {
                    const otherUser = match.user1_id === user.id ? match.user2 : match.user1;
                    const score = match.compatibility_score || 70;
                    const energy = score >= 85 ? { text: 'High energy today', color: 'text-green-400' } : score >= 70 ? { text: 'Medium', color: 'text-yellow-400' } : { text: 'Low energy', color: 'text-red-400' };
                    return (
                      <div key={match.id} onClick={() => navigate(`/chat/${match.id}`)} className="flex items-center gap-6 p-4 rounded-2xl hover:bg_white/5 transition-all cursor-pointer group">
                        <div className="w-20 h-20 rounded-2xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${otherUser.photos?.[0] || 'https://via.placeholder.com/200'})` }} />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-light text-white mb-1">{otherUser.first_name} {otherUser.last_name || ''}</h3>
                          <p className={`text-sm ${energy.color}`}>{energy.text}</p>
                        </div>
                        <div className="text-white/40 group-hover:text-white/60 transition-colors">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )
          ) : (
            // Likes tab
            likes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">❤️</div>
                <h3 className="text-2xl font-light text_white mb-3">No likes yet</h3>
                <p className="text-white/40 mb-8">Keep swiping to find people who appreciate your energy</p>
              </div>
            ) : (
              <div className="space-y-6">
                {likes.map((likedUser) => (
                  <div key={likedUser.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="w-20 h-20 rounded-2xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${likedUser.photos?.[0] || 'https://via.placeholder.com/200'})` }} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-light text-white mb-1">{likedUser.first_name}</h3>
                    </div>
                    <div className="bg-pink-500/20 px-4 py-2 rounded-full border border-pink-500/30">
                      <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Reflect ritual modal */}
      {showReflect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-gradient-to-b from-purple-900/80 to-black/80 border border-white/10 rounded-2xl p-6 w-full max-w-md text-center">
            <div className="inline-block p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-3 border border-white/10">
              <Sparkles className="w-7 h-7 text-purple-300" />
            </div>
            <h4 className="text-xl text-white mb-2">Reflect to Realign</h4>
            <p className="text-white/70 text-sm mb-4">Take a moment. Breathe. Acknowledge what you’d do differently. When you’re ready, press realign to reduce your wait time.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowReflect(false)} className="px-4 py-2 rounded-full bg-white/10 text-white/70 hover:bg-white/15">Not now</button>
              <button onClick={async () => { await reflectNow(); setShowReflect(false); }} className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-105">Realign</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav currentTab="connections" navigate={navigate} />

      {/* Overlay keyframes */}
      <style>{`@keyframes pulseTwinkle { 0%,100% { opacity: .7 } 50% { opacity: .2 } }`}</style>
    </div>
  );
}

function BottomNav({ currentTab, navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-around">
        <button onClick={() => navigate('/home')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'home' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>
        <button onClick={() => navigate('/discover')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'discover' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>
          <Sparkles className="w-5 h-5" />
          <span className="text-xs">Discover</span>
        </button>
        <button onClick={() => navigate('/messages')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'messages' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">Messages</span>
        </button>
        <button onClick={() => navigate('/connections')} className={`flex flex_col items-center gap-1 transition-colors ${currentTab === 'connections' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>
          <Users className="w-5 h-5" />
          <span className="text-xs">Connect</span>
        </button>
        <button onClick={() => navigate('/profile')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'profile' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>
          <Star className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}