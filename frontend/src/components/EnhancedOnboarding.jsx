import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { CalendarIcon, Upload, Camera, User, Heart, MapPin, Briefcase, Target, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LIFESTYLE_SLIDERS = [
  {
    key: 'fitness_health',
    label: 'Fitness & Health',
    description: 'How important is staying active and healthy?',
    leftLabel: 'Relaxed approach',
    rightLabel: 'Very active lifestyle',
    icon: '💪',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    key: 'career_ambition',
    label: 'Career Ambition',
    description: 'How much do you prioritize career growth?',
    leftLabel: 'Work-life balance',
    rightLabel: 'Career focused',
    icon: '🚀',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    key: 'social_energy',
    label: 'Social Energy',
    description: 'Do you prefer quiet nights in or nights out?',
    leftLabel: 'Quiet nights in',
    rightLabel: 'Love going out',
    icon: '🎉',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    key: 'travel_adventure',
    label: 'Travel & Adventure',
    description: 'How important is travel and new experiences?',
    leftLabel: 'Homebody',
    rightLabel: 'Adventure seeker',
    icon: '✈️',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    key: 'nightlife_lifestyle',
    label: 'Nightlife & Drinking',
    description: 'How often do you enjoy partying or drinking?',
    leftLabel: 'Rarely drink/party',
    rightLabel: 'Love nightlife',
    icon: '🍷',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    key: 'family_future',
    label: 'Family & Future',
    description: 'How important is family life and having kids?',
    leftLabel: 'Not a priority',
    rightLabel: 'Very important',
    icon: '👨‍👩‍👧‍👦',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    key: 'dating_approach',
    label: 'Dating Approach',
    description: 'Do you prefer to take things slow or dive in fast?',
    leftLabel: 'Take it slow',
    rightLabel: 'Dive in fast',
    icon: '💕',
    gradient: 'from-red-500 to-pink-600'
  },
  {
    key: 'passions_hobbies',
    label: 'Passions & Hobbies',
    description: 'How central are your hobbies to your life?',
    leftLabel: 'Casual interests',
    rightLabel: 'Life revolves around passions',
    icon: '🎨',
    gradient: 'from-amber-500 to-orange-600'
  }
];

const GENDER_OPTIONS = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  { value: 'self_describe', label: 'Self-describe' }
];

const DATING_PREFERENCES = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'non_binary', label: 'Non-binary people' },
  { value: 'all_genders', label: 'All genders' }
];

const RELATIONSHIP_GOALS = [
  { value: 'casual', label: 'Something casual', icon: '😊' },
  { value: 'serious', label: 'Long-term relationship', icon: '💕' },
  { value: 'friends', label: 'New friends', icon: '👫' },
  { value: 'open', label: 'Figuring it out', icon: '🤔' }
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Creative/Arts', 
  'Marketing', 'Sales', 'Engineering', 'Legal', 'Consulting', 
  'Hospitality', 'Retail', 'Non-profit', 'Government', 'Student', 'Other'
];

