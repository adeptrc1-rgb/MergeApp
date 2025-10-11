import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, ChevronRight, ChevronLeft, Upload, Zap, MapPin, Heart, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// MBTI Questions (5 questions)
const MBTI_QUESTIONS = [
  {
    key: 'energy',
    question: 'Where do you get your energy?',
    leftLabel: 'Quiet & introspective',
    rightLabel: 'Social & outgoing',
    leftEmoji: '🤫',
    rightEmoji: '🎉',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    key: 'information',
    question: 'How do you process information?',
    leftLabel: 'Practical & detailed',
    rightLabel: 'Imaginative & big picture',
    leftEmoji: '📊',
    rightEmoji: '💭',
    gradient: 'from-green-500 to-teal-600'
  },
  {
    key: 'decision',
    question: 'How do you make decisions?',
    leftLabel: 'Logical & analytical',
    rightLabel: 'Values & feelings',
    leftEmoji: '🧠',
    rightEmoji: '❤️',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    key: 'planning',
    question: 'How do you approach life?',
    leftLabel: 'Structured & planned',
    rightLabel: 'Spontaneous & flexible',
    leftEmoji: '📅',
    rightEmoji: '🎲',
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    key: 'interaction',
    question: 'How do you express yourself?',
    leftLabel: 'Reserved & private',
    rightLabel: 'Expressive & open',
    leftEmoji: '🔒',
    rightEmoji: '📢',
    gradient: 'from-pink-500 to-rose-600'
  }
];

// Interests options
const INTERESTS_OPTIONS = [
  'Yoga', 'Hiking', 'Photography', 'Cooking', 'Travel', 'Music',
  'Art', 'Reading', 'Gaming', 'Sports', 'Dancing', 'Movies',
  'Theatre', 'Foodie', 'Wine', 'Coffee', 'Meditation', 'Fitness',
  'Fashion', 'Tech', 'DIY', 'Volunteering', 'Pets', 'Nature'
];

// Lifestyle sliders (8 sliders)
const LIFESTYLE_SLIDERS = [
  {
    key: 'fitness_health',
    label: 'Fitness & Health',
    leftLabel: 'Relaxed',
    rightLabel: 'Very active',
    emoji: '💪'
  },
  {
    key: 'career_ambition',
    label: 'Career Ambition',
    leftLabel: 'Work-life balance',
    rightLabel: 'Career focused',
    emoji: '🚀'
  },
  {
    key: 'social_energy',
    label: 'Social Energy',
    leftLabel: 'Quiet nights in',
    rightLabel: 'Love going out',
    emoji: '🎉'
  },
  {
    key: 'travel_adventure',
    label: 'Travel & Adventure',
    leftLabel: 'Homebody',
    rightLabel: 'Adventure seeker',
    emoji: '✈️'
  },
  {
    key: 'nightlife_lifestyle',
    label: 'Nightlife',
    leftLabel: 'Rarely party',
    rightLabel: 'Love nightlife',
    emoji: '🍷'
  },
  {
    key: 'family_future',
    label: 'Family & Future',
    leftLabel: 'Not a priority',
    rightLabel: 'Very important',
    emoji: '👨‍👩‍👧‍👦'
  },
  {
    key: 'dating_approach',
    label: 'Dating Approach',
    leftLabel: 'Take it slow',
    rightLabel: 'Dive in fast',
    emoji: '💕'
  },
  {
    key: 'passions_hobbies',
    label: 'Passions & Hobbies',
    leftLabel: 'Casual interests',
    rightLabel: 'Life revolves around',
    emoji: '🎨'
  }
];

