import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Heart, X, Info, MapPin, Briefcase, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function ModernDashboard({ user, logout }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await axios.get(`${API}/api/users/potential-matches`);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
    setLoading(false);
  };

  const currentMatch = matches[currentIndex];

  const handleLike = async () => {
    if (!currentMatch) return;
    setSwipeDirection('right');
    
    try {
      await axios.post(`${API}/api/users/like/${currentMatch.id}`);
    } catch (error) {
      console.error('Error liking:', error);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
      setCurrentIndex(currentIndex + 1);
    }, 300);
  };

  const handlePass = async () => {
    if (!currentMatch) return;
    setSwipeDirection('left');

    try {
      await axios.post(`${API}/api/users/pass/${currentMatch.id}`);
    } catch (error) {
      console.error('Error passing:', error);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
      setCurrentIndex(currentIndex + 1);
    }, 300);
  };

  const handleDragStart = (e) => {
    setDragStart(e.clientX || e.touches[0].clientX);
  };

  const handleDragMove = (e) => {
    if (dragStart === null) return;
    const currentX = e.clientX || e.touches[0].clientX;
    const diff = currentX - dragStart;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handlePass();
      }
    }
    setDragStart(null);
    setDragOffset(0);
  };

  const photos = currentMatch?.profile_photos 
    ? [currentMatch.profile_photos.face_photo, currentMatch.profile_photos.body_photo, currentMatch.profile_photos.lifestyle_photo].filter(Boolean)
    : [];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your cosmic matches...</p>
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">You've seen everyone!</h2>
          <p className="text-gray-600 mb-6">Check back later for more cosmic connections</p>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-rose-500 to-pink-600">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

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

  const age = calculateAge(currentMatch.birth_date);
  const compatibility = currentMatch.compatibility_score || Math.floor(Math.random() * 30) + 70;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              A Sign
            </div>
            <div className="text-xl">{currentMatch.zodiac_sign}</div>
          </div>
          <button 
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="pt-20 pb-24 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md relative">
          {/* Profile Card */}
          <div
            className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
              swipeDirection === 'right' ? 'translate-x-[150%] rotate-12 opacity-0' :
              swipeDirection === 'left' ? '-translate-x-[150%] -rotate-12 opacity-0' : ''
            }`}
            style={{
              transform: dragOffset !== 0 ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)` : '',
              transition: dragStart === null ? 'transform 0.3s ease-out' : 'none'
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* Photo Section */}
            <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300">
              {photos.length > 0 && (
                <img 
                  src={photos[currentPhotoIndex]} 
                  alt={currentMatch.first_name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Photo Navigation Overlay */}
              <div className="absolute inset-0 flex">
                <button 
                  onClick={prevPhoto}
                  className="flex-1 cursor-w-resize"
                  disabled={photos.length <= 1}
                />
                <button 
                  onClick={nextPhoto}
                  className="flex-1 cursor-e-resize"
                  disabled={photos.length <= 1}
                />
              </div>

              {/* Photo Indicators */}
              {photos.length > 1 && (
                <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
                  {photos.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        idx === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Compatibility Badge */}
              <div className="absolute top-6 right-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  {compatibility}% Match
                </div>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">
                      {currentMatch.first_name} {currentMatch.last_name?.charAt(0)}.
                    </h2>
                    <div className="flex items-center gap-2 text-lg">
                      <span>{age}</span>
                      <span>•</span>
                      <span>{currentMatch.zodiac_sign}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <Info className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {currentMatch.current_location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{currentMatch.current_location.city}</span>
                    </div>
                  )}
                  {currentMatch.industry && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{currentMatch.industry}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details Panel */}
            {showDetails && (
              <div className="p-6 max-h-64 overflow-y-auto bg-white">
                {currentMatch.bio && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-700">{currentMatch.bio}</p>
                  </div>
                )}

                {currentMatch.interests && currentMatch.interests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.interests.map((interest, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentMatch.relationship_goals && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Looking for</h3>
                    <p className="text-gray-700 capitalize">
                      {currentMatch.relationship_goals.replace('_', ' ')}
                    </p>
                  </div>
                )}

                {currentMatch.lifestyle_sliders && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Lifestyle</h3>
                    <div className="space-y-2">
                      {Object.entries(currentMatch.lifestyle_sliders).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 flex-1 capitalize">
                            {key.replace('_', ' ')}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <div 
                                key={dot}
                                className={`w-2 h-2 rounded-full ${
                                  dot <= value ? 'bg-rose-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Swipe Direction Indicators */}
          {dragOffset > 50 && (
            <div className="absolute top-1/3 left-8 transform -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl shadow-2xl rotate-12">
              LIKE
            </div>
          )}
          {dragOffset < -50 && (
            <div className="absolute top-1/3 right-8 transform -translate-y-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl shadow-2xl -rotate-12">
              NOPE
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-6">
            {/* Pass Button */}
            <button
              onClick={handlePass}
              className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 text-gray-600 hover:border-red-500 hover:bg-red-50 hover:text-red-500 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center"
            >
              <X className="w-8 h-8" strokeWidth={2.5} />
            </button>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-2xl active:scale-95 flex items-center justify-center"
            >
              <Heart className="w-9 h-9" fill="white" strokeWidth={2} />
            </button>

            {/* Info Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center"
            >
              <Info className="w-7 h-7" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}