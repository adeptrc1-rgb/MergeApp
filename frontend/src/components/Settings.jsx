import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, MapPin, Heart, Bell, Shield, LogOut, Sparkles, Star, Users, Home, MessageCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function Settings({ user, logout }) {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    age_range_min: user?.age_range_min || 18,
    age_range_max: user?.age_range_max || 35,
    max_distance_miles: user?.max_distance_miles || 31
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/users/update-preferences`, preferences);
      navigate('/profile');
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
    setSaving(false);
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-black flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/profile')}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-light text-white">Settings</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
          {/* Account Section */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-light text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Account
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-light">{user?.first_name} {user?.last_name}</p>
                  <p className="text-white/40 text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <div>
                  <p className="text-white font-light">Zodiac Sign</p>
                  <p className="text-white/60 text-sm">{user?.zodiac_sign}</p>
                </div>
                <Star className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Dating Preferences */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-light text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-400" />
                Dating Preferences
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Age Range */}
              <div>
                <label className="text-white font-light block mb-3">Age Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm block mb-2">Min Age</label>
                    <select
                      value={preferences.age_range_min}
                      onChange={(e) => setPreferences({...preferences, age_range_min: parseInt(e.target.value)})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors"
                    >
                      {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                        <option key={age} value={age} className="bg-black">{age}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-2">Max Age</label>
                    <select
                      value={preferences.age_range_max}
                      onChange={(e) => setPreferences({...preferences, age_range_max: parseInt(e.target.value)})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors"
                    >
                      {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                        <option key={age} value={age} className="bg-black">{age}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="text-white font-light block mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  Maximum Distance
                </label>
                <select
                  value={preferences.max_distance_miles}
                  onChange={(e) => setPreferences({...preferences, max_distance_miles: parseInt(e.target.value)})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors"
                >
                  <option value={5} className="bg-black">Within 5 km</option>
                  <option value={10} className="bg-black">Within 10 km</option>
                  <option value={25} className="bg-black">Within 25 km</option>
                  <option value={50} className="bg-black">Within 50 km</option>
                  <option value={100} className="bg-black">Within 100 km</option>
                  <option value={250} className="bg-black">Within 250 km</option>
                  <option value={500} className="bg-black">Within 500 km</option>
                  <option value={1000} className="bg-black">Within 1000 km</option>
                  <option value={5000} className="bg-black">Anywhere</option>
                </select>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl font-medium"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-light text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                Notifications
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white font-light">New Matches</p>
                  <p className="text-white/40 text-sm">Get notified about new connections</p>
                </div>
                <div className="w-12 h-6 bg-purple-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <div>
                  <p className="text-white font-light">Messages</p>
                  <p className="text-white/40 text-sm">Get notified about new messages</p>
                </div>
                <div className="w-12 h-6 bg-purple-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Safety */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-light text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Privacy & Safety
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full text-left py-3 text-white hover:text-purple-400 transition-colors">
                Block List
              </button>
              <button className="w-full text-left py-3 text-white hover:text-purple-400 transition-colors border-t border-white/10">
                Privacy Policy
              </button>
              <button className="w-full text-left py-3 text-white hover:text-purple-400 transition-colors border-t border-white/10">
                Terms of Service
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full bg-red-500/20 text-red-300 py-4 rounded-xl hover:bg-red-500/30 transition-all border border-red-400/30 flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>

          {/* App Info */}
          <div className="text-center py-4">
            <p className="text-white/40 text-sm">A Sign v1.0</p>
            <p className="text-white/40 text-xs mt-1">Your cosmic dating journey</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="profile" navigate={navigate} />
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ currentTab, navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-around">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate('/discover')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'discover' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs">Discover</span>
        </button>
        <button
          onClick={() => navigate('/messages')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'messages' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">Messages</span>
        </button>
        <button
          onClick={() => navigate('/connections')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'connections' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-xs">Connect</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'profile' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
