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
import { CalendarIcon, Upload, Camera, User, Heart, MapPin, Briefcase, Target } from 'lucide-react';
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
    icon: '💪'
  },
  {
    key: 'career_ambition',
    label: 'Career Ambition',
    description: 'How much do you prioritize career growth?',
    leftLabel: 'Work-life balance',
    rightLabel: 'Career focused',
    icon: '🚀'
  },
  {
    key: 'social_energy',
    label: 'Social Energy',
    description: 'Do you prefer quiet nights in or nights out?',
    leftLabel: 'Quiet nights in',
    rightLabel: 'Love going out',
    icon: '🎉'
  },
  {
    key: 'travel_adventure',
    label: 'Travel & Adventure',
    description: 'How important is travel and new experiences?',
    leftLabel: 'Homebody',
    rightLabel: 'Adventure seeker',
    icon: '✈️'
  },
  {
    key: 'nightlife_lifestyle',
    label: 'Nightlife & Drinking',
    description: 'How often do you enjoy partying or drinking?',
    leftLabel: 'Rarely drink/party',
    rightLabel: 'Love nightlife',
    icon: '🍷'
  },
  {
    key: 'family_future',
    label: 'Family & Future',
    description: 'How important is family life and having kids?',
    leftLabel: 'Not a priority',
    rightLabel: 'Very important',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    key: 'dating_approach',
    label: 'Dating Approach',
    description: 'Do you prefer to take things slow or dive in fast?',
    leftLabel: 'Take it slow',
    rightLabel: 'Dive in fast',
    icon: '💕'
  },
  {
    key: 'passions_hobbies',
    label: 'Passions & Hobbies',
    description: 'How central are your hobbies to your life?',
    leftLabel: 'Casual interests',
    rightLabel: 'Life revolves around passions',
    icon: '🎨'
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
    
    // Preferences
    age_range_min: 18,
    age_range_max: 35,
    max_distance_km: 50
  });

  const [locationSearch, setLocationSearch] = useState('');

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
        max_distance_km: formData.max_distance_km
      };
      
      await axios.post(`${API}/users/complete-profile`, profileData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile completion error:', error);
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 mx-auto text-rose-500 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Basic Information</h2>
              <p className="text-gray-600">Let's start with the essentials</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Birth Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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

              <div>
                <Label>Birth Time (Optional)</Label>
                <Input
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Helps create a more accurate astrological profile</p>
              </div>

              <div>
                <Label>Gender Identity *</Label>
                <Select value={formData.gender_identity} onValueChange={(value) => setFormData({...formData, gender_identity: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender identity" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.gender_identity === 'self_describe' && (
                <div>
                  <Label>Describe your gender identity</Label>
                  <Input
                    value={formData.gender_self_describe}
                    onChange={(e) => setFormData({...formData, gender_self_describe: e.target.value})}
                    placeholder="How do you identify?"
                  />
                </div>
              )}
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600"
              disabled={!formData.birth_date || !formData.gender_identity}
            >
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Heart className="w-12 h-12 mx-auto text-rose-500 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Dating Preferences</h2>
              <p className="text-gray-600">Who are you interested in meeting?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">I'm open to dating:</Label>
                <div className="space-y-3 mt-3">
                  {DATING_PREFERENCES.map(pref => (
                    <div key={pref.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={pref.value}
                        checked={formData.open_to_dating.includes(pref.value)}
                        onCheckedChange={(checked) => handleDatingPreferenceChange(pref.value, checked)}
                      />
                      <Label htmlFor={pref.value}>{pref.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="orientation_visible"
                  checked={formData.orientation_visible}
                  onCheckedChange={(checked) => setFormData({...formData, orientation_visible: checked})}
                />
                <Label htmlFor="orientation_visible" className="text-sm">
                  Show my orientation on my profile
                </Label>
              </div>

              <div>
                <Label>What are you looking for?</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {RELATIONSHIP_GOALS.map(goal => (
                    <Button
                      key={goal.value}
                      variant={formData.relationship_goals === goal.value ? "default" : "outline"}
                      className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                        formData.relationship_goals === goal.value 
                          ? "bg-gradient-to-r from-rose-500 to-pink-600" 
                          : ""
                      }`}
                      onClick={() => setFormData({...formData, relationship_goals: goal.value})}
                    >
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="text-sm text-center">{goal.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600"
                disabled={formData.open_to_dating.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 mx-auto text-rose-500 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Lifestyle & Values</h2>
              <p className="text-gray-600">Help us find your perfect match</p>
            </div>

            <div className="space-y-6">
              {LIFESTYLE_SLIDERS.map(slider => (
                <div key={slider.key} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{slider.icon}</span>
                    <div>
                      <Label className="font-medium">{slider.label}</Label>
                      <p className="text-sm text-gray-600">{slider.description}</p>
                    </div>
                  </div>
                  
                  <div className="px-3">
                    <Slider
                      value={[formData.lifestyle_sliders[slider.key]]}
                      onValueChange={(value) => handleSliderChange(slider.key, value)}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{slider.leftLabel}</span>
                      <span>{slider.rightLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600">
                Continue
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto text-rose-500 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Location & Background</h2>
              <p className="text-gray-600">Where are you from and where are you now?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Current Location</Label>
                <div className="flex gap-2 mt-2">
                  <Button onClick={getCurrentLocation} variant="outline" className="flex-1">
                    📍 Use Current Location
                  </Button>
                </div>
                {formData.current_location && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                    ✓ Location detected: {formData.current_location.city}
                  </div>
                )}
              </div>

              <div>
                <Label>Hometown (Optional)</Label>
                <Input
                  placeholder="Search hometown..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
                {locationSearch && (
                  <div className="border rounded-lg max-h-32 overflow-y-auto mt-2">
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
              </div>

              <div>
                <Label>Industry/Work</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(5)} className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600">
                Continue
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Briefcase className="w-12 h-12 mx-auto text-rose-500 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-800">About You</h2>
              <p className="text-gray-600">Tell potential matches about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Interests & Hobbies</Label>
                <Input
                  value={formData.interests}
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  placeholder="e.g. Travel, Music, Yoga, Books, Hiking"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Share what makes you unique, your passions, what you're looking for..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Age Range Preference</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label className="text-sm">Min Age</Label>
                    <Select 
                      value={formData.age_range_min.toString()} 
                      onValueChange={(value) => setFormData({...formData, age_range_min: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                          <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Max Age</Label>
                    <Select 
                      value={formData.age_range_max.toString()} 
                      onValueChange={(value) => setFormData({...formData, age_range_max: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                          <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label>Maximum Distance</Label>
                <Select 
                  value={formData.max_distance_km.toString()} 
                  onValueChange={(value) => setFormData({...formData, max_distance_km: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Within 5 km</SelectItem>
                    <SelectItem value="10">Within 10 km</SelectItem>
                    <SelectItem value="25">Within 25 km</SelectItem>
                    <SelectItem value="50">Within 50 km</SelectItem>
                    <SelectItem value="100">Within 100 km</SelectItem>
                    <SelectItem value="250">Within 250 km</SelectItem>
                    <SelectItem value="500">Within 500 km</SelectItem>
                    <SelectItem value="1000">Within 1000 km</SelectItem>
                    <SelectItem value="5000">Anywhere</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Profile Summary:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Birth Date: {formData.birth_date ? format(formData.birth_date, 'PPP') : 'Not set'}</li>
                <li>• Gender: {formData.gender_identity}</li>
                <li>• Looking for: {formData.relationship_goals}</li>
                <li>• Industry: {formData.industry || 'Not specified'}</li>
                <li>• Age Range: {formData.age_range_min}-{formData.age_range_max} years</li>
                <li>• Distance: Within {formData.max_distance_km === 5000 ? 'anywhere' : `${formData.max_distance_km}km`}</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(4)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600"
                disabled={loading}
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">Create Your Profile</CardTitle>
          <CardDescription>Step {step} of 5 - Build your complete dating profile</CardDescription>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}