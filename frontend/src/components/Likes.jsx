import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Sparkles, MapPin, Briefcase } from 'lucide-react';
import BottomNav from './BottomNav';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;
axios.defaults.withCredentials = true;

export default function Likes({ user }) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    try {
      // TODO: Replace with actual API endpoint for likes
      // For now, using potential matches as placeholder
      const response = await axios.get(`${API}/users/potential-matches`);
      setLikes(response.data.slice(0, 10)); // Show first 10 as demo
    } catch (error) {
      console.error('Error loading likes:', error);
    }
    setLoading(false);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 25;
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
          <Heart className="w-12 h-12 animate-pulse mx-auto mb-4" style={{ color: '#00D9FF' }} />
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading your admirers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#00D9FF' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: '#00D9FF' }}></div>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 select-none relative z-10" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h2 className="text-3xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>Likes</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {likes.length} {likes.length === 1 ? 'person' : 'people'} liked you
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {likes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">💫</div>
              <h3 className="text-2xl font-light mb-3" style={{ color: 'var(--text-primary)' }}>No likes yet</h3>
              <p className="mb-8" style={{ color: 'var(--text-tertiary)' }}>Keep swiping to find your matches!</p>
              <button 
                onClick={() => navigate('/home')} 
                className="px-8 py-3 rounded-full font-medium transition-all"
                style={{ backgroundColor: '#00D9FF', color: '#000000' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.6)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {likes.map((person) => {
                const age = calculateAge(person.birth_date);
                const compatibility = Math.round(person.compatibility_score || 75);
                
                return (
                  <div
                    key={person.id}
                    onClick={() => {
                      // TODO: Navigate to profile detail or initiate match
                      console.log('Clicked on:', person.first_name);
                    }}
                    className="relative rounded-2xl overflow-hidden transition-all cursor-pointer group"
                    style={{
                      backgroundColor: 'var(--surface-default)',
                      border: '1px solid var(--border-subtle)',
                      aspectRatio: '3/4'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00D9FF';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 217, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* "Liked You" Badge */}
                    <div 
                      className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                      style={{
                        backgroundColor: 'rgba(0, 217, 255, 0.2)',
                        border: '1px solid #00D9FF',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Heart className="w-3.5 h-3.5" style={{ color: '#00D9FF', fill: '#00D9FF' }} />
                      <span className="text-xs font-medium" style={{ color: '#00D9FF' }}>Liked you</span>
                    </div>

                    {/* Profile Photo */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${person.photos?.[0] || 'https://via.placeholder.com/400x600'})`,
                        filter: 'brightness(0.9)'
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 40%, transparent 70%)'
                      }}
                    />

                    {/* Profile Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-light" style={{ color: '#FFFFFF' }}>
                          {person.first_name}, {age}
                        </h3>
                        {person.is_photo_verified && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00D9FF' }}>
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </div>

                      {/* Merge Score */}
                      <div 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
                        style={{
                          backgroundColor: 'rgba(0, 217, 255, 0.15)',
                          border: '1px solid rgba(0, 217, 255, 0.3)'
                        }}
                      >
                        <Sparkles className="w-3 h-3" style={{ color: '#00D9FF' }} />
                        <span className="text-xs font-medium" style={{ color: '#00D9FF' }}>
                          {compatibility}% Match
                        </span>
                      </div>

                      {/* Location & Occupation */}
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {person.lifestyle_factors?.occupation && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{person.lifestyle_factors.occupation}</span>
                          </div>
                        )}
                        {person.current_location?.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{person.current_location.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Bio Preview */}
                      {person.bio && (
                        <p 
                          className="text-xs mt-2 line-clamp-2"
                          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                        >
                          {person.bio}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav currentTab="likes" navigate={navigate} />
    </div>
  );
}
