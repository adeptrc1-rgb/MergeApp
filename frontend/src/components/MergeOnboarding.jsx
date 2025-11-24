import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Zap, ChevronRight, ChevronLeft, Upload, Heart, MessageCircle, User } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Interest options for multi-select
const INTEREST_OPTIONS = [
  // Outdoor & Adventure
  'Hiking', 'Camping', 'Rock Climbing', 'Surfing', 'Skiing', 'Snowboarding', 'Kayaking', 'Cycling',
  
  // Food & Drink
  'Cooking', 'Baking', 'Coffee', 'Wine', 'Craft Beer', 'Food Tours', 'Veganism', 'Mixology',
  
  // Arts & Creativity
  'Music', 'Art', 'Photography', 'Painting', 'Drawing', 'Pottery', 'Crafts', 'Writing', 'Poetry',
  
  // Performing Arts
  'Dancing', 'Theater', 'Singing', 'Stand-up Comedy', 'Improv',
  
  // Fitness & Wellness
  'Fitness', 'Yoga', 'Pilates', 'Meditation', 'Running', 'Weightlifting', 'CrossFit', 'Boxing', 'Martial Arts',
  
  // Entertainment
  'Gaming', 'Movies', 'TV Shows', 'Anime', 'Board Games', 'Escape Rooms', 'Concerts', 'Festivals',
  
  // Intellectual & Learning
  'Reading', 'Podcasts', 'Documentaries', 'Science', 'History', 'Philosophy', 'Astronomy', 'Languages',
  
  // Social & Community
  'Volunteering', 'Activism', 'Environmentalism', 'Networking', 'Public Speaking',
  
  // Travel & Culture
  'Travel', 'Backpacking', 'Road Trips', 'Museums', 'Architecture', 'Cultural Events',
  
  // Tech & Innovation
  'Tech', 'Coding', 'Startups', 'Crypto', 'AI', 'Robotics', 'DIY Projects',
  
  // Style & Fashion
  'Fashion', 'Streetwear', 'Vintage Shopping', 'Thrifting', 'Makeup', 'Skincare',
  
  // Animals & Nature
  'Pets', 'Dogs', 'Cats', 'Gardening', 'Plants', 'Bird Watching', 'Wildlife',
  
  // Sports & Competition
  'Sports', 'Basketball', 'Soccer', 'Football', 'Tennis', 'Golf', 'Baseball', 'Hockey',
  
  // Music Genres & Instruments
  'Live Music', 'DJing', 'Guitar', 'Piano', 'Drums', 'Electronic Music', 'Indie Music', 'Jazz', 'Hip Hop', 'Rock',
  
  // Other Hobbies
  'Cars', 'Motorcycles', 'Vintage Collecting', 'Antiques', 'Sneakers', 'Comics', 'Magic Tricks', 'Astrology', 'Tarot'
].sort();

