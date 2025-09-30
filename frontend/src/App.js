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
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
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

// Landing Page
function LandingPage() {
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  
  const handleLogin = () => {
    const redirectUrl = encodeURIComponent(window.location.origin + '/dashboard');
    window.location.href = `https://auth.emergentagent.com/?redirect=${redirectUrl}`;
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
        {/* Custom CSS Logo with breathing animation */}
        <div className="mb-16 text-center">
          <h1 className="text-6xl font-serif text-white mb-2 drop-shadow-2xl relative animate-logo-breathe" style={{
            fontFamily: "'Dancing Script', cursive",
            textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(255,255,255,0.3)',
            filter: 'drop-shadow(0 0 25px rgba(255,255,255,0.6))'
          }}>
            <span className="bg-gradient-to-r from-white via-pink-100 to-rose-200 bg-clip-text text-transparent relative">
              A Sign
            </span>
            {/* Subtle glow effect for elegance */}
            <div className="absolute inset-0 text-white/50 blur-sm -z-10" style={{
              fontFamily: "'Dancing Script', cursive"
            }}>
              A Sign
            </div>
          </h1>
        </div>
        
        {/* Login Form */}
        <div className="w-full max-w-sm space-y-6">
          {/* Username Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="white"/>
                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="white"/>
              </svg>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="USERNAME"
              className="w-full bg-transparent border-none px-12 py-4 text-white placeholder-white/90 text-sm font-medium tracking-widest focus:outline-none"
              style={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: '0.1em'
              }}
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H5V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V11Z" fill="white"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <input
              type="password"
              placeholder="••••••"
              className="w-full bg-transparent border-none px-12 py-4 text-white placeholder-white/90 text-sm font-medium tracking-widest focus:outline-none"
              style={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: '0.15em'
              }}
            />
          </div>

          {/* Location Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M7 7H17" stroke="white" strokeWidth="2"/>
                <path d="M7 11H17" stroke="white" strokeWidth="2"/>
                <path d="M7 15H12" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="SELECT LOCATION"
              className="w-full bg-transparent border-none px-12 py-4 text-white placeholder-white/90 text-sm font-medium tracking-widest focus:outline-none"
              style={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: '0.1em'
              }}
            />
          </div>

          {/* Login Button */}
          <Button 
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 hover:from-gray-500 hover:via-gray-400 hover:to-gray-600 text-black font-bold py-4 rounded-lg text-base shadow-2xl transition-all duration-300 mt-8 border border-gray-600"
            style={{
              background: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 30%, #374151 70%, #111827 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
            data-testid="login-btn"
          >
            LOGIN
          </Button>
        </div>

        {/* Footer Links */}
        <div className="flex justify-between items-center w-full max-w-sm mt-12 text-white/90 text-sm">
          <button className="hover:text-white transition-colors">
            Forgot Password?
          </button>
          <button onClick={handleLogin} className="hover:text-white transition-colors">
            NOT A MEMBER? REGISTER
          </button>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-white/60 text-xs text-center">
          © 2024 A Sign. All rights reserved.
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
            }
          });
          
          if (response.data.success) {
            if (response.data.needs_onboarding) {
              navigate('/onboarding');
            } else {
              navigate('/dashboard');
            }
            
            // Clean URL
            window.history.replaceState(null, null, window.location.pathname);
            
            // Refresh auth
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        } catch (error) {
          console.error('Session error:', error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    handleSession();
  }, [location.hash, navigate, setUser, setNeedsOnboarding]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="flex flex-col items-center p-8">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Aligning your stars...</p>
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
    birth_location: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!formData.birth_date) return;
    
    setLoading(true);
    try {
      const profileData = {
        birth_date: format(formData.birth_date, 'yyyy-MM-dd'),
        birth_time: formData.birth_time,
        birth_location: formData.birth_location,
        bio: formData.bio
      };
      
      await axios.post(`${API}/users/complete-profile`, profileData);
      setNeedsOnboarding(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile completion error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">Complete Your Profile</CardTitle>
          <CardDescription>Help us find your perfect cosmic match</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                      {formData.birth_date ? format(formData.birth_date, 'PPP') : "Pick your birth date"}
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
                <Label htmlFor="birth_time">Birth Time (Optional)</Label>
                <Input
                  id="birth_time"
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                  placeholder="12:00"
                />
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
          
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="birth_location">Birth Location (Optional)</Label>
                <Input
                  id="birth_location"
                  value={formData.birth_location}
                  onChange={(e) => setFormData({...formData, birth_location: e.target.value})}
                  placeholder="City, Country"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Tell us about yourself</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="What makes you unique..."
                  rows={4}
                />
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
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                  disabled={loading}
                  data-testid="complete-profile-btn"
                >
                  {loading ? 'Creating...' : 'Complete Profile'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard with Swiping
function Dashboard() {
  const { user, logout } = React.useContext(AuthContext);
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
          compatibility: response.data.compatibility
        });
      }
      
      // Move to next user
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
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-rose-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">
            A Sign
          </h1>
          <div className="flex items-center gap-4">
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
            {/* Profile Card */}
            <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden border-none">
              {currentUser.picture && (
                <div className="h-96 bg-gradient-to-b from-rose-200 to-pink-200 flex items-center justify-center">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={currentUser.picture} />
                    <AvatarFallback className="text-4xl bg-gradient-to-r from-rose-400 to-pink-500 text-white">
                      {currentUser.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2" data-testid="user-name">
                    {currentUser.name}
                  </h2>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-1">
                    {getZodiacEmoji(currentUser.zodiac_sign)} {currentUser.zodiac_sign?.toUpperCase()}
                  </Badge>
                </div>
                
                {currentUser.bio && (
                  <p className="text-gray-600 text-center mb-4 leading-relaxed">
                    {currentUser.bio}
                  </p>
                )}
                
                <div className="flex justify-center gap-8 mt-6">
                  <Button
                    onClick={() => handleSwipe(false)}
                    disabled={swiping}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg"
                    data-testid="pass-btn"
                  >
                    <X className="w-8 h-8" />
                  </Button>
                  
                  <Button
                    onClick={() => handleSwipe(true)}
                    disabled={swiping}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg"
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

      {/* Match Modal */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardContent className="text-center p-8">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  It's a Match!
                </h2>
                <p className="text-gray-600 mb-4">
                  You and {showMatch.partner.name} liked each other
                </p>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-2">
                  {Math.round(showMatch.compatibility.score)}% Compatible
                </Badge>
              </div>
              
              <div className="bg-rose-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  {showMatch.compatibility.report}
                </p>
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

// Protected Route
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

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/session" element={<SessionHandler />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
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