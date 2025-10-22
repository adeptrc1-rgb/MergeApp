import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Info, MapPin, Briefcase, Sparkles, Star, Zap, RotateCcw, Home, Users, MessageCircle } from 'lucide-react';
import ConstellationIcon from './ConstellationIcon';
import BottomNav from './BottomNav';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

axios.defaults.withCredentials = true;

// Astrology Icebreakers
function DevSeasonToggle() {
  const [sign, setSign] = React.useState('Leo');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const apply = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/season/test-start?sign=${encodeURIComponent(sign)}&notify=false`);
      // refresh with preview query
      const qs = new URLSearchParams(window.location.search);
      qs.set('forceSeason', sign);
      qs.set('dev', '1');
      navigate(`/discover?${qs.toString()}`);
    } catch (e) {
      alert('Failed to start season preview');
    } finally {
      setLoading(false);
    }
  };
  const clear = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/season/clear-test`);
      const qs = new URLSearchParams(window.location.search);
      qs.delete('forceSeason');
      qs.set('dev', '1');
      navigate(`/discover?${qs.toString()}`);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center gap-2 text-white/60">
      <select value={sign} onChange={(e) => setSign(e.target.value)} className="bg-white/10 border border-white/10 rounded-md px-2 py-1 text-xs">
        {['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button onClick={apply} disabled={loading} className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15">{loading ? 'Applying…' : 'Apply'}</button>
      <button onClick={clear} disabled={loading} className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15">Clear</button>
    </div>
  );
}

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

export default function Discover({ user }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [trendingUsers, setTrendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('compatible'); // 'compatible' or 'trending'
  // Dev toggle: force season via query (?forceSeason=Leo)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const force = params.get('forceSeason');
      if (force) {
        // nothing to do here, backend will accept ?force_season, we’ll call it on load
      }
    } catch (e) {}
  }, []);

  const [todayHoroscope, setTodayHoroscope] = useState(null);

  useEffect(() => {
    loadMatches();
    loadTrendingEnergies();
    loadTodayHoroscope();
  }, []);

  const loadTodayHoroscope = async () => {
    try {
      const response = await axios.get(`${API}/horoscope/today`);
      setTodayHoroscope(response.data);
    } catch (error) {
      console.error('Error loading horoscope:', error);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await axios.get(`${API}/users/potential-matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
    setLoading(false);
  };

  const loadTrendingEnergies = async () => {
    try {
      const response = await axios.get(`${API}/users/trending-energies`);
      setTrendingUsers(response.data);
    } catch (error) {
      console.error('Error loading trending energies:', error);
    }
  };

  const handleProfileClick = (match) => {
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
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Daily Horoscope Ticker */}
      {todayHoroscope && (
        <div className="bg-black border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-center animate-fadeIn">
            <div className="text-center">
              <p className="text-white/80 text-sm font-light tracking-wide">
                {todayHoroscope.message_short || todayHoroscope.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 bg-black flex-shrink-0 select-none" style={{ WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none', userSelect: 'none' }}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <img src="/asign-logo.png" alt="A Sign" className="h-8" />
            <div className="flex items-center gap-2">
              {/* Dev Season Toggle */}
              {(() => {
                const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                const showDev = (typeof window !== 'undefined' && window.location.hostname === 'localhost') || (qs && qs.get('dev') === '1');
                return showDev ? (
                  <DevSeasonToggle />
                ) : null;
              })()}
              <button className="text-white/60 hover:text-white">
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h2 className="text-3xl font-light text-white mb-3">Discover</h2>
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
      <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Display based on active filter */}
          {activeFilter === 'compatible' ? (
            matches.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">✨</div>
                <h3 className="text-2xl font-light text-white mb-3">No matches yet</h3>
                <p className="text-white/40">Check back later for more cosmic connections</p>
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((match) => {
                  const age = calculateAge(match.birth_date);
                  const compatibility = Math.round(match.compatibility_score || Math.floor(Math.random() * 30) + 70);
                  return (
                    <div
                      key={match.id}
                      onClick={() => handleProfileClick(match)}
                      className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                    >
                      {/* Profile Photo */}
                      <div
                        className="w-24 h-24 rounded-2xl bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${match.photos?.[0] || 'https://via.placeholder.com/200'})` }}
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
            )
          ) : (
            trendingUsers.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">⚡</div>
                <h3 className="text-2xl font-light text-white mb-3">No trending energies yet</h3>
                <p className="text-white/40">Active and engaged users will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {trendingUsers.map((match) => {
                  const age = calculateAge(match.birth_date);
                  const compatibility = match.compatibility_score || Math.floor(Math.random() * 30) + 70;
                  const energyScore = match.trending_energy_score || 0;
                  return (
                    <div
                      key={match.id}
                      onClick={() => handleProfileClick(match)}
                      className="relative flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
                    >
                      {/* Trending Badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-400">{energyScore.toFixed(0)}% Energy</span>
                      </div>
                      {/* Profile Photo */}
                      <div
                        className="w-24 h-24 rounded-2xl bg-cover bg-center flex-shrink-0 ring-2 ring-yellow-400/30"
                        style={{ backgroundImage: `url(${match.photos?.[0] || 'https://via.placeholder.com/200'})` }}
                      />
                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-light text-white mb-1">
                          {match.first_name} {match.last_name || 'Owens'}
                        </h3>
                        <div className="flex items-center gap-3 text-white/60 text-sm">
                          <span>{compatibility}% Compatible</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Trending
                          </span>
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
            )
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="discover" navigate={navigate} />
    </div>
  );
}
