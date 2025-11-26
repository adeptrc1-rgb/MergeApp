import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Info, MapPin, Briefcase, Sparkles, Star, Zap, RotateCcw, Home, Users, MessageCircle } from 'lucide-react';
import ConstellationIcon from './ConstellationIcon';
import BottomNav from './BottomNav';
import MergeLogo from './MergeLogo';

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
      // Use mock data for testing when API fails
      const mockProfiles = [
        {
          id: 'mock-1',
          first_name: 'Luna',
          age: 28,
          zodiac_sign: 'Pisces',
          photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'],
          bio: 'Dreamer, artist, and stargazer. Looking for cosmic connections.',
          interests: ['Art', 'Music', 'Astrology'],
          industry: 'Creative Arts',
          job_title: 'Illustrator',
          location: 'Brooklyn, NY',
          merge_score: 89
        },
        {
          id: 'mock-2',
          first_name: 'Alex',
          age: 30,
          zodiac_sign: 'Leo',
          photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'],
          bio: 'Tech entrepreneur with a passion for innovation and adventure.',
          interests: ['Technology', 'Travel', 'Fitness'],
          industry: 'Technology',
          job_title: 'Founder',
          location: 'San Francisco, CA',
          merge_score: 92
        },
        {
          id: 'mock-3',
          first_name: 'Maya',
          age: 26,
          zodiac_sign: 'Scorpio',
          photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80'],
          bio: 'Yoga instructor by day, poet by night. Seeking deep connections.',
          interests: ['Yoga', 'Writing', 'Nature'],
          industry: 'Wellness',
          job_title: 'Yoga Instructor',
          location: 'Los Angeles, CA',
          merge_score: 85
        }
      ];
      setMatches(mockProfiles);
    }
    setLoading(false);
  };

  const loadTrendingEnergies = async () => {
    try {
      const response = await axios.get(`${API}/users/trending`);
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} />
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Finding your cosmic matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
      </div>

      {/* Daily Horoscope Ticker */}
      {todayHoroscope && (
        <div style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-center animate-fadeIn">
            <div className="text-center">
              <p className="text-sm font-light tracking-wide" style={{ color: 'var(--text-primary)' }}>
                {todayHoroscope.message_short || todayHoroscope.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 select-none" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none', userSelect: 'none' }}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-end mb-2">
            <div className="flex items-center gap-2">
              {/* Dev Season Toggle */}
              {(() => {
                const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
                const showDev = (typeof window !== 'undefined' && window.location.hostname === 'localhost') || (qs && qs.get('dev') === '1');
                return showDev ? (
                  <DevSeasonToggle />
                ) : null;
              })()}
              <button style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h2 className="text-3xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>Merge</h2>
          {/* Filter Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveFilter('compatible')}
              className="px-6 py-2 rounded-full text-sm transition-all font-medium"
              style={{
                backgroundColor: activeFilter === 'compatible' ? 'var(--accent-primary)' : 'var(--surface-default)',
                color: activeFilter === 'compatible' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== 'compatible') {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== 'compatible') {
                  e.currentTarget.style.backgroundColor = 'var(--surface-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              Compatible Today
            </button>
            <button
              onClick={() => setActiveFilter('trending')}
              className="px-6 py-2 rounded-full text-sm transition-all font-medium"
              style={{
                backgroundColor: activeFilter === 'trending' ? 'var(--accent-primary)' : 'var(--surface-default)',
                color: activeFilter === 'trending' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== 'trending') {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== 'trending') {
                  e.currentTarget.style.backgroundColor = 'var(--surface-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
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
                <h3 className="text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>No matches yet</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>Check back later for more cosmic connections</p>
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((match) => {
                  const age = calculateAge(match.birth_date);
                  const compatibility = Math.round(match.compatibility_score || 75);
                  return (
                    <div
                      key={match.id}
                      onClick={() => handleProfileClick(match)}
                      className="flex items-center gap-6 p-4 rounded-2xl transition-all cursor-pointer group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-default)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Profile Photo */}
                      <div
                        className="w-24 h-24 rounded-2xl bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${match.photos?.[0] || 'https://via.placeholder.com/200'})` }}
                      />
                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>
                          {match.first_name} {match.last_name || 'Owens'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span>{compatibility}% Merge Score</span>
                        </div>
                      </div>
                      {/* Arrow Icon */}
                      <div className="transition-colors" style={{ color: 'var(--text-tertiary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>
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
                <h3 className="text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>No trending energies yet</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>Active and engaged users will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {trendingUsers.map((match) => {
                  const age = calculateAge(match.birth_date);
                  const compatibility = Math.round(match.compatibility_score || 75);
                  const energyScore = match.trending_energy_score || 0;
                  return (
                    <div
                      key={match.id}
                      onClick={() => handleProfileClick(match)}
                      className="relative flex items-center gap-6 p-4 rounded-2xl transition-all cursor-pointer group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-default)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Trending Badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-primary)' }}>
                        <Zap className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>{energyScore.toFixed(0)}% Energy</span>
                      </div>
                      {/* Profile Photo */}
                      <div
                        className="w-24 h-24 rounded-2xl bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${match.photos?.[0] || 'https://via.placeholder.com/200'})`, border: '2px solid var(--accent-primary)', opacity: 0.3 }}
                      />
                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>
                          {match.first_name} {match.last_name || 'Owens'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
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