export default function EnhancedOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Name (First screen)
    first_name: '',
    last_name: '',
    
    // Basic Info
    birth_date: null,
    birth_time: '',
    birth_location: null,
    hometown: null,
    current_location: null,
    
    // Identity & Orientation
    gender_identity: '',
    gender_self_describe: '',
    open_to_dating: [],
    orientation_visible: true,
    
    // Lifestyle Sliders
    lifestyle_sliders: {
      fitness_health: 3,
      career_ambition: 3,
      social_energy: 3,
      travel_adventure: 3,
      nightlife_lifestyle: 3,
      family_future: 3,
      dating_approach: 3,
      passions_hobbies: 3
    },
    
    // Profile Details
    industry: '',
    interests: '',
    relationship_goals: '',
    bio: '',
    
    // Photos
    profile_photos: {
      face_photo: null,
      body_photo: null,
      lifestyle_photo: null
    },
    
    // Preferences (defaults - user can adjust in app settings later)
    age_range_min: 21,
    age_range_max: 40,
    max_distance_km: 80,  // Default 50 miles
    max_distance_miles: 50,
    current_location: null  // Will be set by geolocation or user can update later
  });

  const [locationSearch, setLocationSearch] = useState('');

  // Auto-detect current location on component mount
  React.useEffect(() => {
    if (navigator.geolocation && !formData.current_location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Set a default current location based on coordinates
          // In a real app, you'd reverse geocode this to get city name
          setFormData(prev => ({
            ...prev,
            current_location: {
              city: "Your Location",
              country: "Auto-detected",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.log("Geolocation not available, will use default");
        }
      );
    }
  }, []);

  // Mock location search
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

  const handleSliderChange = (key, value) => {
    setFormData({
      ...formData,
      lifestyle_sliders: {
        ...formData.lifestyle_sliders,
        [key]: value[0]
      }
    });
  };

  const handleDatingPreferenceChange = (preference, checked) => {
    const current = formData.open_to_dating;
    if (checked) {
      setFormData({
        ...formData,
        open_to_dating: [...current, preference]
      });
    } else {
      setFormData({
        ...formData,
        open_to_dating: current.filter(p => p !== preference)
      });
    }
  };

  const handlePhotoUpload = (event, photoType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        profile_photos: {
          ...formData.profile_photos,
          [photoType]: reader.result
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = async () => {
    if (!formData.birth_date || !formData.first_name) return;
    if (!formData.profile_photos.face_photo || !formData.profile_photos.body_photo || !formData.profile_photos.lifestyle_photo) {
      alert('Please upload all 3 required photos');
      return;
    }
    
    setLoading(true);
    try {
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        birth_date: format(formData.birth_date, 'yyyy-MM-dd'),
        birth_time: formData.birth_time,
        birth_location: formData.birth_location,
        hometown: formData.hometown,
        current_location: formData.current_location,
        gender_identity: formData.gender_identity,
        gender_self_describe: formData.gender_self_describe,
        open_to_dating: formData.open_to_dating,
        orientation_visible: formData.orientation_visible,
        lifestyle_sliders: formData.lifestyle_sliders,
        industry: formData.industry,
        relationship_goals: formData.relationship_goals,
        bio: formData.bio,
        interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(i => i) : [],
        age_range_min: formData.age_range_min,
        age_range_max: formData.age_range_max,
        max_distance_km: formData.max_distance_km,
        profile_photos: formData.profile_photos
      };
      
      await axios.post(`${API}/users/complete-profile`, profileData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile completion error:', error);
      alert('Error completing profile. Please try again.');
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-light text-white mb-3">
                Welcome to A Sign ✨
              </h2>
              <p className="text-white/60 text-lg">Let's start with your name</p>
            </div>

            <div className="space-y-5">
              <div className="group">
                <Label className="text-sm font-light text-white/80 mb-2 block">First Name *</Label>
                <Input
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="h-14 border border-white/20 bg-white/5 backdrop-blur-md text-white placeholder:text-white/40 focus:border-purple-500 focus:bg-white/10 rounded-2xl transition-all text-lg"
                />
              </div>

              <div className="group">
                <Label className="text-sm font-light text-white/80 mb-2 block">Last Name (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="h-14 border border-white/20 bg-white/5 backdrop-blur-md text-white placeholder:text-white/40 focus:border-purple-500 focus:bg-white/10 rounded-2xl transition-all text-lg"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                Your Cosmic Profile
              </h2>
              <p className="text-white/90">Let's start with your astrological details</p>
            </div>

            <div className="space-y-5">
              <div className="group">
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">Birth Date *</Label>
                <Input
                  type="date"
                  value={formData.birth_date ? format(formData.birth_date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData({...formData, birth_date: new Date(e.target.value)});
                    }
                  }}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="h-12 border-2 border-white/40 bg-white/20 backdrop-blur-md text-white focus:border-white focus:bg-white/30 rounded-xl transition-all"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
                <p className="text-xs text-white/80 mt-1.5 ml-1 drop-shadow">MM/DD/YYYY</p>
              </div>

              <div className="group">
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">Birth Time (Optional)</Label>
                <Input
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                  className="h-12 border-2 border-white/40 bg-white/20 backdrop-blur-md text-white focus:border-white focus:bg-white/30 rounded-xl transition-all"
                />
                <p className="text-xs text-white/80 mt-1.5 ml-1 drop-shadow">For accurate rising sign calculation</p>
              </div>

              <div className="group">
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">Birth Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
                  <Input
                    placeholder="City, Country"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="h-12 pl-11 border-2 border-white/40 bg-white/20 backdrop-blur-md text-white placeholder:text-white/60 focus:border-white focus:bg-white/30 rounded-xl transition-all"
                  />
                </div>
                {locationSearch && (
                  <div className="mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    {searchLocations(locationSearch).slice(0, 4).map((loc, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setFormData({...formData, birth_location: loc});
                          setLocationSearch('');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-violet-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-900">{loc.city}</div>
                        <div className="text-sm text-gray-500">{loc.country}</div>
                      </button>
                    ))}
                  </div>
                )}
                {formData.birth_location && (
                  <div className="mt-2">
                    <Badge className="bg-white/30 backdrop-blur-md text-white border-2 border-white/40 px-3 py-1.5 rounded-lg">
                      📍 {formData.birth_location.city}, {formData.birth_location.country}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                Identity & Dating
              </h2>
              <p className="text-white/90">Help us find your perfect match</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">I identify as</Label>
                <div className="grid grid-cols-2 gap-3">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({...formData, gender_identity: option.value})}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.gender_identity === option.value
                          ? 'border-pink-500 bg-pink-50 shadow-md'
                          : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{option.label}</div>
                    </button>
                  ))}
                </div>
                {formData.gender_identity === 'self_describe' && (
                  <Input
                    placeholder="How do you identify?"
                    value={formData.gender_self_describe}
                    onChange={(e) => setFormData({...formData, gender_self_describe: e.target.value})}
                    className="mt-3 h-12 border-2 border-gray-200 focus:border-pink-400 rounded-xl"
                  />
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Open to dating</Label>
                <div className="space-y-3">
                  {DATING_PREFERENCES.map((pref) => (
                    <label 
                      key={pref.value}
                      className="flex items-center p-4 rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 cursor-pointer transition-all"
                    >
                      <Checkbox
                        checked={formData.open_to_dating.includes(pref.value)}
                        onCheckedChange={(checked) => handleDatingPreferenceChange(pref.value, checked)}
                        className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                      <span className="ml-3 font-medium text-gray-900">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border-2 border-pink-100">
                <label className="flex items-center cursor-pointer">
                  <Checkbox
                    checked={formData.orientation_visible}
                    onCheckedChange={(checked) => setFormData({...formData, orientation_visible: checked})}
                    className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Show my orientation on profile</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-400 via-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                Your Lifestyle
              </h2>
              <p className="text-white/90">Rate what matters most to you</p>
            </div>

            <div className="space-y-6">
              {LIFESTYLE_SLIDERS.map((slider) => (
                <div key={slider.key} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/30 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-xl shadow-md">
                      {slider.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white drop-shadow">{slider.label}</div>
                      <div className="text-xs text-white/80 drop-shadow">{slider.description}</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl border-2 border-white/40">
                    <Slider
                      value={[formData.lifestyle_sliders[slider.key]]}
                      onValueChange={(value) => handleSliderChange(slider.key, value)}
                      min={1}
                      max={5}
                      step={1}
                      className="mb-3"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80 drop-shadow">{slider.leftLabel}</span>
                      <span className="font-bold text-white drop-shadow text-lg">
                        {formData.lifestyle_sliders[slider.key]}
                      </span>
                      <span className="text-white/80 drop-shadow">{slider.rightLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-400 via-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                About You
              </h2>
              <p className="text-white/90">Share what makes you unique</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">Industry</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => setFormData({...formData, industry: value})}
                >
                  <SelectTrigger className="h-12 border-2 border-white/40 bg-white/20 backdrop-blur-md text-white focus:border-white rounded-xl">
                    <SelectValue placeholder="Select your industry" className="text-white/60" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry} className="rounded-lg">
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">Relationship Goals</Label>
                <div className="grid grid-cols-2 gap-3">
                  {RELATIONSHIP_GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setFormData({...formData, relationship_goals: goal.value})}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.relationship_goals === goal.value
                          ? 'border-white bg-white/30 backdrop-blur-md shadow-lg'
                          : 'border-white/40 bg-white/10 backdrop-blur-md hover:border-white hover:bg-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{goal.icon}</div>
                      <div className="text-sm font-medium text-white drop-shadow">{goal.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">Bio</Label>
                <Textarea
                  placeholder="Tell us about yourself, your passions, what you're looking for..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="min-h-32 border-2 border-white/40 bg-white/20 backdrop-blur-md text-white placeholder:text-white/60 focus:border-white rounded-xl resize-none"
                />
                <p className="text-xs text-white/80 mt-1.5 ml-1 drop-shadow">{formData.bio.length}/500 characters</p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">Interests & Hobbies</Label>
                <Input
                  placeholder="e.g., Yoga, Photography, Cooking, Travel"
                  value={formData.interests}
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  className="h-12 border-2 border-white/40 bg-white/20 backdrop-blur-md text-white placeholder:text-white/60 focus:border-white rounded-xl"
                />
                <p className="text-xs text-white/80 mt-1.5 ml-1 drop-shadow">Separate with commas</p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-400 via-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                Add Your Photos
              </h2>
              <p className="text-white/90">Show your best self with 3 photos</p>
            </div>

            <div className="space-y-4">
              {/* Face Photo */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">
                  1. Face Photo *
                </Label>
                <p className="text-xs text-white/80 mb-2 drop-shadow">Clear photo of your face</p>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, 'face_photo')}
                  />
                  <div className={`relative h-48 rounded-xl border-2 border-dashed transition-all ${
                    formData.profile_photos.face_photo 
                      ? 'border-white bg-white/10' 
                      : 'border-white/40 bg-white/5 hover:border-white hover:bg-white/10'
                  }`}>
                    {formData.profile_photos.face_photo ? (
                      <>
                        <img 
                          src={formData.profile_photos.face_photo} 
                          alt="Face" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({
                              ...formData,
                              profile_photos: {...formData.profile_photos, face_photo: null}
                            });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-colors"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Upload className="w-10 h-10 text-white/60 mb-2" />
                        <span className="text-white/80 text-sm font-medium drop-shadow">Click to upload</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Body Photo */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">
                  2. Full Length Photo *
                </Label>
                <p className="text-xs text-white/80 mb-2 drop-shadow">Full body photo</p>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, 'body_photo')}
                  />
                  <div className={`relative h-48 rounded-xl border-2 border-dashed transition-all ${
                    formData.profile_photos.body_photo 
                      ? 'border-white bg-white/10' 
                      : 'border-white/40 bg-white/5 hover:border-white hover:bg-white/10'
                  }`}>
                    {formData.profile_photos.body_photo ? (
                      <>
                        <img 
                          src={formData.profile_photos.body_photo} 
                          alt="Body" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({
                              ...formData,
                              profile_photos: {...formData.profile_photos, body_photo: null}
                            });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-colors"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Upload className="w-10 h-10 text-white/60 mb-2" />
                        <span className="text-white/80 text-sm font-medium drop-shadow">Click to upload</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Lifestyle Photo */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block drop-shadow">
                  3. Lifestyle Photo *
                </Label>
                <p className="text-xs text-white/80 mb-2 drop-shadow">Photo showing your interests or activities</p>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, 'lifestyle_photo')}
                  />
                  <div className={`relative h-48 rounded-xl border-2 border-dashed transition-all ${
                    formData.profile_photos.lifestyle_photo 
                      ? 'border-white bg-white/10' 
                      : 'border-white/40 bg-white/5 hover:border-white hover:bg-white/10'
                  }`}>
                    {formData.profile_photos.lifestyle_photo ? (
                      <>
                        <img 
                          src={formData.profile_photos.lifestyle_photo} 
                          alt="Lifestyle" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({
                              ...formData,
                              profile_photos: {...formData.profile_photos, lifestyle_photo: null}
                            });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-colors"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Upload className="w-10 h-10 text-white/60 mb-2" />
                        <span className="text-white/80 text-sm font-medium drop-shadow">Click to upload</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Very subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
      
      {/* Subtle cosmic particles */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-[10%] left-[20%] w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-[20%] right-[15%] w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-[40%] left-[10%] w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[60%] right-[25%] w-0.5 h-0.5 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-[70%] left-[30%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-[30%] right-[40%] w-0.5 h-0.5 bg-pink-300 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
      </div>
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-light text-white/80">Profile Setup</span>
            <span className="text-sm font-light text-white/80">
              {step} of 6
            </span>
          </div>
          <div className="h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden border border-white/20">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border border-white/20 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-md bg-white/5">
          <CardContent className="p-8">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-white/20">
              {step > 1 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1 h-12 border border-white/20 bg-white/5 backdrop-blur-md text-white hover:border-white/40 hover:bg-white/10 rounded-2xl font-medium"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </Button>
              )}
              
              {step < 6 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-medium shadow-lg"
                  disabled={
                    (step === 1 && !formData.first_name) || 
                    (step === 2 && !formData.birth_date) ||
                    (step === 6 && (!formData.profile_photos.face_photo || !formData.profile_photos.body_photo || !formData.profile_photos.lifestyle_photo))
                  }
                >
                  Continue
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-medium shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Complete Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}