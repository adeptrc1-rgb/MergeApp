import React, { useState } from 'react';
import { X, Camera, Music, Sparkles, Lock } from 'lucide-react';
import PhotoEditorModal from './PhotoEditorModal';
import MusicConnect from './MusicConnect';

const POPULAR_INTERESTS = [
  'Yoga', 'Hiking', 'Photography', 'Travel', 'Music', 'Cooking',
  'Reading', 'Gaming', 'Fitness', 'Art', 'Dancing', 'Movies',
  'Sports', 'Foodie', 'Technology', 'Science', 'Nature', 'Animals',
  'Wine Tasting', 'Coffee', 'Meditation', 'Running', 'Cycling',
  'Swimming', 'Camping', 'Beach', 'Mountains', 'Fashion', 'Writing',
  'Painting', 'Drawing', 'Theater', 'Concerts', 'Festivals',
  'Comedy', 'Podcasts', 'Volunteering', 'Politics', 'History',
  'Philosophy', 'Psychology', 'Astrology', 'Spirituality', 'Wellness',
  'Vegan', 'Vegetarian', 'Baking', 'Gardening', 'DIY', 'Crafts'
];

export default function EditProfileModal({ user, onSave, onClose }) {
  const [editedName, setEditedName] = useState(user.first_name || '');
  const [editedIndustry, setEditedIndustry] = useState(user.industry || '');
  const [editedJobTitle, setEditedJobTitle] = useState(user.job_title || '');
  const [editedLocation, setEditedLocation] = useState(user.location || '');
  const [editedBio, setEditedBio] = useState(user.bio || '');
  const [editedInterests, setEditedInterests] = useState(user.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showMusicConnect, setShowMusicConnect] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Lifestyle choices
  const [workout, setWorkout] = useState(user.lifestyle?.workout || '');
  const [drinking, setDrinking] = useState(user.lifestyle?.drinking || '');
  const [smoking, setSmoking] = useState(user.lifestyle?.smoking || '');
  const [marijuana, setMarijuana] = useState(user.lifestyle?.marijuana || '');
  const [dietaryPreference, setDietaryPreference] = useState(user.lifestyle?.dietary_preference || '');
  const [socialMedia, setSocialMedia] = useState(user.lifestyle?.social_media || '');
  
  // Profile Display (premium features - not editable)
  const [showAge] = useState(user.show_age !== false);
  const [showDistance] = useState(user.show_distance !== false);

  const handleInterestInput = (e) => {
    const value = e.target.value;
    setNewInterest(value);
    
    if (value.trim().length > 0) {
      const query = value.toLowerCase();
      const exactMatches = POPULAR_INTERESTS.filter(interest =>
        interest.toLowerCase().includes(query) &&
        !editedInterests.includes(interest)
      );
      
      const popularNotAdded = POPULAR_INTERESTS.filter(interest =>
        !editedInterests.includes(interest)
      ).slice(0, 5);
      
      const suggestions = exactMatches.length > 0 
        ? exactMatches.slice(0, 5)
        : popularNotAdded;
      
      setFilteredSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addInterest = (interest) => {
    const interestToAdd = interest || newInterest.trim();
    if (interestToAdd && !editedInterests.includes(interestToAdd)) {
      setEditedInterests([...editedInterests, interestToAdd]);
      setNewInterest('');
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const removeInterest = (interest) => {
    setEditedInterests(editedInterests.filter(i => i !== interest));
  };

  const handleSave = async () => {
    console.log('[EDIT PROFILE] Save button clicked');
    setSaving(true);
    try {
      await onSave({
        first_name: editedName,
        industry: editedIndustry,
        job_title: editedJobTitle,
        location: editedLocation,
        bio: editedBio,
        interests: editedInterests,
        lifestyle: {
          workout,
          drinking,
          smoking,
          marijuana,
          dietary_preference: dietaryPreference,
          social_media: socialMedia
        }
      });
      console.log('[EDIT PROFILE] Save completed successfully');
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.error('[EDIT PROFILE] Save error:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Edit Profile Modal */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div 
          className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-2xl w-full my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 p-6 flex items-center justify-between z-10 rounded-t-2xl">
            <h2 className="text-2xl font-light text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Photos Section */}
            <div className="space-y-3">
              <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Photos</h3>
              <button
                onClick={() => {
                  console.log('[EDIT PROFILE] Photo manager clicked');
                  alert('Photo management requires backend connection. Available after full authentication.');
                }}
                className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-400/30 rounded-xl p-4 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">Manage Photos</div>
                    <div className="text-white/60 text-sm">Upload, reorder, or delete</div>
                  </div>
                </div>
                <div className="text-purple-400 group-hover:translate-x-1 transition-transform">→</div>
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Basic Information</h3>
              
              <div>
                <label className="text-white/60 text-xs mb-1 block">Display Name</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1 block">Industry</label>
                <select
                  value={editedIndustry}
                  onChange={(e) => setEditedIndustry(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Legal">Legal</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1 block">Job Title</label>
                <input
                  type="text"
                  value={editedJobTitle}
                  onChange={(e) => setEditedJobTitle(e.target.value)}
                  placeholder="What you do"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1 block">Location</label>
                <input
                  type="text"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  placeholder="City, State"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                />
              </div>
            </div>

            {/* About Me */}
            <div className="space-y-3">
              <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">About Me</h3>
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Tell others about yourself..."
                maxLength={500}
                rows={5}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 resize-none transition-all"
              />
              <div className="text-xs text-white/40 text-right">{editedBio.length}/500</div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Interests</h3>
              
              {/* Current Interests */}
              <div className="flex flex-wrap gap-2">
                {editedInterests.map((interest, i) => {
                  const hue = (i * 60) % 360;
                  return (
                    <span 
                      key={i} 
                      className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
                      style={{
                        background: `hsla(${hue}, 70%, 50%, 0.15)`,
                        color: `hsl(${hue}, 80%, 75%)`,
                        border: `1px solid hsla(${hue}, 70%, 50%, 0.3)`
                      }}
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="hover:scale-110 transition-transform text-lg leading-none opacity-70 hover:opacity-100"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
              
              {/* Add Interest Input */}
              <div className="relative">
                <input
                  type="text"
                  value={newInterest}
                  onChange={handleInterestInput}
                  onKeyDown={handleInterestKeyDown}
                  onFocus={() => newInterest && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="+ Add an interest..."
                  className="w-full bg-white/5 border border-white/20 rounded-full px-6 py-3 text-white text-sm focus:outline-none focus:border-purple-400 placeholder-white/40 transition-all"
                />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/20 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => addInterest(suggestion)}
                        className="w-full text-left px-5 py-3 text-white/80 hover:bg-white/10 transition-colors text-sm border-b border-white/5 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                    
                    {newInterest.trim() && !filteredSuggestions.includes(newInterest.trim()) && (
                      <button
                        onClick={() => addInterest()}
                        className="w-full text-left px-5 py-3 text-purple-400 hover:bg-white/10 transition-colors text-sm italic flex items-center gap-2"
                      >
                        <Sparkles className="w-3 h-3" />
                        Create "{newInterest.trim()}"
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* My Vibe */}
            <div className="space-y-3">
              <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">My Vibe</h3>
              <button
                onClick={() => {
                  console.log('[EDIT PROFILE] Music connect clicked');
                  alert('Music selection requires backend connection. Available after full authentication.');
                }}
                className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-400/30 rounded-xl p-4 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">Vibe Song</div>
                    <div className="text-white/60 text-sm">
                      {user.vibe_song ? 
                        `${user.vibe_song.title || user.vibe_song.track_name} - ${user.vibe_song.artist}` : 
                        'Add your anthem'
                      }
                    </div>
                  </div>
                </div>
                <div className="text-purple-400 group-hover:translate-x-1 transition-transform">→</div>
              </button>
            </div>

            {/* Lifestyle */}
            <div className="space-y-3">
              <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Lifestyle</h3>
              
              <div className="space-y-3">
                {/* Workout */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Workout</label>
                  <select
                    value={workout}
                    onChange={(e) => setWorkout(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="everyday">Everyday</option>
                    <option value="often">Often</option>
                    <option value="sometimes">Sometimes</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                {/* Drinking */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Drinking</label>
                  <select
                    value={drinking}
                    onChange={(e) => setDrinking(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="not_for_me">Not for me</option>
                    <option value="sober">Sober</option>
                    <option value="sober_curious">Sober curious</option>
                    <option value="on_special_occasions">On special occasions</option>
                    <option value="socially_on_weekends">Socially on weekends</option>
                    <option value="most_nights">Most nights</option>
                  </select>
                </div>

                {/* Smoking */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Smoking</label>
                  <select
                    value={smoking}
                    onChange={(e) => setSmoking(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="social_smoker">Social smoker</option>
                    <option value="smoker_when_drinking">Smoker when drinking</option>
                    <option value="non_smoker">Non-smoker</option>
                    <option value="smoker">Smoker</option>
                    <option value="trying_to_quit">Trying to quit</option>
                  </select>
                </div>

                {/* Marijuana */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Marijuana</label>
                  <select
                    value={marijuana}
                    onChange={(e) => setMarijuana(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="never">Never</option>
                    <option value="sometimes">Sometimes</option>
                    <option value="often">Often</option>
                  </select>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Dietary Preference</label>
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="vegan">Vegan</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="pescatarian">Pescatarian</option>
                    <option value="kosher">Kosher</option>
                    <option value="halal">Halal</option>
                    <option value="carnivore">Carnivore</option>
                    <option value="omnivore">Omnivore</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Social Media */}
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Social Media</label>
                  <select
                    value={socialMedia}
                    onChange={(e) => setSocialMedia(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="social_media_influencer">Social media influencer</option>
                    <option value="active_user">Active user</option>
                    <option value="off_the_grid">Off the grid</option>
                    <option value="passive_scroller">Passive scroller</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Display */}
            <div className="space-y-3">
              <h3 className="text-white/80 text-sm uppercase tracking-wide font-medium">Profile Display</h3>
              
              {/* Show my age - Premium */}
              <div className="relative p-4 rounded-lg border border-white/10 bg-white/5 opacity-60">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium flex items-center gap-2">
                      Show my age
                      <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-bold">
                        PREMIUM
                      </span>
                    </div>
                    <div className="text-white/50 text-xs">Control age visibility with Premium</div>
                  </div>
                </div>
                <div className="absolute inset-0 cursor-not-allowed"></div>
              </div>
              
              {/* Show my distance - Premium */}
              <div className="relative p-4 rounded-lg border border-white/10 bg-white/5 opacity-60">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium flex items-center gap-2">
                      Show my distance
                      <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-bold">
                        PREMIUM
                      </span>
                    </div>
                    <div className="text-white/50 text-xs">Control distance visibility with Premium</div>
                  </div>
                </div>
                <div className="absolute inset-0 cursor-not-allowed"></div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-white/10 p-6 flex gap-3 rounded-b-2xl">
            <button
              onClick={onClose}
              className="flex-1 bg-white/5 text-white/80 hover:bg-white/10 border border-white/10 rounded-xl py-3 font-medium transition-all"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl py-3 font-medium hover:scale-105 transition-all shadow-lg"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      {showPhotoEditor && (
        <PhotoEditorModal
          currentPhotos={user.photos || []}
          onSave={async (photos) => {
            // This will be handled by parent's onSave
            setShowPhotoEditor(false);
          }}
          onClose={() => setShowPhotoEditor(false)}
        />
      )}
      
      {showMusicConnect && (
        <MusicConnect
          user={user}
          onClose={() => setShowMusicConnect(false)}
          onAnthemSet={() => setShowMusicConnect(false)}
        />
      )}
    </>
  );
}
