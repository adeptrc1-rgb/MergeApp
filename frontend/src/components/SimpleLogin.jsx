import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || ''; const API = `${API_BASE}/api`;

export default function SimpleLogin({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Test the backend connection first
      console.log('Testing backend connection...');
      
      const response = await fetch(`${API}/auth/test-login`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Use returned user immediately for a faster UX
        if (data.user) {
          setMessage('✅ Login successful! Redirecting...');
          setLoading(false);
          setTimeout(() => onLoginSuccess(data.user), 300);
          return;
        }
        // Fallback: verify with /auth/me if no user was returned
        setMessage('✅ Login successful! Verifying session...');
        try {
          const authResponse = await fetch(`${API}/auth/me`, { method: 'GET', credentials: 'include' });
          if (authResponse.ok) {
            const userData = await authResponse.json();
            setMessage('✅ Authentication verified! Redirecting...');
            setTimeout(() => onLoginSuccess(userData), 300);
          } else {
            setMessage('❌ Authentication failed after login');
          }
        } catch (authError) {
          console.error('Auth check error:', authError);
          setMessage('❌ Error checking authentication');
        }
        setLoading(false);
      } else {
        setMessage('❌ Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(`❌ Connection error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          🌟 A Sign Login Test
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:scale-105 shadow-lg'
            } text-white`}
          >
            {loading ? '🔄 Logging in...' : '🚀 Test Login'}
          </button>
          
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                : 'bg-red-500/20 text-red-200 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}
          
          <div className="text-white/60 text-xs text-center">
            Backend: {API}
          </div>
        </div>
      </div>
    </div>
  );
}