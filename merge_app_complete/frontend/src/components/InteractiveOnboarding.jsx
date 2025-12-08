import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ChevronRight, Sparkles, MapPin, Heart, Camera, Upload } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios to always send cookies
axios.defaults.withCredentials = true;

const LIFESTYLE_QUESTIONS = [
  {
    key: 'fitness_health',
    question: 'How important is fitness and health to you?',
    emoji: '💪',
    labels: ['Not important', 'Somewhat', 'Moderate', 'Important', 'Very important']
  },
  {
    key: 'career_ambition',
    question: 'How career-focused are you?',
    emoji: '🚀',
    labels: ['Work-life balance', 'Balanced', 'Moderate', 'Ambitious', 'Very ambitious']
  },
  {
    key: 'social_energy',
    question: 'Are you more introverted or extroverted?',
    emoji: '🎉',
    labels: ['Stay in', 'Mostly in', 'Mixed', 'Social', 'Party lover']
  },
  {
    key: 'travel_adventure',
    question: 'How much do you love travel and adventure?',
    emoji: '✈️',
    labels: ['Homebody', 'Occasional', 'Moderate', 'Love it', 'Adventure junkie']
  },
  {
    key: 'nightlife_lifestyle',
    question: 'How often do you enjoy nightlife?',
    emoji: '🍷',
    labels: ['Rarely', 'Sometimes', 'Moderate', 'Often', 'Party animal']
  },
  {
    key: 'family_future',
    question: 'How important is family and having kids?',
    emoji: '👨‍👩‍👧‍👦',
    labels: ['Not a priority', 'Maybe', 'Moderate', 'Important', 'Very important']
  },
  {
    key: 'dating_approach',
    question: 'How do you approach dating?',
    emoji: '💕',
    labels: ['Very slow', 'Take time', 'Moderate', 'Fast', 'Dive in']
  },
  {
    key: 'passions_hobbies',
    question: 'How central are hobbies to your life?',
    emoji: '🎨',
    labels: ['Casual', 'Some interest', 'Moderate', 'Important', 'Life revolves around them']
  }
];

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];
const DATING_PREFS = ['Men', 'Women', 'Non-binary people', 'All genders'];
const RELATIONSHIP_GOALS = [
  { value: 'casual', label: 'Something casual', icon: '😊' },
  { value: 'serious', label: 'Long-term relationship', icon: '💕' },
  { value: 'friends', label: 'New friends', icon: '👫' },
  { value: 'open', label: 'Figuring it out', icon: '🤔' }
];