export default function CosmicOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  // Randomize step order (but keep photos last)
  const stepOrder = useMemo(() => {
    const steps = [
      { id: 'identity', title: 'Cosmic Identity', icon: Sparkles },
      { id: 'mbti', title: 'Personality', icon: Zap },
      { id: 'dealbreakers', title: 'Deal-Breakers', icon: Heart },
      { id: 'lifestyle', title: 'Your Vibe', icon: Star },
      { id: 'nicetohaves', title: 'Fine-tune your vibe', icon: Sparkles }
    ];
    // Shuffle steps (Fisher-Yates)
    for (let i = steps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [steps[i], steps[j]] = [steps[j], steps[i]];
    }
    // Always keep photos last
    steps.push({ id: 'photos', title: 'Show Your Spark', icon: Upload });
    return steps;
  }, []);

  const totalSteps = stepOrder.length;
  const currentStepData = stepOrder[step - 1];

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const [formData, setFormData] = useState({
    // Identity
    first_name: '',
    birth_date: '',
    birth_time: '',
    birth_location: null,

    // MBTI
    mbti_answers: {
      energy: 3,
      information: 3,
      decision: 3,
      planning: 3,
      interaction: 3
    },

    // Deal-breakers
    deal_breakers: {
      relationship_goals: '',
      has_kids: false,
      want_kids: '',
      smoking: ''
    },

    // Lifestyle & Interests
    interests: [],
    lifestyle_factors: {
      fitness_health: 3,
      career_ambition: 3,
      social_energy: 3,
      travel_adventure: 3,
      nightlife_lifestyle: 3,
      family_future: 3,
      dating_approach: 3,
      passions_hobbies: 3
    },

    // Nice-to-haves
    preferences: {
      religion: '',
      politics: '',
      diet: '',
      exercise: ''
    },

    // Photos
    photos: [null, null, null]
  });

  // Calculate completed questions for progress
  const getCompletedQuestions = () => {
    let count = 0;
    // Count all steps up to current
    for (let i = 0; i < step; i++) {
      const stepId = stepOrder[i].id;
      if (stepId === 'identity') count += formData.first_name ? 4 : 0;
      else if (stepId === 'mbti') count += 5;
      else if (stepId === 'dealbreakers') count += 3;
      else if (stepId === 'lifestyle') count += formData.interests.length > 0 ? 9 : 0;
      else if (stepId === 'nicetohaves') count += 4;
      else if (stepId === 'photos') count += formData.photos.filter(p => p !== null).length;
    }
    return count;
  };

  const totalQuestions = 28; // 4 + 5 + 3 + 9 + 4 + 3

  // Mock location search
  const searchLocations = (query) => {
    const mockLocations = [
      { city: "New York", country: "United States", latitude: 40.7128, longitude: -74.0060 },
      { city: "Los Angeles", country: "United States", latitude: 34.0522, longitude: -118.2437 },
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

  const handlePhotoUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = [...formData.photos];
      newPhotos[index] = reader.result;
      setFormData({ ...formData, photos: newPhotos });
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = async () => {
    if (!formData.first_name || !formData.birth_date) {
      alert('Please complete all required fields');
      return;
    }
    if (!formData.photos[0] || !formData.photos[1] || !formData.photos[2]) {
      alert('Please upload all 3 photos');
      return;
    }

    setLoading(true);
    try {
      // Convert MBTI answers (1-5) to 0-100 scale
      const mbti_scores = {};
      Object.keys(formData.mbti_answers).forEach(key => {
        const value = formData.mbti_answers[key];
        mbti_scores[key] = (value - 1) * 25; // Map 1-5 to 0-100
      });

      const profileData = {
        first_name: formData.first_name,
        birth_date: formData.birth_date,
        birth_time: formData.birth_time || null,
        birth_location: formData.birth_location,
        photos: formData.photos.filter(p => p !== null),
        interests: formData.interests,
        mbti_scores: mbti_scores,
        lifestyle_factors: formData.lifestyle_factors,
        deal_breakers: formData.deal_breakers,
        preferences: formData.preferences
      };

      await axios.post(`${API}/onboarding/complete`, profileData, {
        withCredentials: true
      });

      navigate('/home');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canContinue = () => {
    const stepId = currentStepData.id;
    if (stepId === 'identity') {
      return formData.first_name && formData.birth_date;
    }
    if (stepId === 'dealbreakers') {
      return formData.deal_breakers.relationship_goals && 
             formData.deal_breakers.want_kids && 
             formData.deal_breakers.smoking;
    }
    if (stepId === 'photos') {
      return formData.photos.every(p => p !== null);
    }
    return true;
  };

  const renderProgressTracker = () => {
    const completed = getCompletedQuestions();
    const percentage = (completed / totalQuestions) * 100;

    return (
      <div className="fixed top-8 left-0 right-0 z-50 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-white font-light text-sm">
              {completed} of {totalQuestions} cosmic sparks collected
            </span>
            <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-500 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIdentityStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-light text-white mb-3">
          Welcome to A Sign ✨
        </h2>
        <p className="text-white/60 text-lg">Let's start your cosmic journey</p>
      </div>

      <div className="space-y-5">
        {/* First Name */}
        <div>
          <label className="text-sm font-light text-white/80 mb-2 block">First Name *</label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full h-14 px-4 border border-white/20 bg-white/5 backdrop-blur-md text-white placeholder:text-white/40 focus:border-purple-500 focus:bg-white/10 rounded-2xl transition-all text-lg outline-none"
          />
        </div>

        {/* Birth Date */}
        <div>
          <label className="text-sm font-light text-white/80 mb-2 block">Birth Date *</label>
          <input
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full h-12 px-4 border border-white/20 bg-white/5 backdrop-blur-md text-white focus:border-purple-500 focus:bg-white/10 rounded-2xl transition-all outline-none"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Birth Time */}
        <div>
          <label className="text-sm font-light text-white/80 mb-2 block">Birth Time (Optional)</label>
          <input
            type="time"
            value={formData.birth_time}
            onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
            className="w-full h-12 px-4 border border-white/20 bg-white/5 backdrop-blur-md text-white focus:border-purple-500 focus:bg-white/10 rounded-2xl transition-all outline-none"
            style={{ colorScheme: 'dark' }}
          />
          <p className="text-xs text-white/50 mt-1.5 ml-1">For accurate rising sign</p>
        </div>

        {/* Birth Location */}
        <div>
          <label className="text-sm font-light text-white/80 mb-2 block">Birth Location (Optional)</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              placeholder="City, Country"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="w-full h-12 pl-11 px-4 border border-white/20 bg-white/5 backdrop-blur-md text-white placeholder:text-white/40 focus:border-purple-500 focus:bg-white/10 rounded-2xl transition-all outline-none"
            />
          </div>
          {locationSearch && (
            <div className="mt-2 bg-black/90 border border-white/20 rounded-2xl shadow-lg overflow-hidden">
              {searchLocations(locationSearch).slice(0, 4).map((loc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setFormData({ ...formData, birth_location: loc });
                    setLocationSearch('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                >
                  <div className="font-medium text-white">{loc.city}</div>
                  <div className="text-sm text-white/60">{loc.country}</div>
                </button>
              ))}
            </div>
          )}
          {formData.birth_location && (
            <div className="mt-2 px-3 py-1.5 inline-block bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-lg text-sm">
              📍 {formData.birth_location.city}, {formData.birth_location.country}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMBTIStep = () => (
    <div className="space-y-8 animate-fadeIn pb-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
          <Zap className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-light text-white mb-3">
          Your Personality
        </h2>
        <p className="text-white/60 text-lg">Answer honestly for best matches</p>
      </div>

      {MBTI_QUESTIONS.map((q, idx) => (
        <div key={q.key} className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-medium text-white mb-2">{q.question}</h3>
          </div>

          {/* Bubble Scale */}
          <div className="flex items-center justify-center gap-3 py-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setFormData({
                  ...formData,
                  mbti_answers: { ...formData.mbti_answers, [q.key]: value }
                })}
                className={`cosmic-bubble relative transition-all duration-300 ${
                  formData.mbti_answers[q.key] === value
                    ? 'cosmic-bubble-selected scale-110'
                    : 'scale-100 hover:scale-105'
                }`}
                style={{
                  width: `${40 + value * 8}px`,
                  height: `${40 + value * 8}px`,
                }}
              >
                <div
                  className={`w-full h-full rounded-full transition-all duration-300 ${
                    formData.mbti_answers[q.key] === value
                      ? `bg-gradient-to-br ${q.gradient} shadow-2xl`
                      : 'bg-white/10 border-2 border-white/30 hover:border-white/50'
                  }`}
                >
                  {formData.mbti_answers[q.key] === value && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between items-center text-sm px-2">
            <div className="flex items-center gap-2 text-white/70">
              <span className="text-xl">{q.leftEmoji}</span>
              <span>{q.leftLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>{q.rightLabel}</span>
              <span className="text-xl">{q.rightEmoji}</span>
            </div>
          </div>

          {idx < MBTI_QUESTIONS.length - 1 && (
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderDealBreakersStep = () => (
    <div className="space-y-8 animate-fadeIn pb-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
          <Heart className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-light text-white mb-3">
          What Matters Most
        </h2>
        <p className="text-white/60 text-lg">Help us find your perfect match</p>
      </div>

      <div className="space-y-6">
        {/* Relationship Goals */}
        <div>
          <label className="text-white font-medium mb-3 block text-center">What are you looking for? *</label>
          <div className="flex flex-wrap gap-3 justify-center">
            {['casual', 'long-term', 'marriage', 'figuring_out'].map((goal) => (
              <button
                key={goal}
                onClick={() => setFormData({
                  ...formData,
                  deal_breakers: { ...formData.deal_breakers, relationship_goals: goal }
                })}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  formData.deal_breakers.relationship_goals === goal
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
                }`}
              >
                {goal === 'casual' ? '🎉 Casual Dating' : 
                 goal === 'long-term' ? '💕 Long-term' : 
                 goal === 'marriage' ? '💍 Marriage' : 
                 '🤔 Figuring it out'}
              </button>
            ))}
          </div>
        </div>

        {/* Kids */}
        <div className="space-y-4">
          <label className="text-white font-medium mb-3 block text-center">Do you have kids? *</label>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setFormData({
                ...formData,
                deal_breakers: { ...formData.deal_breakers, has_kids: false }
              })}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                formData.deal_breakers.has_kids === false
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
              }`}
            >
              No
            </button>
            <button
              onClick={() => setFormData({
                ...formData,
                deal_breakers: { ...formData.deal_breakers, has_kids: true }
              })}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                formData.deal_breakers.has_kids === true
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
              }`}
            >
              Yes
            </button>
          </div>
        </div>

        <div>
          <label className="text-white font-medium mb-3 block text-center">Do you want kids in the future? *</label>
          <div className="flex flex-wrap gap-3 justify-center">
            {['yes', 'no', 'maybe', 'open'].map((want) => (
              <button
                key={want}
                onClick={() => setFormData({
                  ...formData,
                  deal_breakers: { ...formData.deal_breakers, want_kids: want }
                })}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  formData.deal_breakers.want_kids === want
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
                }`}
              >
                {want === 'yes' ? '✅ Yes' :
                 want === 'no' ? '❌ No' :
                 want === 'maybe' ? '🤷 Maybe' :
                 '💭 Open to it'}
              </button>
            ))}
          </div>
        </div>

        {/* Smoking */}
        <div>
          <label className="text-white font-medium mb-3 block text-center">Do you smoke? *</label>
          <div className="flex flex-wrap gap-3 justify-center">
            {['no', 'occasionally', 'yes'].map((smoke) => (
              <button
                key={smoke}
                onClick={() => setFormData({
                  ...formData,
                  deal_breakers: { ...formData.deal_breakers, smoking: smoke }
                })}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  formData.deal_breakers.smoking === smoke
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
                }`}
              >
                {smoke === 'no' ? '🚭 Never' :
                 smoke === 'occasionally' ? '🤏 Occasionally' :
                 '🚬 Yes'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLifestyleStep = () => (
    <div className="space-y-8 animate-fadeIn pb-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-light text-white mb-3">
          Your Vibe
        </h2>
        <p className="text-white/60 text-lg">What makes you, you?</p>
      </div>

      {/* Interests */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-white text-center mb-4">Your Interests</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {INTERESTS_OPTIONS.map((interest) => (
            <button
              key={interest}
              onClick={() => {
                const selected = formData.interests.includes(interest);
                setFormData({
                  ...formData,
                  interests: selected
                    ? formData.interests.filter(i => i !== interest)
                    : [...formData.interests, interest]
                });
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                formData.interests.includes(interest)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Lifestyle Sliders */}
      <div className="space-y-6 mt-12">
        <h3 className="text-xl font-medium text-white text-center mb-6">Your Lifestyle</h3>
        {LIFESTYLE_SLIDERS.map((slider) => (
          <div key={slider.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{slider.emoji}</span>
                <span className="text-white font-medium">{slider.label}</span>
              </div>
              <span className="text-white/80 font-bold text-lg">
                {formData.lifestyle_factors[slider.key]}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              value={formData.lifestyle_factors[slider.key]}
              onChange={(e) => setFormData({
                ...formData,
                lifestyle_factors: {
                  ...formData.lifestyle_factors,
                  [slider.key]: parseInt(e.target.value)
                }
              })}
              className="cosmic-slider w-full h-2 bg-white/20 rounded-full outline-none appearance-none cursor-pointer"
            />

            <div className="flex justify-between text-xs text-white/60">
              <span>{slider.leftLabel}</span>
              <span>{slider.rightLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNiceToHavesStep = () => (
    <div className="space-y-8 animate-fadeIn pb-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-light text-white mb-3">
          Fine-tune your vibe 💫
        </h2>
        <p className="text-white/60 text-lg">Optional - helps us find better matches</p>
      </div>

      <div className="space-y-6">
        {/* Religion */}
        <div>
          <label className="text-white font-medium mb-3 block text-center">Religion / Spirituality</label>
          <div className="flex flex-wrap gap-3 justify-center">
            {['not_religious', 'spiritual', 'christian', 'other'].map((rel) => (
              <button
                key={rel}
                onClick={() => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, religion: rel }
                })}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  formData.preferences.religion === rel
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
                }`}
              >
                {rel === 'not_religious' ? '🙅 Not Religious' :
                 rel === 'spiritual' ? '✨ Spiritual' :
                 rel === 'christian' ? '⛪ Christian' :
                 '🌍 Other'}
              </button>
            ))}
          </div>
        </div>

        {/* Politics */}
        <div>
          <label className="text-white font-medium mb-3 block text-center">Political Views</label>
          <div className="flex flex-wrap gap-3 justify-center">
            {['liberal', 'moderate', 'conservative', 'apolitical'].map((pol) => (
              <button
                key={pol}
                onClick={() => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, politics: pol }
                })}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  formData.preferences.politics === pol
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
                }`}
              >
                {pol === 'liberal' ? '🔵 Liberal' :
                 pol === 'moderate' ? '🟣 Moderate' :
                 pol === 'conservative' ? '🔴 Conservative' :
                 '🤷 Apolitical'}
              </button>
            ))}
          </div>
        </div>

        {/* Diet */}
        <div>
          <label className="text-white font-medium mb-3 block text-center">Diet Preference</label>
          <div className="flex flex-wrap gap-3 justify-center">
            {['balanced', 'vegetarian', 'vegan', 'no_preference'].map((diet) => (
              <button
                key={diet}
                onClick={() => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, diet: diet }
                })}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  formData.preferences.diet === diet
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
                }`}
              >
                {diet === 'balanced' ? '🍽️ Balanced' :
                 diet === 'vegetarian' ? '🥗 Vegetarian' :
                 diet === 'vegan' ? '🌱 Vegan' :
                 '🍕 No Preference'}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise */}
        <div>
          <label className="text-white font-medium mb-3 block text-center">Exercise Frequency</label>
          <div className="flex flex-wrap gap-3 justify-center">
            {['regular', 'occasional', 'rarely'].map((ex) => (
              <button
                key={ex}
                onClick={() => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, exercise: ex }
                })}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  formData.preferences.exercise === ex
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 border border-white/30 hover:bg-white/20'
                }`}
              >
                {ex === 'regular' ? '💪 Regular (3+/week)' :
                 ex === 'occasional' ? '🏃 Occasional (1-2/week)' :
                 '🛋️ Rarely'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhotosStep = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
          <Upload className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-light text-white mb-3">
          Show Your Spark ✨
        </h2>
        <p className="text-white/60 text-lg">Upload 3 photos</p>
      </div>

      <div className="space-y-4">
        {['Face photo', 'Full body photo', 'Lifestyle photo'].map((label, idx) => (
          <div key={idx}>
            <label className="text-sm font-semibold text-white mb-2 block">{label} *</label>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e, idx)}
              />
              <div className={`relative h-48 rounded-xl border-2 border-dashed transition-all ${
                formData.photos[idx]
                  ? 'border-white bg-white/10'
                  : 'border-white/40 bg-white/5 hover:border-white hover:bg-white/10'
              }`}>
                {formData.photos[idx] ? (
                  <>
                    <img
                      src={formData.photos[idx]}
                      alt={label}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const newPhotos = [...formData.photos];
                        newPhotos[idx] = null;
                        setFormData({ ...formData, photos: newPhotos });
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Upload className="w-10 h-10 text-white/60 mb-2" />
                    <span className="text-white/80 text-sm">Click to upload</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStepData.id) {
      case 'identity': return renderIdentityStep();
      case 'mbti': return renderMBTIStep();
      case 'dealbreakers': return renderDealBreakersStep();
      case 'lifestyle': return renderLifestyleStep();
      case 'nicetohaves': return renderNiceToHavesStep();
      case 'photos': return renderPhotosStep();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-y-auto">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {renderProgressTracker()}

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-32 max-w-2xl">
        {renderCurrentStep()}

        {/* Navigation */}
        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-all flex items-center justify-center gap-2 backdrop-blur-sm border border-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
              className={`flex-1 px-6 py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                canContinue()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canContinue() || loading}
              className={`flex-1 px-6 py-4 rounded-2xl font-medium transition-all ${
                canContinue() && !loading
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating your cosmic profile...' : 'Complete ✨'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }

        .cosmic-bubble-selected {
          animation: bubble-pulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.6));
        }
        @keyframes bubble-pulse {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.2); }
        }

        .cosmic-slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
          transition: all 0.3s;
        }
        .cosmic-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
        }
        .cosmic-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
}