import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, MapPin, Heart, Bell, Shield, LogOut, Sparkles, Star, Users, Home, MessageCircle } from 'lucide-react';
import { requestNotificationPermission, isNotificationSupported, getNotificationPermission } from '../utils/firebase';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

// Horoscope Notification Settings Component
function HoroscopeNotificationSettings({ user }) {
  const [horoscopePrefs, setHoroscopePrefs] = useState({
    opt_in: false,
    time: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    loadHoroscopePreferences();
  }, []);

  const loadHoroscopePreferences = async () => {
    try {
      const response = await axios.get(`${API}/horoscope/preferences`);
      setHoroscopePrefs(response.data);
    } catch (error) {
      console.error('Error loading horoscope preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!horoscopePrefs.opt_in) {
      // User wants to opt in - request notification permission
      if (!isNotificationSupported()) {
        alert('Push notifications are not supported in this browser');
        return;
      }

      const currentPermission = getNotificationPermission();
      if (currentPermission === 'denied') {
        alert('Notifications are blocked. Please enable them in your browser settings.');
        return;
      }

      setSaving(true);
      try {
        // Request permission and get FCM token
        const fcmToken = await requestNotificationPermission();
        
        if (fcmToken) {
          // Save preferences with token
          await axios.post(`${API}/horoscope/preferences`, {
            opt_in: true,
            time: horoscopePrefs.time,
            timezone: horoscopePrefs.timezone,
            fcm_token: fcmToken
          });
          
          setHoroscopePrefs(prev => ({ ...prev, opt_in: true }));
          alert('✨ Daily horoscope notifications enabled!');
        } else {
          alert('Failed to get notification permission. Please try again.');
        }
      } catch (error) {
        console.error('Error enabling notifications:', error);
        alert('Failed to enable notifications');
      } finally {
        setSaving(false);
      }
    } else {
      // User wants to opt out
      setSaving(true);
      try {
        await axios.post(`${API}/horoscope/preferences`, {
          opt_in: false
        });
        setHoroscopePrefs(prev => ({ ...prev, opt_in: false }));
      } catch (error) {
        console.error('Error disabling notifications:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleTimeChange = async (newTime) => {
    setHoroscopePrefs(prev => ({ ...prev, time: newTime }));
    
    if (horoscopePrefs.opt_in) {
      try {
        await axios.post(`${API}/horoscope/preferences`, {
          time: newTime
        });
      } catch (error) {
        console.error('Error updating time:', error);
      }
    }
  };

  const handleTestSend = async () => {
    setTestSending(true);
    try {
      await axios.post(`${API}/horoscope/test-send`);
      alert('✨ Test notification sent! Check your notifications.');
    } catch (error) {
      console.error('Error sending test:', error);
      alert(error.response?.data?.detail || 'Failed to send test notification');
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-lg font-light text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Daily Horoscope
        </h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-white font-light">Daily Energy Reading</p>
            <p className="text-white/40 text-sm">Get personalized horoscope notifications</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`w-12 h-6 rounded-full relative transition-all ${
              horoscopePrefs.opt_in ? 'bg-purple-500' : 'bg-white/20'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
              horoscopePrefs.opt_in ? 'right-1' : 'left-1'
            }`}></div>
          </button>
        </div>

        {horoscopePrefs.opt_in && (
          <>
            <div className="border-t border-white/10 pt-4">
              <label className="text-white/80 text-sm mb-2 block">Delivery Time</label>
              <input
                type="time"
                value={horoscopePrefs.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors"
                style={{ colorScheme: 'dark' }}
              />
              <p className="text-white/40 text-xs mt-2">
                🔮 Receive your cosmic reading at {horoscopePrefs.time} daily
              </p>
            </div>

            <button
              onClick={handleTestSend}
              disabled={testSending}
              className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 py-3 rounded-xl hover:bg-purple-500/30 transition-all disabled:opacity-50 text-sm"
            >
              {testSending ? 'Sending...' : '✨ Send Test Notification'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

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
                  <option value={3} className="bg-black">Within 3 miles</option>
                  <option value={6} className="bg-black">Within 6 miles</option>
                  <option value={16} className="bg-black">Within 16 miles</option>
                  <option value={31} className="bg-black">Within 31 miles</option>
                  <option value={62} className="bg-black">Within 62 miles</option>
                  <option value={155} className="bg-black">Within 155 miles</option>
                  <option value={311} className="bg-black">Within 311 miles</option>
                  <option value={621} className="bg-black">Within 621 miles</option>
                  <option value={3107} className="bg-black">Anywhere</option>
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
          <HoroscopeNotificationSettings user={user} />

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
