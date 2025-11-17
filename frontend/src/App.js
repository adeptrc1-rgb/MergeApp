import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Calendar } from './components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { CalendarIcon, Heart, X, Star, Sparkles, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import EnhancedOnboarding from './components/EnhancedOnboarding';
import InteractiveOnboarding from './components/InteractiveOnboarding';
import CosmicOnboarding from './components/CosmicOnboarding';
import MergeOnboarding from './components/MergeOnboarding';
import TestOnboarding from './components/TestOnboarding';
import EnhancedDashboard from './components/EnhancedDashboard';
import ModernDashboard from './components/ModernDashboard';
import AstroMatchDashboard from './components/AstroMatchDashboard';
import AstroChat from './components/AstroChat';
import Discover from './components/Discover';
import Home from './components/Home';
import Messages from './components/Messages';
import Connections from './components/Connections';
import Profile from './components/ProfileNew';
import Settings from './components/Settings';
import Store from './components/Store';
import TestPage from './components/TestPage';
import MergeLogo from './components/MergeLogo';
import LoginApp from './components/LoginApp';
const AutoTestLogin = React.lazy(() => import('./components/AutoTestLogin'));

import MainDashboard from './components/MainDashboard';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Set global axios defaults
axios.defaults.withCredentials = true;
const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Auth check successful:', userData);
        setUser(userData);
        setNeedsOnboarding(userData.needs_onboarding || false);
      } else {
        console.log('Auth check failed:', response.status);
        setUser(null);
      }
    } catch (error) {
      console.log('Auth check error:', error);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email = 'testuser@asign.com') => {
    try {
      console.log('[LOGIN] Sending request to:', `${API}/auth/test-login`);
      const response = await fetch(`${API}/auth/test-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      console.log('[LOGIN] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[LOGIN] Response data:', data);
        if (data.success) {
          console.log('[LOGIN] Success! Setting user and checking auth...');
          // Wait for cookie to be set, then check auth
          setTimeout(async () => {
            await checkAuth();
          }, 500);
          return true;
        } else {
          console.log('[LOGIN] Success flag was false');
        }
      } else {
        console.log('[LOGIN] Response not OK:', response.status, response.statusText);
      }
      return false;
    } catch (error) {
      console.error('[LOGIN] Login error:', error);
      return false;
    }
  };

  useEffect(() => {
    // Only check auth on initial load, not when navigating
    if (!user) {
      checkAuth();
    }
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.log('Logout error (non-critical):', error);
    }
    setUser(null);
    setNeedsOnboarding(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, needsOnboarding, setNeedsOnboarding, checkAuth, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

// Landing Page - Tinder Style Login
function LandingPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'verify', 'social'
  const [loading, setLoading] = useState(false);
  const { checkAuth } = React.useContext(AuthContext);

  const handleGoogleLogin = () => {
    const redirectUrl = encodeURIComponent(window.location.origin + '/session');
    window.location.href = `https://auth.emergentagent.com/?redirect=${redirectUrl}`;
  };

  const { setUser, setNeedsOnboarding: setNeedsOnboardingContext } = React.useContext(AuthContext);

  const handleTestLogin = () => {
    console.log('[TEST LOGIN] Setting mock user for testing...');
    
    // Mock user data for testing the interface
    const mockUser = {
      id: 'test-user-123',
      email: 'testuser@asign.com',
      first_name: 'Test',
      last_name: 'User',
      birth_date: '1995-06-15',
      zodiac_sign: 'Leo',
      photos: ['https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&q=80'],
      bio: 'Test user for interface testing',
      interests: ['music', 'coffee', 'travel'],
      industry: 'Technology',
      job_title: 'Software Engineer',
      location: 'San Francisco, CA',
      profile_completed: true,
      star_coins: 5000,
      super_likes: 5,
      profile_boosts: 2,
      direct_messages: 10,
      is_premium: false,
      vibe_song: {
        title: 'Test Song',
        artist: 'Test Artist',
        preview_url: null
      }
    };
    
    setUser(mockUser);
    setNeedsOnboardingContext(false);
    navigate('/home');
    console.log('[TEST LOGIN] Mock user set, navigating to /home');
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    try {
      // TODO: Implement SMS sending with Twilio
      // await axios.post(`${API}/auth/send-otp`, { phone_number: phoneNumber });
      setStep('verify');
    } catch (error) {
      console.error('SMS send error:', error);
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    setLoading(true);
    try {
      // TODO: Implement OTP verification
      // await axios.post(`${API}/auth/verify-otp`, { phone_number: phoneNumber, code: verificationCode });
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Verification error:', error);
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Animated Card Container */}
      <div 
        className="w-full max-w-md"
        style={{
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div 
          className="rounded-xl p-8 sm:p-10"
          style={{
            backgroundColor: '#171717',
            border: '1px solid #404040',
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)'
          }}
        >
          {/* Logo with Breathing Animation */}
          <div 
            className="flex justify-center mb-3"
            style={{
              animation: 'breathe 4s ease-in-out infinite'
            }}
          >
            <MergeLogo size="lg" color="#FAFAFA" />
          </div>

          {/* Tagline */}
          <p 
            className="text-center text-sm mb-12"
            style={{ color: '#A3A3A3', letterSpacing: '0.5px' }}
          >
            Design Your Connection
          </p>

          {/* Form Section */}
          <form onSubmit={(e) => { e.preventDefault(); handleTestLogin(); }} className="space-y-6">
            {/* Phone Number Input */}
            {step === 'phone' && (
              <div>
                <label 
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#FAFAFA' }}
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-lg transition-all outline-none"
                  style={{
                    backgroundColor: '#171717',
                    border: '1px solid #404040',
                    color: '#FAFAFA'
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '2px solid #3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid #404040';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            {/* Primary CTA Button */}
            <button
              type="button"
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: loading ? '#525252' : '#3B82F6',
                color: '#FFFFFF',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Connecting...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #404040' }}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span 
                className="px-4"
                style={{ backgroundColor: '#171717', color: '#A3A3A3' }}
              >
                or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Test Login Button */}
            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                color: '#FAFAFA',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2d2d2d';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#262626';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <span>🧪</span>
              <span>Test Login</span>
            </button>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                color: '#FAFAFA',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2d2d2d';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#262626';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <span>G</span>
              <span>Continue with Google</span>
            </button>

            {/* Apple Login (Placeholder) */}
            <button
              disabled
              className="w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <span></span>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Preview Onboarding Button */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #3B82F6',
                color: '#3B82F6'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <span>👁️</span>
              <span>Preview Onboarding</span>
            </button>
          </div>

          {/* Footer */}
          <p 
            className="mt-8 text-xs text-center leading-relaxed"
            style={{ color: '#525252' }}
          >
            By continuing, you agree to our{' '}
            <span style={{ color: '#A3A3A3' }}>Terms & Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* Add Keyframe Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

// Session Handler
function SessionHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setNeedsOnboarding } = React.useContext(AuthContext);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSession = async () => {
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        setProcessing(true);
        const sessionId = sessionIdMatch[1];
        
        // Extract email and name from hash if available
        const emailMatch = hash.match(/email=([^&]+)/);
        const nameMatch = hash.match(/name=([^&]+)/);
        
        const email = emailMatch ? decodeURIComponent(emailMatch[1]) : null;
        const name = nameMatch ? decodeURIComponent(nameMatch[1]) : null;
        
        console.log('Session data:', { sessionId, email, name });
        
        try {
          const response = await axios.post(`${API}/auth/session`, {
            email: email,
            name: name
          }, {
            headers: {
              'X-Session-ID': sessionId
            },
            withCredentials: true
          });
          
          if (response.data.success) {
            // Clean URL first
            window.history.replaceState(null, null, window.location.pathname);
            
            if (response.data.needs_onboarding) {
              navigate('/onboarding', { replace: true });
            } else {
              navigate('/home', { replace: true });
            }
          } else {
            setError('Authentication failed. Please try again.');
            setTimeout(() => navigate('/'), 2000);
          }
        } catch (error) {
          console.error('Session error:', error);
          const errorMsg = error.response?.data?.detail || 'Authentication failed. Please try again.';
          setError(errorMsg);
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        console.log('No session ID found in URL');
        navigate('/');
      }
    };

    handleSession();
  }, [location.hash, navigate, setUser, setNeedsOnboarding]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="flex flex-col items-center p-8">
          {error ? (
            <>
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <X className="w-16 h-16 text-rose-500" />
              </div>
              <p className="text-lg text-gray-600 text-center">{error}</p>
              <p className="text-sm text-gray-400 mt-2">Redirecting...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-gray-600">Aligning your stars...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Onboarding
function Onboarding() {
  const navigate = useNavigate();
  const { setNeedsOnboarding } = React.useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    birth_date: null,
    birth_time: '',
    birth_location: null,
    hometown: null,
    current_location: null,
    bio: '',
    interests: '',
    age_range_min: 18,
    age_range_max: 35,
    max_distance_km: 50,
    use_hometown_as_birth: false
  });
  const [loading, setLoading] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  // Mock location search - in production, use Google Places API or similar
  const searchLocations = (query) => {
    const mockLocations = [
      { city: "New York", country: "United States", state: "NY", latitude: 40.7128, longitude: -74.0060 },
      { city: "Los Angeles", country: "United States", state: "CA", latitude: 34.0522, longitude: -118.2437 },
      { city: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
      { city: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
      { city: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
      { city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 }
    ];
    return mockLocations.filter(loc => 
      loc.city.toLowerCase().includes(query.toLowerCase()) ||
      loc.country.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In production, reverse geocode these coordinates
          setFormData({
            ...formData,
            current_location: {
              city: "Current Location",
              country: "Detected",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          console.log("Location access denied");
        }
      );
    }
  };

  const handleComplete = async () => {
    if (!formData.birth_date) return;
    
    setLoading(true);
    try {
      const profileData = {
        birth_date: format(formData.birth_date, 'yyyy-MM-dd'),
        birth_time: formData.birth_time,
        birth_location: formData.birth_location,
        hometown: formData.hometown,
        current_location: formData.current_location,
        bio: formData.bio,
        interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(i => i) : [],
        age_range_min: formData.age_range_min,
        age_range_max: formData.age_range_max,
        max_distance_km: formData.max_distance_km
      };

      // Use hometown as birth location if selected and birth location not specified
      if (formData.use_hometown_as_birth && formData.hometown && !formData.birth_location) {
        profileData.birth_location = formData.hometown;
      }
      
      await axios.post(`${API}/users/complete-profile`, profileData);
      setNeedsOnboarding(false);
      navigate('/home');
    } catch (error) {
      console.error('Profile completion error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">Create Your Cosmic Profile</CardTitle>
          <CardDescription>Step {step} of 5 - Build your astrology profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step 1: Birth Date & Time */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Birth Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="birth-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.birth_date ? format(formData.birth_date, 'PPP') : "Select your birth date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.birth_date}
                      onSelect={(date) => setFormData({...formData, birth_date: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth_time">Birth Time (Optional - enhances accuracy)</Label>
                <Input
                  id="birth_time"
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                />
                <p className="text-xs text-gray-500">Birth time helps create a more detailed astrological profile</p>
              </div>
              
              <Button 
                onClick={() => setStep(2)} 
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                disabled={!formData.birth_date}
                data-testid="next-step-btn"
              >
                Continue
              </Button>
            </>
          )}
          
          {/* Step 2: Birth Location */}
          {step === 2 && (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Where were you born? (Enhances astrology accuracy)</Label>
                  <p className="text-sm text-gray-500 mb-2">This helps calculate your precise birth chart</p>
                </div>
                
                <Input
                  placeholder="Search birth city..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  data-testid="birth-location-search"
                />
                
                {locationSearch && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {searchLocations(locationSearch).map((location, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0"
                        onClick={() => {
                          setFormData({...formData, birth_location: location});
                          setLocationSearch(`${location.city}, ${location.country}`);
                        }}
                      >
                        <div className="font-medium">{location.city}</div>
                        <div className="text-sm text-gray-500">{location.country} {location.state && `(${location.state})`}</div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use_hometown"
                    checked={formData.use_hometown_as_birth}
                    onChange={(e) => setFormData({...formData, use_hometown_as_birth: e.target.checked})}
                  />
                  <Label htmlFor="use_hometown" className="text-sm">I'll add my hometown instead (we'll use it for birth location)</Label>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(1)} 
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Hometown & Current Location */}
          {step === 3 && (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Hometown (Optional)</Label>
                  <p className="text-sm text-gray-500 mb-2">Where did you grow up?</p>
                </div>
                
                <Input
                  placeholder="Search hometown..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
                
                {locationSearch && (
                  <div className="border rounded-lg max-h-32 overflow-y-auto">
                    {searchLocations(locationSearch).slice(0, 3).map((location, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left p-2 hover:bg-gray-100 border-b last:border-b-0 text-sm"
                        onClick={() => {
                          setFormData({...formData, hometown: location});
                          setLocationSearch(`${location.city}, ${location.country}`);
                        }}
                      >
                        {location.city}, {location.country}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <Label>Current Location</Label>
                  <p className="text-sm text-gray-500 mb-2">Helps find nearby matches</p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={getCurrentLocation}
                      variant="outline"
                      className="flex-1"
                      data-testid="get-location-btn"
                    >
                      📍 Use Current Location
                    </Button>
                  </div>
                  
                  {formData.current_location && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                      ✓ Location detected: {formData.current_location.city}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(2)} 
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Preferences */}
          {step === 4 && (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Age Range Preference</Label>
                  <p className="text-sm text-gray-500 mb-3">Who would you like to meet?</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="age_min" className="text-sm">Minimum Age</Label>
                      <select
                        id="age_min"
                        value={formData.age_range_min}
                        onChange={(e) => setFormData({...formData, age_range_min: parseInt(e.target.value)})}
                        className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                        data-testid="age-min-select"
                      >
                        {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="age_max" className="text-sm">Maximum Age</Label>
                      <select
                        id="age_max"
                        value={formData.age_range_max}
                        onChange={(e) => setFormData({...formData, age_range_max: parseInt(e.target.value)})}
                        className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                        data-testid="age-max-select"
                      >
                        {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Distance Preference</Label>
                  <p className="text-sm text-gray-500 mb-3">How far are you willing to travel for love?</p>
                  
                  <select
                    value={formData.max_distance_km}
                    onChange={(e) => setFormData({...formData, max_distance_km: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                    data-testid="distance-select"
                  >
                    <option value={5}>Within 5 km</option>
                    <option value={10}>Within 10 km</option>
                    <option value={25}>Within 25 km</option>
                    <option value={50}>Within 50 km</option>
                    <option value={100}>Within 100 km</option>
                    <option value={250}>Within 250 km</option>
                    <option value={500}>Within 500 km</option>
                    <option value={1000}>Within 1000 km</option>
                    <option value={5000}>Anywhere</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(3)} 
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(5)}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Step 5: Bio & Interests */}
          {step === 5 && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interests">Your Interests (Optional)</Label>
                  <Input
                    id="interests"
                    value={formData.interests || ''}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    placeholder="e.g. Travel, Music, Yoga, Books, Hiking"
                    data-testid="interests-input"
                  />
                  <p className="text-xs text-gray-500">Separate interests with commas</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Tell us about yourself</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Share what makes you unique, your passions, what you're looking for in a cosmic connection..."
                    rows={4}
                    data-testid="bio-input"
                  />
                  <p className="text-xs text-gray-500">This helps potential matches understand your personality</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Your Cosmic Profile Summary:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Birth Date: {formData.birth_date ? format(formData.birth_date, 'PPP') : 'Not set'}</li>
                  <li>• Birth Time: {formData.birth_time || 'Not specified'}</li>
                  <li>• Hometown: {formData.hometown ? `${formData.hometown.city}, ${formData.hometown.country}` : 'Not specified'}</li>
                  <li>• Current Location: {formData.current_location ? 'Detected' : 'Not set'}</li>
                  <li>• Age Range: {formData.age_range_min}-{formData.age_range_max} years old</li>
                  <li>• Distance: Within {formData.max_distance_km === 5000 ? 'anywhere' : `${formData.max_distance_km}km`}</li>
                  <li>• Interests: {formData.interests || 'None specified'}</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(4)} 
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                  disabled={loading}
                  data-testid="complete-profile-btn"
                >
                  {loading ? 'Creating Profile...' : 'Complete Profile'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard with Enhanced Swiping
function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showMatch, setShowMatch] = useState(null);

  useEffect(() => {
    loadPotentialMatches();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      const response = await axios.get(`${API}/users/potential-matches`);
      setPotentialMatches(response.data);
      setCurrentUser(response.data[0] || null);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
    setLoading(false);
  };

  const handleSwipe = async (liked) => {
    if (!currentUser || swiping) return;
    
    setSwiping(true);
    try {
      const response = await axios.post(`${API}/users/swipe`, {
        swiped_id: currentUser.id,
        liked: liked
      });
      
      if (response.data.match) {
        setShowMatch({
          partner: currentUser,
          compatibility: response.data.compatibility,
          geographic_score: response.data.geographic_score,
          distance_km: response.data.distance_km
        });
      }
      
      const remainingMatches = potentialMatches.slice(1);
      setPotentialMatches(remainingMatches);
      setCurrentUser(remainingMatches[0] || null);
      
    } catch (error) {
      console.error('Swipe error:', error);
    }
    setSwiping(false);
  };

  const getZodiacEmoji = (sign) => {
    const emojis = {
      aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
      leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
      sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
    };
    return emojis[sign] || '⭐';
  };

  const formatDistance = (km) => {
    if (!km) return null;
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    if (km < 100) return `${Math.round(km)}km away`;
    return `${Math.round(km)}km away`;
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
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
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-lg text-gray-600">Finding your cosmic matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100">
      {/* Clean Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-rose-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">
            A Sign
          </h1>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/settings')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
              data-testid="settings-btn"
            >
              ⚙️
            </Button>
            <Badge variant="outline" className="border-rose-300 text-rose-700">
              {getZodiacEmoji(user?.zodiac_sign)} {user?.zodiac_sign?.toUpperCase()}
            </Badge>
            <Button 
              onClick={logout} 
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex justify-center">
        {currentUser ? (
          <div className="w-full max-w-md">
            {/* Clean Profile Card */}
            <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden border-none">
              {currentUser.picture && (
                <div className="h-96 bg-gradient-to-b from-rose-200 to-pink-200 flex items-center justify-center relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={currentUser.picture} />
                    <AvatarFallback className="text-4xl bg-gradient-to-r from-rose-400 to-pink-500 text-white">
                      {currentUser.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Distance Badge */}
                  {currentUser.distance_km && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {formatDistance(currentUser.distance_km)}
                    </div>
                  )}
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  {/* Name and Age */}
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2" data-testid="user-name">
                    {currentUser.name} {calculateAge(currentUser.birth_date) && (
                      <span className="text-xl text-gray-600">{calculateAge(currentUser.birth_date)}</span>
                    )}
                  </h2>
                  
                  {/* Zodiac Sign */}
                  <div className="flex items-center justify-center mb-3">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-1">
                      {getZodiacEmoji(currentUser.zodiac_sign)} {currentUser.zodiac_sign?.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Hometown */}
                  {currentUser.hometown && (
                    <div className="text-sm text-gray-600 mb-3">
                      🏡 From {currentUser.hometown.city}, {currentUser.hometown.country}
                    </div>
                  )}

                  {/* Interests (if available) */}
                  {currentUser.interests && currentUser.interests.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap justify-center gap-2">
                        {currentUser.interests.slice(0, 6).map((interest, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-gray-300 text-gray-600">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Bio */}
                {currentUser.bio && (
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {currentUser.bio}
                  </p>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-center gap-8 mt-6">
                  <Button
                    onClick={() => handleSwipe(false)}
                    disabled={swiping}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
                    data-testid="pass-btn"
                  >
                    <X className="w-8 h-8" />
                  </Button>
                  
                  <Button
                    onClick={() => handleSwipe(true)}
                    disabled={swiping}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
                    data-testid="like-btn"
                  >
                    <Heart className="w-8 h-8" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-8">
              <div className="mb-4">
                <Moon className="w-16 h-16 mx-auto text-rose-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No More Matches
                </h3>
                <p className="text-gray-600">
                  Check back later for new cosmic connections!
                </p>
              </div>
              <Button 
                onClick={loadPotentialMatches}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              >
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Clean Match Modal */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardContent className="text-center p-8">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  It's a Match! ✨
                </h2>
                <p className="text-gray-600 mb-4">
                  You and {showMatch.partner.name} liked each other
                </p>
                
                {/* Compatibility Score */}
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-2 mb-4">
                  🌟 {Math.round(showMatch.compatibility.score)}% Compatible
                </Badge>

                {showMatch.distance_km && (
                  <p className="text-sm text-gray-600 mb-4">
                    📍 {formatDistance(showMatch.distance_km)}
                  </p>
                )}
              </div>
              
              <div className="bg-rose-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  {showMatch.compatibility.report}
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg mb-6 text-xs text-yellow-800">
                ⏰ You have 72 hours to start chatting before this match expires!
              </div>
              
              <Button 
                onClick={() => setShowMatch(null)}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                data-testid="continue-swiping-btn"
              >
                Continue Swiping
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, needsOnboarding } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (needsOnboarding || user.needs_onboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function EnhancedDashboardWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <AstroMatchDashboard user={user} logout={logout} />;
}

function AstroChatWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <AstroChat user={user} logout={logout} />;
}

function DiscoverWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Discover user={user} logout={logout} />;
}

function HomeWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Home user={user} logout={logout} />;
}

function MessagesWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Messages user={user} logout={logout} />;
}

function ConnectionsWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Connections user={user} logout={logout} />;
}

function ProfileWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Profile user={user} logout={logout} />;
}

function StoreWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Store user={user} logout={logout} />;
}

function SettingsWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Settings user={user} logout={logout} />;
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/login" element={<LoginApp />} />
            <Route path="/session" element={<SessionHandler />} />
            <Route path="/onboarding" element={<MergeOnboarding />} />
            <Route path="/test-onboarding" element={<TestOnboarding />} />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <EnhancedDashboardWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discover" 
              element={
                <ProtectedRoute>
                  <DiscoverWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomeWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagesWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/connections" 
              element={
                <ProtectedRoute>
                  <ConnectionsWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/store" 
              element={
                <ProtectedRoute>
                  <StoreWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <AstroChatWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/autologin" 
              element={
                <React.Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading…</div>}>
                  <AutoTestLogin />
                </React.Suspense>
              } 
            />
            <Route 
              path="/chat/:matchId" 
              element={
                <ProtectedRoute>
                  <AstroChatWrapper />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;