export default function InteractiveOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBubble, setSelectedBubble] = useState(null);
  
  const [formData, setFormData] = useState({
    birth_month: new Date().getMonth() + 1,
    birth_day: new Date().getDate(),
    birth_year: new Date().getFullYear() - 25,
    first_name: '',
    last_name: '',
    birth_location: null,
    current_location: null,
    gender_identity: '',
    open_to_dating: [],
    relationship_goals: '',
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
    profile_photos: {
      face_photo: null,
      body_photo: null,
      lifestyle_photo: null
    },
    age_range_min: 21,
    age_range_max: 40,
    max_distance_km: 80
  });

  const [currentLifestyleIndex, setCurrentLifestyleIndex] = useState(0);
  const [locationSearch, setLocationSearch] = useState('');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i);

  const searchLocations = (query) => {
    const mockLocations = [
      { city: "New York", country: "United States", latitude: 40.7128, longitude: -74.0060 },
      { city: "Los Angeles", country: "United States", latitude: 34.0522, longitude: -118.2437 },
      { city: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
      { city: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
      { city: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 }
    ];
    return mockLocations.filter(loc => 
      loc.city.toLowerCase().includes(query.toLowerCase()) ||
      loc.country.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleBubbleClick = (value) => {
    const currentQuestion = LIFESTYLE_QUESTIONS[currentLifestyleIndex];
    setSelectedBubble(value);
    
    // Update the lifestyle slider value
    setFormData({
      ...formData,
      lifestyle_sliders: {
        ...formData.lifestyle_sliders,
        [currentQuestion.key]: value
      }
    });

    // Animate and move to next after delay
    setTimeout(() => {
      setSelectedBubble(null);
      if (currentLifestyleIndex < LIFESTYLE_QUESTIONS.length - 1) {
        setCurrentLifestyleIndex(currentLifestyleIndex + 1);
      } else {
        setStep(step + 1);
      }
    }, 800);
  };

  const handlePhotoUpload = (event, photoType) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB');
      return;
    }
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
    setLoading(true);
    try {
      const birthDate = new Date(formData.birth_year, formData.birth_month - 1, formData.birth_day);
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        birth_date: format(birthDate, 'yyyy-MM-dd'),
        birth_location: formData.birth_location,
        current_location: formData.current_location,
        gender_identity: formData.gender_identity,
        open_to_dating: formData.open_to_dating,
        relationship_goals: formData.relationship_goals,
        lifestyle_sliders: formData.lifestyle_sliders,
        profile_photos: formData.profile_photos,
        age_range_min: formData.age_range_min,
        age_range_max: formData.age_range_max,
        max_distance_km: formData.max_distance_km
      };
      
      await axios.post(`${API}/users/complete-profile`, profileData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile completion error:', error);
      alert('Error completing profile. Please try again.');
    }
    setLoading(false);
  };

  const totalSteps = 6 + LIFESTYLE_QUESTIONS.length; // Birthday, Name, Location, Identity, Dating, 8 lifestyle, Goals, Photos
  const currentStep = step <= 3 ? step : step > 3 && step <= 3 + LIFESTYLE_QUESTIONS.length ? 3 + currentLifestyleIndex + 1 : step;

  const renderStep = () => {
    // Step 1: Birthday Wheel
    if (step === 1) {
      return (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎂</div>
            <h2 className="text-4xl font-light text-white mb-2">
              When were you born?
            </h2>
            <p className="text-white/60 text-lg">Select your birthday</p>
          </div>

          <div className="flex justify-center gap-4">
            {/* Month Wheel */}
            <div className="flex flex-col items-center">
              <label className="text-white/60 text-sm mb-2 font-light">Month</label>
              <select
                value={formData.birth_month}
                onChange={(e) => setFormData({...formData, birth_month: parseInt(e.target.value)})}
                className="h-16 w-24 px-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white text-center text-xl font-light focus:border-purple-500 focus:bg-white/10 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>

            {/* Day Wheel */}
            <div className="flex flex-col items-center">
              <label className="text-white/60 text-sm mb-2 font-light">Day</label>
              <select
                value={formData.birth_day}
                onChange={(e) => setFormData({...formData, birth_day: parseInt(e.target.value)})}
                className="h-16 w-20 px-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white text-center text-xl font-light focus:border-purple-500 focus:bg-white/10 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Year Wheel */}
            <div className="flex flex-col items-center">
              <label className="text-white/60 text-sm mb-2 font-light">Year</label>
              <select
                value={formData.birth_year}
                onChange={(e) => setFormData({...formData, birth_year: parseInt(e.target.value)})}
                className="h-16 w-28 px-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl text-white text-center text-xl font-light focus:border-purple-500 focus:bg-white/10 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center text-white/50 text-sm">
            You must be 18+ to use A Sign
          </div>
        </div>
      );
    }

    // Step 2: Name
    if (step === 2) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-4xl font-light text-white mb-2">
              What's your name?
            </h2>
            <p className="text-white/60">This will appear on your profile</p>
          </div>

          <div className="space-y-5">
            <Input
              type="text"
              placeholder="First name"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="h-16 border border-white/20 bg-white/5 backdrop-blur-md text-white placeholder:text-white/40 focus:border-purple-500 focus:bg-white/10 rounded-2xl transition-all text-xl text-center"
            />
            <Input
              type="text"
              placeholder="Last name (optional)"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="h-16 border border-white/20 bg-white/5 backdrop-blur-md text-white placeholder:text-white/40 focus:border-purple-500 focus:bg-white/10 rounded-2xl transition-all text-xl text-center"
            />
          </div>
        </div>
      );
    }

    // Step 3: Location
    if (step === 3) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
              Where are you from?
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-white/90 mb-2 block text-center drop-shadow">Where were you born?</Label>
              <Input
                placeholder="City, Country"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="h-14 border-2 border-white/40 bg-white/20 backdrop-blur-md text-white placeholder:text-white/60 focus:border-white focus:bg-white/30 rounded-xl transition-all text-center"
              />
              {locationSearch && (
                <div className="mt-2 bg-white rounded-xl shadow-lg overflow-hidden">
                  {searchLocations(locationSearch).slice(0, 4).map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setFormData({...formData, birth_location: loc, current_location: loc});
                        setLocationSearch('');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors border-b last:border-0"
                    >
                      <div className="font-medium text-gray-900">{loc.city}</div>
                      <div className="text-sm text-gray-500">{loc.country}</div>
                    </button>
                  ))}
                </div>
              )}
              {formData.birth_location && (
                <div className="mt-3 text-center">
                  <span className="bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg border-2 border-white/40 inline-block">
                    📍 {formData.birth_location.city}, {formData.birth_location.country}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Step 4-11: Lifestyle Questions (one per screen)
    if (step === 4) {
      const currentQuestion = LIFESTYLE_QUESTIONS[currentLifestyleIndex];
      return (
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">{currentQuestion.emoji}</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4 px-4">
              {currentQuestion.question}
            </h2>
            <p className="text-white/70 text-sm">Tap a bubble</p>
          </div>

          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleBubbleClick(value)}
                className={`relative w-16 h-16 rounded-full border-3 transition-all duration-300 transform ${
                  selectedBubble === value
                    ? 'scale-150 bg-white border-white shadow-2xl'
                    : 'bg-white/20 backdrop-blur-md border-white/40 hover:bg-white/30 hover:scale-110 hover:border-white'
                }`}
              >
                <span className={`text-2xl font-bold transition-colors ${
                  selectedBubble === value ? 'text-rose-500' : 'text-white'
                }`}>
                  {value}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-between px-4 text-xs text-white/70 drop-shadow">
            <span>{currentQuestion.labels[0]}</span>
            <span>{currentQuestion.labels[4]}</span>
          </div>

          {selectedBubble && (
            <div className="text-center text-white text-xl font-bold drop-shadow-lg animate-bounce">
              ✨ {currentQuestion.labels[selectedBubble - 1]} ✨
            </div>
          )}
        </div>
      );
    }

    // Step 12: Identity & Dating
    if (step === 5) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💖</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
              Tell us about you
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-white/90 mb-3 block text-center drop-shadow">I identify as</Label>
              <div className="grid grid-cols-2 gap-3">
                {GENDERS.map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setFormData({...formData, gender_identity: gender.toLowerCase().replace(' ', '_')})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.gender_identity === gender.toLowerCase().replace(' ', '_')
                        ? 'border-white bg-white/30 shadow-lg scale-105'
                        : 'border-white/40 bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-white font-medium drop-shadow">{gender}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white/90 mb-3 block text-center drop-shadow">Interested in</Label>
              <div className="grid grid-cols-2 gap-3">
                {DATING_PREFS.map((pref) => (
                  <button
                    key={pref}
                    onClick={() => {
                      const value = pref.toLowerCase().replace(' ', '_');
                      const current = formData.open_to_dating;
                      setFormData({
                        ...formData,
                        open_to_dating: current.includes(value)
                          ? current.filter(p => p !== value)
                          : [...current, value]
                      });
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.open_to_dating.includes(pref.toLowerCase().replace(' ', '_'))
                        ? 'border-white bg-white/30 shadow-lg'
                        : 'border-white/40 bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-white font-medium drop-shadow">{pref}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white/90 mb-3 block text-center drop-shadow">Looking for</Label>
              <div className="grid grid-cols-2 gap-3">
                {RELATIONSHIP_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setFormData({...formData, relationship_goals: goal.value})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.relationship_goals === goal.value
                        ? 'border-white bg-white/30 shadow-lg'
                        : 'border-white/40 bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{goal.icon}</div>
                    <div className="text-sm text-white font-medium drop-shadow">{goal.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 13: Photos
    if (step === 6) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
              Add 3 photos
            </h2>
            <p className="text-white/90">Show your best self</p>
          </div>

          <div className="space-y-4">
            {['face_photo', 'body_photo', 'lifestyle_photo'].map((photoType, idx) => (
              <label key={photoType} className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, photoType)}
                />
                <div className={`relative h-32 rounded-2xl border-2 border-dashed transition-all ${
                  formData.profile_photos[photoType] 
                    ? 'border-white bg-white/10' 
                    : 'border-white/40 bg-white/5 hover:border-white hover:bg-white/10'
                }`}>
                  {formData.profile_photos[photoType] ? (
                    <>
                      <img 
                        src={formData.profile_photos[photoType]} 
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            profile_photos: {...formData.profile_photos, [photoType]: null}
                          });
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 text-white/60 mb-2" />
                      <span className="text-white/80 text-sm font-medium drop-shadow">
                        {idx === 0 ? 'Face photo' : idx === 1 ? 'Full body' : 'Lifestyle'}
                      </span>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    }
  };

  const canContinue = () => {
    if (step === 1) return true;
    if (step === 2) return formData.first_name.length > 0;
    if (step === 3) return formData.birth_location !== null;
    if (step === 4) return true; // Lifestyle auto-advances
    if (step === 5) return formData.gender_identity && formData.open_to_dating.length > 0 && formData.relationship_goals;
    if (step === 6) return formData.profile_photos.face_photo && formData.profile_photos.body_photo && formData.profile_photos.lifestyle_photo;
    return true;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Very subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
      
      {/* Distant twinkling stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[8%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse opacity-40" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-[25%] right-[20%] w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-30" style={{animationDuration: '4s', animationDelay: '0.5s'}}></div>
        <div className="absolute top-[42%] left-[8%] w-0.5 h-0.5 bg-pink-200 rounded-full animate-pulse opacity-20" style={{animationDuration: '3.8s', animationDelay: '1.5s'}}></div>
        <div className="absolute top-[55%] right-[35%] w-1 h-1 bg-white rounded-full animate-pulse opacity-40" style={{animationDuration: '5s', animationDelay: '2s'}}></div>
        <div className="absolute top-[72%] left-[25%] w-1 h-1 bg-white rounded-full animate-pulse opacity-35" style={{animationDuration: '3.6s', animationDelay: '0.9s'}}></div>
        <div className="absolute top-[18%] left-[80%] w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-10" style={{animationDuration: '6s', animationDelay: '3s'}}></div>
        <div className="absolute top-[52%] right-[8%] w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse opacity-12" style={{animationDuration: '6.2s', animationDelay: '0.9s'}}></div>
      </div>
      
      <div className="w-full max-w-xl relative z-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden border border-white/20">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content Card */}
        <div className="border border-white/20 rounded-3xl overflow-hidden backdrop-blur-md bg-white/5 p-8 shadow-2xl">
          {renderStep()}
          
          {/* Navigation */}
          {step !== 4 && (
            <div className="mt-8">
              <Button
                onClick={() => {
                  if (step === 6) {
                    handleComplete();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={!canContinue() || loading}
                className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-medium text-lg shadow-lg disabled:opacity-50"
              >
                {loading ? 'Creating profile...' : step === 6 ? '🎉 Complete' : 'Continue'}
                {!loading && step !== 6 && <ChevronRight className="inline ml-2" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}