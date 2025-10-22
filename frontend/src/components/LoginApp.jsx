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
    const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    fetch(`${API}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">🔄 Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <SimpleLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <TestDashboard user={user} onLogout={handleLogout} />;
}