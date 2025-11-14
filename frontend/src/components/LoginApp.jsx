import React, { useState, useEffect } from 'react';
import SimpleLogin from './SimpleLogin';
import TestDashboard from './TestDashboard';

export default function LoginApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in on page load
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
      const API = `${API_BASE}/api`;
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.log('Not logged in');
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    // Optionally call backend logout
    const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
    const API = `${API_BASE}/api`;
    fetch(`${API}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="text-center">
          <div 
            className="w-12 h-12 mx-auto mb-4 rounded-full animate-spin"
            style={{ 
              border: '3px solid #404040',
              borderTopColor: '#3B82F6'
            }}
          />
          <div style={{ color: '#FAFAFA', fontSize: '16px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SimpleLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <TestDashboard user={user} onLogout={handleLogout} />;
}