export default function MergeOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [interestSearch, setInterestSearch] = useState('');
  const [showInterestSuggestions, setShowInterestSuggestions] = useState(false);

  const totalSteps = 5;
  const totalQuestions = 20;

  const [formData, setFormData] = useState({
    // Step 1: Identity
    first_name: '',
    birth_date: '',
    gender_identity: '',
    interested_in: [],
    hometown: '',

    // Step 2: Personality - Scenarios
    social_energy_source: '', // 'extroversion' or 'introversion'
    information_processing: '', // 'sensing' or 'intuition'
    decision_making: '', // 'thinking' or 'feeling'

    // Step 2: Personality - Sliders
    mbti_sliders: {
      energy: 3,
      information: 3,
      decision: 3,
      planning: 3,
      expression: 3
    },

    // Step 3: Lifestyle
    connection_style: '',
    kids_preference: '',
    top_interests: [],
    // social_energy_level removed from lifestyle step

    // Step 4: Weekend & Communication
    ideal_weekend: '',
    conflict_style: '',
    love_language: '',
    texting_style: '',

    // Step 5: Photos
    photos: [null, null, null]
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const getCompletedQuestions = () => {
    let count = 0;
    if (step > 1) count += 6; // Essentials & Intent
    if (step > 2) count += 8; // Personality
    if (step > 3) count += 2; // Lifestyle & Interests
    if (step > 4) count += 3; // Communication
    if (step > 5) count += formData.photos.filter(p => p).length; // Photos
    return count;
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        // Step 1: only require core identity fields to move forward
        return formData.first_name && formData.birth_date && formData.hometown;
      case 2:
        // Core personality step: require only the two scenario choices
        return formData.information_processing && 
               formData.decision_making;
      case 3:
        return formData.connection_style && formData.top_interests.length > 0;
      case 4:
        return formData.conflict_style && 
               formData.love_language && 
               formData.texting_style;
      case 5:
        return formData.photos.filter(p => p).length >= 1;
      default:
        return false;
    }
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
    setLoading(true);
    try {
      // Calculate MBTI from scenarios and sliders
      const mbti = calculateMBTI();
      
      const profileData = {
        first_name: formData.first_name,
        birth_date: formData.birth_date,
        hometown: formData.hometown,
        
        // Personality
        personality_type: mbti,
        social_energy_source: formData.social_energy_source,
        information_processing: formData.information_processing,
        decision_making: formData.decision_making,
        mbti_sliders: formData.mbti_sliders,
        mbti_scores: {
          E: formData.social_energy_source === 'extroversion' ? formData.mbti_sliders.energy * 20 : (5 - formData.mbti_sliders.energy) * 20,
          N: formData.information_processing === 'intuition' ? formData.mbti_sliders.information * 20 : (5 - formData.mbti_sliders.information) * 20,
          F: formData.decision_making === 'feeling' ? formData.mbti_sliders.decision * 20 : (5 - formData.mbti_sliders.decision) * 20,
          P: formData.mbti_sliders.planning * 20
        },
        
        // Lifestyle
        deal_breakers: {
          connection_style: formData.connection_style,
          want_kids: formData.kids_preference
        },
        interests: formData.top_interests,
        lifestyle_factors: {
          // social_energy removed from lifestyle step per design update
          occupation: '' // Will be added later
        },
        
        // Communication & Weekend
        preferences: {
          conflict_style: formData.conflict_style,
          love_language: formData.love_language,
          texting_style: formData.texting_style,
          ideal_weekend: formData.ideal_weekend
        },
        
        // Photos
        photos: formData.photos.filter(p => p),
        profile_completed: true
      };

      console.log('Submitting onboarding data:', profileData);

      const response = await axios.post(`${API}/onboarding/complete`, profileData, {
        withCredentials: true
      });

      console.log('Onboarding complete:', response.data);

      // Redirect to home
      navigate('/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to complete profile';
      alert(`Failed to complete profile: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateMBTI = () => {
    const e_i = formData.social_energy_source === 'extroversion' ? 'E' : 'I';
    const s_n = formData.information_processing === 'intuition' ? 'N' : 'S';
    const t_f = formData.decision_making === 'feeling' ? 'F' : 'T';
    const j_p = formData.mbti_sliders.planning >= 3 ? 'J' : 'P';
    return `${e_i}${s_n}${t_f}${j_p}`;
  };

  const renderProgressTracker = () => {
    const completed = getCompletedQuestions();
    const percentage = (completed / totalQuestions) * 100;

    return (
      <div className="fixed top-8 left-0 right-0 z-50 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-5 h-5 animate-pulse" style={{ color: '#3B82F6' }} />
            <span className="font-medium text-sm" style={{ color: '#FAFAFA' }}>
              {completed} of {totalQuestions} questions completed
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#171717', border: '1px solid #262626' }}>
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{ 
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
        }}>
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-semibold mb-3" style={{ color: '#FAFAFA' }}>
          Essentials & Intent
        </h2>
        <p className="text-lg" style={{ color: '#A3A3A3' }}>Let's start with the basics and what you're looking for</p>
      </div>

      <div className="space-y-5">
        {/* First Name */}
        <div>
          <label className="block text-sm mb-2" style={{ color: '#A3A3A3' }}>What's your first name?</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-5 py-4 rounded-xl focus:outline-none transition-all"
            style={{
              backgroundColor: '#171717',
              border: '1px solid #404040',
              color: '#FAFAFA'
            }}
            placeholder="Your first name"
            onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#404040'}
          />
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-sm mb-2" style={{ color: '#A3A3A3' }}>When were you born?</label>
          <p className="text-xs mb-2" style={{ color: '#737373' }}>Helps us find astrologically aligned matches</p>
          <input
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            className="w-full px-5 py-4 rounded-xl focus:outline-none transition-all"
            style={{
              backgroundColor: '#171717',
              border: '1px solid #404040',
              color: '#FAFAFA'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#404040'}
          />
        </div>

        {/* Gender Identity */}
        <div>
          <label className="block text-sm mb-2" style={{ color: '#A3A3A3' }}>How do you identify?</label>
          <div className="grid grid-cols-3 gap-3">
            {/* Man */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender_identity: 'man' })}
              className="p-4 rounded-xl transition-all flex flex-col items-center gap-2"
              style={{
                backgroundColor: formData.gender_identity === 'man' ? '#3B82F6' : '#171717',
                border: formData.gender_identity === 'man' ? '2px solid #3B82F6' : '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <div className="text-2xl">♂</div>
              <span className="text-sm font-medium">Man</span>
            </button>

            {/* Woman */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender_identity: 'woman' })}
              className="p-4 rounded-xl transition-all flex flex-col items-center gap-2"
              style={{
                backgroundColor: formData.gender_identity === 'woman' ? '#3B82F6' : '#171717',
                border: formData.gender_identity === 'woman' ? '2px solid #3B82F6' : '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <div className="text-2xl">♀</div>
              <span className="text-sm font-medium">Woman</span>
            </button>

            {/* Non-binary */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender_identity: 'non-binary' })}
              className="p-4 rounded-xl transition-all flex flex-col items-center gap-2"
              style={{
                backgroundColor: formData.gender_identity === 'non-binary' ? '#3B82F6' : '#171717',
                border: formData.gender_identity === 'non-binary' ? '2px solid #3B82F6' : '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <div className="text-2xl">⚧</div>
              <span className="text-sm font-medium">Non-binary</span>
            </button>
          </div>
        </div>

        {/* Interested In */}
        <div>
          <label className="block text-sm mb-1" style={{ color: '#A3A3A3' }}>Who Would You Like to Connect With?</label>
          <p className="text-xs mb-3" style={{ color: '#737373' }}>
            We'll show you profiles that match your preferences. <span style={{ fontSize: '10px' }}>(You can pick more than one)</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            {/* Men */}
            <button
              type="button"
              onClick={() => {
                const interested = formData.interested_in.includes('men')
                  ? formData.interested_in.filter(g => g !== 'men')
                  : [...formData.interested_in, 'men'];
                setFormData({ ...formData, interested_in: interested });
              }}
              className="p-4 rounded-xl transition-all flex flex-col items-center gap-2"
              style={{
                backgroundColor: formData.interested_in.includes('men') ? '#3B82F6' : '#171717',
                border: formData.interested_in.includes('men') ? '2px solid #3B82F6' : '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <div className="text-2xl">♂</div>
              <span className="text-sm font-medium">Men</span>
            </button>

            {/* Women */}
            <button
              type="button"
              onClick={() => {
                const interested = formData.interested_in.includes('women')
                  ? formData.interested_in.filter(g => g !== 'women')
                  : [...formData.interested_in, 'women'];
                setFormData({ ...formData, interested_in: interested });
              }}
              className="p-4 rounded-xl transition-all flex flex-col items-center gap-2"
              style={{
                backgroundColor: formData.interested_in.includes('women') ? '#3B82F6' : '#171717',
                border: formData.interested_in.includes('women') ? '2px solid #3B82F6' : '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <div className="text-2xl">♀</div>
              <span className="text-sm font-medium">Women</span>
            </button>

            {/* Non-binary */}
            <button
              type="button"
              onClick={() => {
                const interested = formData.interested_in.includes('non-binary')
                  ? formData.interested_in.filter(g => g !== 'non-binary')
                  : [...formData.interested_in, 'non-binary'];
                setFormData({ ...formData, interested_in: interested });
              }}
              className="p-4 rounded-xl transition-all flex flex-col items-center gap-2"
              style={{
                backgroundColor: formData.interested_in.includes('non-binary') ? '#3B82F6' : '#171717',
                border: formData.interested_in.includes('non-binary') ? '2px solid #3B82F6' : '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <div className="text-2xl">⚧</div>
              <span className="text-sm font-medium">Non-binary</span>
            </button>
          </div>
        </div>

        {/* Connection Style */}
        <div>
          <label className="block text-sm mb-3" style={{ color: '#A3A3A3' }}>I build connections through...</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'shared_experiences', label: 'Shared experiences and living in the moment' },
              { value: 'meaningful_conversations', label: 'Meaningful conversations that last for hours' },
              { value: 'common_values', label: 'Finding common values and life goals' },
              { value: 'balanced_approach', label: 'A balance of fun and deep talks' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, connection_style: option.value })}
                className="px-4 py-3 rounded-xl transition-all text-sm"
                style={formData.connection_style === option.value ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: '1px solid transparent'
                } : {
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  color: '#A3A3A3'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hometown */}
        <div>
          <label className="block text-sm mb-2" style={{ color: '#A3A3A3' }}>Where did you grow up?</label>
          <p className="text-xs mb-2" style={{ color: '#737373' }}>A great way to break the ice</p>
          <input
            type="text"
            value={formData.hometown}
            onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
            className="w-full px-5 py-4 rounded-xl focus:outline-none transition-all"
            style={{
              backgroundColor: '#171717',
              border: '1px solid #404040',
              color: '#FAFAFA'
            }}
            placeholder="City, State/Country"
            onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#404040'}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
        }}>
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-semibold mb-3" style={{ color: '#FAFAFA' }}>
          Core Personality
        </h2>
        <p className="text-lg" style={{ color: '#A3A3A3' }}>Which feels more naturally like you?</p>
      </div>

      <div className="space-y-6">
        {/* Part A: The Big 3 Scenarios */}
        <div className="space-y-5">
          {/* Scenario 1: Social Energy - moved to Lifestyle step */}

          {/* Scenario 2: Information Processing */}
          <div>
            <p className="text-sm mb-3" style={{ color: '#FAFAFA' }}>You're more convinced by:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, information_processing: 'sensing' })}
                className="px-4 py-3 rounded-xl transition-all text-sm font-medium"
                style={formData.information_processing === 'sensing' ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: '1px solid transparent'
                } : {
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  color: '#A3A3A3'
                }}
              >
                Concrete facts
              </button>
              <button
                onClick={() => setFormData({ ...formData, information_processing: 'intuition' })}
                className="px-4 py-3 rounded-xl transition-all text-sm font-medium"
                style={formData.information_processing === 'intuition' ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: '1px solid transparent'
                } : {
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  color: '#A3A3A3'
                }}
              >
                Patterns & possibilities
              </button>
            </div>
          </div>

          {/* Scenario 3: Decision Making */}
          <div>
            <p className="text-sm mb-3" style={{ color: '#FAFAFA' }}>When deciding, you prioritize:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, decision_making: 'thinking' })}
                className="px-4 py-3 rounded-xl transition-all text-sm font-medium"
                style={formData.decision_making === 'thinking' ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: '1px solid transparent'
                } : {
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  color: '#A3A3A3'
                }}
              >
                Logical consistency
              </button>
              <button
                onClick={() => setFormData({ ...formData, decision_making: 'feeling' })}
                className="px-4 py-3 rounded-xl transition-all text-sm font-medium"
                style={formData.decision_making === 'feeling' ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: '1px solid transparent'
                } : {
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  color: '#A3A3A3'
                }}
              >
                Personal values
              </button>
            </div>
          </div>
        </div>

        {/* Part B: 5 Orb Sliders */}
        <div className="pt-6" style={{ borderTop: '1px solid #262626' }}>
          <p className="text-sm mb-4" style={{ color: '#A3A3A3' }}>Tap the orbs that resonate with you:</p>
          
          <style>{`
            @keyframes orbPulse {
              0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
              }
              50% {
                transform: scale(1.1);
                box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
              }
            }
            
            @keyframes orbGlow {
              0%, 100% {
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4);
              }
              50% {
                box-shadow: 0 0 30px rgba(59, 130, 246, 0.9), 0 0 60px rgba(139, 92, 246, 0.6);
              }
            }

            .orb-inactive {
              background: #262626;
              border: 2px solid #404040;
              transition: all 0.3s ease;
            }

            .orb-inactive:hover {
              background: #333333;
              border-color: #525252;
              transform: scale(1.05);
            }

            .orb-active {
              background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
              animation: orbPulse 2s ease-in-out infinite;
              border: 2px solid transparent;
            }

            .orb-selected {
              background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
              animation: orbGlow 1.5s ease-in-out infinite;
              border: 2px solid rgba(255, 255, 255, 0.3);
              transform: scale(1.15);
            }
          `}</style>
          
          {[
            { key: 'energy', left: 'Quiet & Reflective', right: 'Social & Expressive' },
            { key: 'information', left: 'Practical & Detailed', right: 'Imaginative & Big-Picture' },
            { key: 'decision', left: 'Logical & Analytical', right: 'Empathetic & Compassionate' },
            { key: 'planning', left: 'Structured & Decisive', right: 'Flexible & Adaptable' },
            { key: 'expression', left: 'Private & Reserved', right: 'Open & Expressive' }
          ].map((slider) => (
            <div key={slider.key} className="mb-8">
              <div className="flex justify-between text-xs mb-3" style={{ color: '#737373' }}>
                <span>{slider.left}</span>
                <span>{slider.right}</span>
              </div>
              
              {/* Orb Selection */}
              <div className="flex justify-between items-center px-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isSelected = formData.mbti_sliders[slider.key] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        mbti_sliders: { ...formData.mbti_sliders, [slider.key]: value }
                      })}
                      className={isSelected ? 'orb-selected' : 'orb-inactive'}
                      style={{
                        width: isSelected ? '48px' : '40px',
                        height: isSelected ? '48px' : '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <span className="text-xs font-medium" style={{ 
                        color: isSelected ? '#FFFFFF' : '#737373',
                        fontWeight: isSelected ? 'bold' : 'normal'
                      }}>
                        {value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
        }}>
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-semibold mb-3" style={{ color: '#FAFAFA' }}>
          Lifestyle & Interests
        </h2>
        <p className="text-lg" style={{ color: '#A3A3A3' }}>What brings you joy</p>
      </div>

      <div className="space-y-6">
        {/* Top 3 Interests - Autocomplete */}
        <div>
          <label className="block text-sm mb-3" style={{ color: '#FAFAFA' }}>Type your top 3 passions:</label>
          
          {/* Selected Interests Display */}
          {formData.top_interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.top_interests.map((interest) => (
                <div
                  key={interest}
                  className="px-4 py-2 rounded-full transition-all text-sm flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        top_interests: formData.top_interests.filter(i => i !== interest)
                      });
                    }}
                    className="hover:opacity-70"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={interestSearch}
              onChange={(e) => {
                setInterestSearch(e.target.value);
                setShowInterestSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowInterestSuggestions(interestSearch.length > 0)}
              placeholder="Start typing... (e.g., hiking, music, cooking)"
              className="w-full px-5 py-4 rounded-xl focus:outline-none transition-all"
              style={{
                backgroundColor: '#171717',
                border: '1px solid #404040',
                color: '#FAFAFA'
              }}
              onFocusCapture={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#404040';
                setTimeout(() => setShowInterestSuggestions(false), 200);
              }}
              disabled={formData.top_interests.length >= 3}
            />

            {/* Autocomplete Suggestions */}
            {showInterestSuggestions && (
              <div 
                className="absolute w-full mt-2 rounded-xl overflow-hidden shadow-lg z-10"
                style={{
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {INTEREST_OPTIONS
                  .filter(interest => 
                    interest.toLowerCase().includes(interestSearch.toLowerCase()) &&
                    !formData.top_interests.includes(interest)
                  )
                  .map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        if (formData.top_interests.length < 3) {
                          setFormData({
                            ...formData,
                            top_interests: [...formData.top_interests, interest]
                          });
                          setInterestSearch('');
                          setShowInterestSuggestions(false);
                        }
                      }}
                      className="w-full px-4 py-3 text-left text-sm transition-all hover:bg-white/10"
                      style={{ color: '#FAFAFA' }}
                    >
                      {interest}
                    </button>
                  ))}
                {INTEREST_OPTIONS.filter(interest => 
                  interest.toLowerCase().includes(interestSearch.toLowerCase()) &&
                  !formData.top_interests.includes(interest)
                ).length === 0 && (
                  <div className="px-4 py-3 text-sm" style={{ color: '#737373' }}>
                    No matches found
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs mt-2" style={{ color: '#737373' }}>
            Selected: {formData.top_interests.length}/3 {formData.top_interests.length >= 3 && '✓ Complete'}
          </p>
        </div>

        {/* Social Energy - How do you recharge */}
        <div>
          <p className="text-sm mb-3" style={{ color: '#FAFAFA' }}>How do you recharge your social energy?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, social_energy_source: 'mostly_alone' })}
              className="px-4 py-3 rounded-xl transition-all text-sm font-medium"
              style={formData.social_energy_source === 'mostly_alone' ? {
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                border: '1px solid transparent'
              } : {
                backgroundColor: '#171717',
                border: '1px solid #404040',
                color: '#A3A3A3'
              }}
            >
              Mostly through quiet time alone
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, social_energy_source: 'mostly_people' })}
              className="px-4 py-3 rounded-xl transition-all text-sm font-medium"
              style={formData.social_energy_source === 'mostly_people' ? {
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                border: '1px solid transparent'
              } : {
                backgroundColor: '#171717',
                border: '1px solid #404040',
                color: '#A3A3A3'
              }}
            >
              Mostly through time with others
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, social_energy_source: 'balanced_mix' })}
              className="px-4 py-3 rounded-xl transition-all text-sm font-medium col-span-2"
              style={formData.social_energy_source === 'balanced_mix' ? {
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                border: '1px solid transparent'
              } : {
                backgroundColor: '#171717',
                border: '1px solid #404040',
                color: '#A3A3A3'
              }}
            >
              A balanced mix of both
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, social_energy_source: 'depends_mood' })}
              className="px-4 py-3 rounded-xl transition-all text-sm font-medium col-span-2"
              style={formData.social_energy_source === 'depends_mood' ? {
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                border: '1px solid transparent'
              } : {
                backgroundColor: '#171717',
                border: '1px solid #404040',
                color: '#A3A3A3'
              }}
            >
              It really depends on my mood
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
        }}>
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-semibold mb-3" style={{ color: '#FAFAFA' }}>
          Communication
        </h2>
        <p className="text-lg" style={{ color: '#A3A3A3' }}>How you express yourself and handle conflict</p>
      </div>

      <div className="space-y-6">
        {/* Conflict Style */}
        <div>
          <label className="block text-sm mb-3" style={{ color: '#FAFAFA' }}>How do you handle disagreement?</label>
          <div className="space-y-2">
            {[
              { value: 'talk_immediately', label: 'Talk it out immediately and directly' },
              { value: 'need_space', label: 'Need space to process, then discuss' },
              { value: 'avoid_conflict', label: 'Prefer to avoid conflict and move on' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, conflict_style: option.value })}
                className="w-full px-4 py-3 rounded-xl transition-all text-sm text-left"
                style={formData.conflict_style === option.value ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: '1px solid transparent'
                } : {
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  color: '#A3A3A3'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Love Language */}
        <div>
          <label className="block text-sm mb-3" style={{ color: '#FAFAFA' }}>How do you prefer to give and receive affection?</label>
          <div className="space-y-2">
            {[
              { value: 'words_quality', label: 'Words of affirmation and quality time' },
              { value: 'acts_touch', label: 'Acts of service and physical touch' },
              { value: 'balanced', label: 'A balanced mix of all' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, love_language: option.value })}
                className="w-full px-4 py-3 rounded-xl transition-all text-sm text-left"
                style={formData.love_language === option.value ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: '1px solid transparent'
                } : {
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  color: '#A3A3A3'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Texting Style */}
        <div>
          <label className="block text-sm mb-3" style={{ color: '#FAFAFA' }}>Your typical texting style is:</label>
          <div className="space-y-2">
            {[
              { value: 'quick_frequent', label: 'Quick and frequent throughout the day' },
              { value: 'thoughtful', label: 'Slower, more thoughtful replies' },
              { value: 'varies', label: "It varies, but I'm a good communicator" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, texting_style: option.value })}
                className="w-full px-4 py-3 rounded-xl transition-all text-sm text-left"
                style={formData.texting_style === option.value ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  border: '1px solid transparent'
                } : {
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  color: '#A3A3A3'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
        }}>
          <Upload className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-semibold mb-3" style={{ color: '#FAFAFA' }}>
          Upload 3 Photos
        </h2>
        <p className="text-lg" style={{ color: '#A3A3A3' }}>Show us your spark. Let your personality shine through.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="aspect-square">
            <input
              type="file"
              id={`photo-${index}`}
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e, index)}
              className="hidden"
            />
            <label
              htmlFor={`photo-${index}`}
              className="block w-full h-full rounded-xl cursor-pointer transition-all"
              style={{
                backgroundColor: '#171717',
                border: '2px dashed #404040',
                backgroundImage: formData.photos[index] ? `url(${formData.photos[index]})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!formData.photos[index] && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 mb-2" style={{ color: '#737373' }} />
                  <span className="text-xs" style={{ color: '#737373' }}>Upload</span>
                </div>
              )}
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-center" style={{ color: '#737373' }}>
        Max 5MB per photo • {formData.photos.filter(p => p).length}/3 uploaded
      </p>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-y-auto">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}></div>
      </div>

      {renderProgressTracker()}

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-32 max-w-2xl">
        {renderCurrentStep()}

        {/* Navigation */}
        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-6 py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: '#171717',
                border: '1px solid #404040',
                color: '#FAFAFA'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#262626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#171717'}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
              className="flex-1 px-6 py-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2"
              style={canContinue() ? {
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
              } : {
                backgroundColor: '#171717',
                color: '#525252',
                cursor: 'not-allowed'
              }}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canContinue() || loading}
              className="flex-1 px-6 py-4 rounded-2xl font-medium transition-all"
              style={canContinue() && !loading ? {
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
              } : {
                backgroundColor: '#171717',
                color: '#525252',
                cursor: 'not-allowed'
              }}
            >
              {loading ? 'Creating your profile...' : 'Complete ✨'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #171717;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563EB, #7C3AED);
        }
        
        .slider-merge::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
          transition: all 0.3s;
        }
        .slider-merge::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
        }
        .slider-merge::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
}
