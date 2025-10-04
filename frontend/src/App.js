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
import EnhancedDashboard from './components/EnhancedDashboard';
import ModernDashboard from './components/ModernDashboard';
import AstroMatchDashboard from './components/AstroMatchDashboard';
import AstroChat from './components/AstroChat';
import Discover from './components/Discover';
import Home from './components/Home';
import Connections from './components/Connections';
import Profile from './components/Profile';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Configure axios to always send cookies
axios.defaults.withCredentials = true;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
      setNeedsOnboarding(response.data.needs_onboarding);
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    await axios.post(`${API}/auth/logout`);
    setUser(null);
    setNeedsOnboarding(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, needsOnboarding, setNeedsOnboarding, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Landing Page - Tinder Style Login
function LandingPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'verify', 'social'
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    const redirectUrl = encodeURIComponent(window.location.origin + '/session');
    window.location.href = `https://auth.emergentagent.com/?redirect=${redirectUrl}`;
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      // Login with test credentials
      const response = await axios.post(`${API}/auth/test-login`, {
        email: 'testuser@asign.com'
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Small delay to ensure cookie is set, then redirect
        setTimeout(() => {
          window.location.href = '/home';
        }, 500);
      }
    } catch (error) {
      console.error('Test login error:', error);
      alert('Test login failed. Please try again.');
      setLoading(false);
    }
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
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Animated sunset wallpaper background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-pulse-slow"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1495567720989-cebdbdd97913')`,
          filter: 'brightness(0.8)',
          animation: 'subtle-move 20s ease-in-out infinite, color-shift 15s ease-in-out infinite'
        }}
      ></div>
      
      {/* Moving gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/20 via-orange-300/10 via-red-400/10 via-pink-400/10 to-purple-900/20 animate-gradient-shift"></div>
      
      {/* Floating particles/stars effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
        <div className="star star-4"></div>
        <div className="star star-5"></div>
      </div>
      
      {/* Status bar simulation */}
      <div className="w-full h-6 bg-transparent relative z-10"></div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        {/* Pure White Logo with breathing animation */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-serif text-white mb-2 drop-shadow-2xl relative animate-logo-breathe" style={{
            fontFamily: "'Dancing Script', cursive",
            textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(255,255,255,0.3)',
            filter: 'drop-shadow(0 0 25px rgba(255,255,255,0.6))',
            color: 'white'
          }}>
            A Sign
            {/* Subtle white glow effect */}
            <div className="absolute inset-0 text-white/30 blur-sm -z-10" style={{
              fontFamily: "'Dancing Script', cursive"
            }}>
              A Sign
            </div>
          </h1>
        </div>

        {/* Login Methods */}
        <div className="w-full max-w-sm space-y-4">
          
          {/* Phone Number Step */}
          {step === 'phone' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-medium text-white mb-2">Get Started</h2>
                <p className="text-white/80 text-sm">Everything led you here</p>
              </div>

              {/* Phone Input */}
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full px-6 py-4 text-white placeholder-white/70 text-center font-medium focus:outline-none focus:border-white/60 transition-all"
                  data-testid="phone-input"
                />
              </div>

              <Button 
                onClick={handlePhoneSubmit}
                disabled={!phoneNumber || loading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-4 rounded-full text-base shadow-xl transition-all duration-300 disabled:opacity-50"
                data-testid="continue-phone-btn"
              >
                {loading ? 'Sending...' : 'Continue'}
              </Button>

              <div className="text-center text-white/60 text-xs py-2">
                <p>By continuing, you agree to our Terms of Service</p>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-white/30"></div>
                <span className="px-4 text-white/70 text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-white/30"></div>
              </div>

              {/* Social Login Options */}
              <div className="space-y-3">
                <Button 
                  onClick={handleGoogleLogin}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 text-white font-medium py-4 rounded-full text-base transition-all duration-200"
                  data-testid="google-login-btn"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <Button 
                  onClick={handleTestLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400 hover:from-rose-500 hover:via-pink-600 hover:to-orange-500 text-white font-bold py-4 rounded-full text-base transition-all duration-200 shadow-lg"
                  data-testid="test-login-btn"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Test Login (Skip to Dashboard)
                    </>
                  )}
                </Button>

                <Button 
                  className="w-full bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 text-white font-medium py-4 rounded-full text-base transition-all duration-200"
                  data-testid="apple-login-btn"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  Continue with Apple
                </Button>
              </div>
            </>
          )}

          {/* Verification Step */}
          {step === 'verify' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-medium text-white mb-2">Enter Code</h2>
                <p className="text-white/80 text-sm">We sent a code to {phoneNumber}</p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  className="w-full bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-full px-6 py-4 text-white placeholder-white/70 text-center font-medium text-2xl tracking-widest focus:outline-none focus:border-white/60 transition-all"
                  maxLength="6"
                  data-testid="verification-input"
                />
              </div>

              <Button 
                onClick={handleVerifyCode}
                disabled={!verificationCode || loading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-4 rounded-full text-base shadow-xl transition-all duration-300 disabled:opacity-50"
                data-testid="verify-code-btn"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setStep('phone')}
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  ← Back to phone number
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="mt-8 text-white/60 text-xs text-center max-w-xs">
          <p>Trouble signing in? Contact support</p>
        </div>
      </div>
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
        
        try {
          const response = await axios.post(`${API}/auth/session`, {}, {
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
      navigate('/discover');
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

// Settings Page
function Settings() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    age_range_min: user?.age_range_min || 18,
    age_range_max: user?.age_range_max || 35,
    max_distance_km: user?.max_distance_km || 50
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/users/update-preferences`, preferences);
      // Show success message or redirect
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-rose-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
          <div></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Dating Preferences</CardTitle>
            <CardDescription>Adjust who you'd like to meet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Age Range</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label htmlFor="age_min" className="text-sm">Min Age</Label>
                  <select
                    id="age_min"
                    value={preferences.age_range_min}
                    onChange={(e) => setPreferences({...preferences, age_range_min: parseInt(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="age_max" className="text-sm">Max Age</Label>
                  <select
                    id="age_max"
                    value={preferences.age_range_max}
                    onChange={(e) => setPreferences({...preferences, age_range_max: parseInt(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <Label>Maximum Distance</Label>
              <select
                value={preferences.max_distance_km}
                onChange={(e) => setPreferences({...preferences, max_distance_km: parseInt(e.target.value)})}
                className="w-full mt-2 p-2 border rounded-md"
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

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>
      </div>
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

function ConnectionsWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Connections user={user} logout={logout} />;
}

function ProfileWrapper() {
  const { user, logout } = React.useContext(AuthContext);
  return <Profile user={user} logout={logout} />;
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/session" element={<SessionHandler />} />
            <Route path="/onboarding" element={<InteractiveOnboarding />} />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
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
              path="/chat" 
              element={
                <ProtectedRoute>
                  <AstroChatWrapper />
                </ProtectedRoute>
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