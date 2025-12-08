import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Heart, X, Star, Sparkles, Moon, Sun, MapPin, Briefcase, Target, Users, Info } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LIFESTYLE_LABELS = {
  fitness_health: { label: 'Fitness & Health', icon: '💪' },
  career_ambition: { label: 'Career Ambition', icon: '🚀' },
  social_energy: { label: 'Social Energy', icon: '🎉' },
  travel_adventure: { label: 'Travel & Adventure', icon: '✈️' },
  nightlife_lifestyle: { label: 'Nightlife', icon: '🍷' },
  family_future: { label: 'Family & Future', icon: '👨‍👩‍👧‍👦' },
  dating_approach: { label: 'Dating Approach', icon: '💕' },
  passions_hobbies: { label: 'Passions & Hobbies', icon: '🎨' }
};

export default function EnhancedDashboard({ user, logout }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showMatch, setShowMatch] = useState(null);
  const [showCompatibility, setShowCompatibility] = useState(null);
  const [compatibilityData, setCompatibilityData] = useState(null);

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

  const showCompatibilityBreakdown = async (userId) => {
    try {
      const response = await axios.get(`${API}/users/compatibility-preview/${userId}`);
      setCompatibilityData(response.data);
      setShowCompatibility(currentUser);
    } catch (error) {
      console.error('Error loading compatibility:', error);
    }
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

  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLifestyleValue = (value) => {
    const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    return labels[value - 1] || 'Medium';
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
            <Button 
              onClick={() => navigate('/settings')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
            >
              ⚙️
            </Button>
            <Badge variant="outline" className="border-rose-300 text-rose-700">
              {getZodiacEmoji(user?.zodiac_sign)} {user?.zodiac_sign?.toUpperCase()}
            </Badge>
            <Button onClick={logout} variant="ghost" className="text-gray-600 hover:text-gray-800">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex justify-center">
        {currentUser ? (
          <div className="w-full max-w-md">
            {/* Enhanced Profile Card */}
            <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden border-none">
              {/* Profile Header */}
              <div className="h-96 bg-gradient-to-b from-rose-200 to-pink-200 flex items-center justify-center relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={currentUser.profile_photos?.face_photo || currentUser.picture} />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-rose-400 to-pink-500 text-white">
                    {currentUser.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Distance & Compatibility Badges */}
                <div className="absolute top-4 right-4 space-y-2">
                  {currentUser.distance_km && (
                    <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {formatDistance(currentUser.distance_km)}
                    </div>
                  )}
                  {currentUser.compatibility_score && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(currentUser.compatibility_score)}`}>
                      {Math.round(currentUser.compatibility_score)}% Match
                    </div>
                  )}
                </div>

                {/* Compatibility Info Button */}
                <Button
                  onClick={() => showCompatibilityBreakdown(currentUser.id)}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  size="sm"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        {currentUser.name} {currentUser.age && (
                          <span className="text-xl text-gray-600">{currentUser.age}</span>
                        )}
                      </h2>
                      
                      <div className="flex items-center justify-center mb-3">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-1">
                          {getZodiacEmoji(currentUser.zodiac_sign)} {currentUser.zodiac_sign?.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Industry & Location */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {currentUser.industry && (
                          <div className="flex items-center justify-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{currentUser.industry}</span>
                          </div>
                        )}
                        {currentUser.hometown && (
                          <div className="flex items-center justify-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>From {currentUser.hometown.city}</span>
                          </div>
                        )}
                        {currentUser.relationship_goals && (
                          <div className="flex items-center justify-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>Looking for {currentUser.relationship_goals}</span>
                          </div>
                        )}
                      </div>

                      {/* Interests */}
                      {currentUser.interests && currentUser.interests.length > 0 && (
                        <div className="mt-4">
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
                      <p className="text-gray-600 text-center leading-relaxed">
                        {currentUser.bio}
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="lifestyle" className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-gray-800">Lifestyle & Values</h3>
                      <p className="text-sm text-gray-600">See how compatible you are</p>
                    </div>
                    
                    {/* Mock lifestyle data - in real app this would come from backend */}
                    <div className="space-y-3">
                      {Object.entries(LIFESTYLE_LABELS).slice(0, 4).map(([key, config]) => {
                        const value = Math.floor(Math.random() * 5) + 1; // Mock data
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={value * 20} className="w-16 h-2" />
                              <span className="text-xs text-gray-600 w-16">{getLifestyleValue(value)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-gray-800">More About {currentUser.name}</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{currentUser.age || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium">{currentUser.industry || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Looking for:</span>
                        <span className="font-medium">{currentUser.relationship_goals || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-medium">{formatDistance(currentUser.distance_km) || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Compatibility:</span>
                        <span className="font-medium">{Math.round(currentUser.compatibility_score || 0)}%</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Action Buttons */}
                <div className="flex justify-center gap-8 mt-6">
                  <Button
                    onClick={() => handleSwipe(false)}
                    disabled={swiping}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
                  >
                    <X className="w-8 h-8" />
                  </Button>
                  
                  <Button
                    onClick={() => handleSwipe(true)}
                    disabled={swiping}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg transform hover:scale-110 transition-all duration-200"
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
                  It's a Match! ✨
                </h2>
                <p className="text-gray-600 mb-4">
                  You and {showMatch.partner.name} liked each other
                </p>
                
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
                ⏰ You have 24 hours to start chatting before this match expires!
              </div>
              
              <Button 
                onClick={() => setShowMatch(null)}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              >
                Continue Swiping
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compatibility Breakdown Modal */}
      <Dialog open={!!showCompatibility} onOpenChange={() => setShowCompatibility(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compatibility with {showCompatibility?.name}</DialogTitle>
            <DialogDescription>
              See how well you match across different areas
            </DialogDescription>
          </DialogHeader>
          
          {compatibilityData && (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getCompatibilityColor(compatibilityData.compatibility_score)}`}>
                  {Math.round(compatibilityData.compatibility_score)}% Overall Match
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Compatibility Report:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {compatibilityData.compatibility_report}
                </p>
              </div>

              {compatibilityData.lifestyle_breakdown && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Lifestyle Compatibility:</h4>
                  <div className="space-y-2">
                    {Object.entries(compatibilityData.lifestyle_breakdown.breakdown).slice(0, 4).map(([key, data]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span>{LIFESTYLE_LABELS[key]?.icon}</span>
                          <span>{LIFESTYLE_LABELS[key]?.label}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress value={data.field_score} className="w-16 h-2" />
                          <span className="text-xs text-gray-600 w-8">{Math.round(data.field_score)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}