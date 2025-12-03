import React, { useState } from 'react';
import MergeLogo from './MergeLogo';
import FacebookLoginButton from './FacebookLoginButton';

const API_BASE = process.env.REACT_APP_BACKEND_URL || ''; 
const API = `${API_BASE}/api`;

export default function SimpleLogin({ onLoginSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTestLogin = async () => {
    console.log('[TEST LOGIN] Button clicked!');
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      console.log('[TEST LOGIN] Making request to:', `${API}/auth/test-login`);
      const response = await fetch(`${API}/auth/test-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: 'testuser@asign.com' })
      });
      console.log('[TEST LOGIN] Response received:', response.status);

      const data = await response.json();
      console.log('[TEST LOGIN] Response data:', data);

      if (data.success) {
        console.log('[TEST LOGIN] Success! Has user:', !!data.user);
        if (data.user) {
          setMessage('Authentication successful');
          console.log('[TEST LOGIN] Redirecting to /home in 500ms...');
          setTimeout(() => {
            console.log('[TEST LOGIN] Executing redirect now');
            window.location.replace('/home');
          }, 500);
          return;
        }
        setMessage('Verifying session...');
        try {
          const authResponse = await fetch(`${API}/auth/me`, { 
            method: 'GET', 
            credentials: 'include' 
          });
          if (authResponse.ok) {
            const userData = await authResponse.json();
            setMessage('Session verified');
            setTimeout(() => onLoginSuccess(userData), 300);
          } else {
            setError('Authentication failed');
          }
        } catch (authError) {
          console.error('Auth check error:', authError);
          setError('Error checking authentication');
        }
        setLoading(false);
      } else {
        console.log('[TEST LOGIN] data.success was false');
        setError('Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('[TEST LOGIN] Error:', error);
      setError('Connection error');
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }
    // For now, redirect to test login
    handleTestLogin();
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Animated Card Container */}
      <div 
        className="w-full max-w-md animate-fade-in"
        style={{
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div 
          className="rounded-xl p-8 sm:p-10"
          style={{
            backgroundColor: '#171717',
            border: '1px solid #404040',
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)'
          }}
        >
          {/* Logo with Breathing Animation */}
          <div 
            className="flex justify-center mb-3"
            style={{
              animation: 'breathe 4s ease-in-out infinite'
            }}
          >
            <MergeLogo size="lg" color="#FAFAFA" />
          </div>

          {/* Tagline */}
          <p 
            className="text-center text-sm mb-12"
            style={{ color: '#A3A3A3', letterSpacing: '0.5px' }}
          >
            Design Your Connection
          </p>

          {/* Form Section */}
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            {/* Phone Number Input */}
            <div>
              <label 
                htmlFor="phone"
                className="block text-sm font-medium mb-2"
                style={{ color: '#FAFAFA' }}
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError('');
                }}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 rounded-lg transition-all outline-none"
                style={{
                  backgroundColor: '#171717',
                  border: error ? '2px solid #EF4444' : '1px solid #404040',
                  color: '#FAFAFA',
                  boxShadow: error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.border = '1px solid #404040';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {error && (
                <p className="mt-2 text-xs" style={{ color: '#EF4444' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Primary CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: loading ? '#525252' : '#3B82F6',
                color: '#FFFFFF',
                cursor: loading ? 'not-allowed' : 'pointer',
                transform: loading ? 'none' : 'translateY(0)',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(0.98)';
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Connecting...
                </span>
              ) : (
                'Continue'
              )}
            </button>

            {/* Success Message */}
            {message && (
              <div 
                className="p-3 rounded-lg text-sm text-center animate-fade-in"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981'
                }}
              >
                {message}
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #404040' }}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span 
                className="px-4"
                style={{ backgroundColor: '#171717', color: '#A3A3A3' }}
              >
                or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Test Login Button */}
            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                color: '#FAFAFA',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2d2d2d';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#262626';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <span>🧪</span>
              <span>Test Login</span>
            </button>

            {/* Google Login (Placeholder) */}
            <button
              disabled
              className="w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <span>G</span>
              <span>Continue with Google</span>
            </button>

            {/* Apple Login (Placeholder) */}
            <button
              disabled
              className="w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                color: '#FAFAFA'
              }}
            >
              <span></span>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Footer */}
          <p 
            className="mt-8 text-xs text-center leading-relaxed"
            style={{ color: '#525252' }}
          >
            By continuing, you agree to our{' '}
            <span style={{ color: '#A3A3A3' }}>Terms & Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* Add Keyframe Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}