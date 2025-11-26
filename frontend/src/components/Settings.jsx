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
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 className="text-lg font-light flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Sparkles className="w-5 h-5" style={{ color: '#00D9FF' }} />
          Daily Horoscope
        </h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-light" style={{ color: 'var(--text-primary)' }}>Daily Energy Reading</p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Get personalized horoscope notifications</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            className="w-12 h-6 rounded-full relative transition-all"
            style={{
              backgroundColor: horoscopePrefs.opt_in ? '#00D9FF' : 'var(--surface-hover)',
              opacity: saving ? 0.5 : 1,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            <div 
              className="absolute top-1 w-4 h-4 rounded-full transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                right: horoscopePrefs.opt_in ? '4px' : 'auto',
                left: horoscopePrefs.opt_in ? 'auto' : '4px'
              }}
            ></div>
          </button>
        </div>

        {horoscopePrefs.opt_in && (
          <>
            <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Delivery Time</label>
              <input
                type="time"
                value={horoscopePrefs.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                style={{ 
                  backgroundColor: 'var(--surface-hover)', 
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  colorScheme: 'dark' 
                }}
                onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                🔮 Receive your cosmic reading at {horoscopePrefs.time} daily
              </p>
            </div>

            <button
              onClick={handleTestSend}
              disabled={testSending}
              className="w-full py-3 rounded-xl transition-all disabled:opacity-50 text-sm"
              style={{
                backgroundColor: 'rgba(0, 217, 255, 0.15)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                color: '#00D9FF'
              }}
              onMouseEnter={(e) => !testSending && (e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.25)')}
              onMouseLeave={(e) => !testSending && (e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.15)')}
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
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/profile')}
            className="transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
          {/* Account Section */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-lg font-light flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <User className="w-5 h-5" style={{ color: '#00D9FF' }} />
                Account
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-light" style={{ color: 'var(--text-primary)' }}>{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <p className="font-light" style={{ color: 'var(--text-primary)' }}>Zodiac Sign</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.zodiac_sign}</p>
                </div>
                <Star className="w-5 h-5" style={{ color: '#00D9FF' }} />
              </div>
            </div>
          </div>

          {/* Dating Preferences */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-lg font-light flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Heart className="w-5 h-5" style={{ color: '#00D9FF' }} />
                Dating Preferences
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Age Range */}
              <div>
                <label className="font-light block mb-3" style={{ color: 'var(--text-primary)' }}>Age Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>Min Age</label>
                    <select
                      value={preferences.age_range_min}
                      onChange={(e) => setPreferences({...preferences, age_range_min: parseInt(e.target.value)})}
                      className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                    >
                      {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                        <option key={age} value={age} style={{ backgroundColor: 'var(--bg-primary)' }}>{age}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>Max Age</label>
                    <select
                      value={preferences.age_range_max}
                      onChange={(e) => setPreferences({...preferences, age_range_max: parseInt(e.target.value)})}
                      className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                    >
                      {Array.from({length: 32}, (_, i) => i + 18).map(age => (
                        <option key={age} value={age} style={{ backgroundColor: 'var(--bg-primary)' }}>{age}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="font-light block mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#00D9FF' }} />
                  Maximum Distance
                </label>
                <select
                  value={preferences.max_distance_miles}
                  onChange={(e) => setPreferences({...preferences, max_distance_miles: parseInt(e.target.value)})}
                  className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-hover)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                >
                  <option value={3} style={{ backgroundColor: 'var(--bg-primary)' }}>Within 3 miles</option>
                  <option value={6} style={{ backgroundColor: 'var(--bg-primary)' }}>Within 6 miles</option>
                  <option value={16} style={{ backgroundColor: 'var(--bg-primary)' }}>Within 16 miles</option>
                  <option value={31} style={{ backgroundColor: 'var(--bg-primary)' }}>Within 31 miles</option>
                  <option value={62} style={{ backgroundColor: 'var(--bg-primary)' }}>Within 62 miles</option>
                  <option value={155} style={{ backgroundColor: 'var(--bg-primary)' }}>Within 155 miles</option>
                  <option value={311} style={{ backgroundColor: 'var(--bg-primary)' }}>Within 311 miles</option>
                  <option value={621} style={{ backgroundColor: 'var(--bg-primary)' }}>Within 621 miles</option>
                  <option value={3107} style={{ backgroundColor: 'var(--bg-primary)' }}>Anywhere</option>
                </select>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                style={{
                  backgroundColor: '#00D9FF',
                  color: '#000000'
                }}
                onMouseEnter={(e) => !saving && (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => !saving && (e.currentTarget.style.transform = 'scale(1)')}
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <HoroscopeNotificationSettings user={user} />

          {/* Privacy & Safety */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-lg font-light flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Shield className="w-5 h-5" style={{ color: '#00D9FF' }} />
                Privacy & Safety
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button 
                className="w-full text-left py-3 transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#00D9FF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              >
                Block List
              </button>
              <button 
                className="w-full text-left py-3 transition-colors"
                style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#00D9FF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              >
                Privacy Policy
              </button>
              <button 
                className="w-full text-left py-3 transition-colors"
                style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#00D9FF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              >
                Terms of Service
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full py-4 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>

          {/* App Info */}
          <div className="text-center py-4">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Merge v1.0</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Your connection journey</p>
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
