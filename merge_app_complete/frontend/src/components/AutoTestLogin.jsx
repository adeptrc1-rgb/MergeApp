import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = React.createContext();

export default function AutoTestLogin() {
  const navigate = useNavigate();
  // Pull login and checkAuth from context if available
  let ctx;
  try {
    ctx = useContext(AuthContext);
  } catch (e) {
    ctx = null;
  }
  const login = ctx?.login;
  const [status, setStatus] = useState('Starting test login...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const doLogin = async () => {
      try {
        setStatus('Contacting server...');
        // Fallback: direct fetch if context not available
        if (!login) {
          const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
          const API = `${API_BASE}/api`;
          const res = await fetch(`${API}/auth/test-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: 'testuser@asign.com' })
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } else {
          const ok = await login('testuser@asign.com');
          if (!ok) throw new Error('Login returned false');
        }
        setStatus('Login successful. Redirecting to Wheel...');
        setTimeout(() => {
          navigate('/profile?openWheel=1', { replace: true });
        }, 500);
      } catch (err) {
        console.error('Auto test login failed', err);
        setError(err?.message || 'Unknown error');
        setStatus('Failed. Please go back and try Test Login button.');
      }
    };
    doLogin();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <h1 className="text-2xl mb-2">Magic Test Login</h1>
        <p className="text-white/70 mb-4">{status}</p>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4">
            Error: {error}
          </div>
        )}
        <button
          onClick={() => navigate('/', { replace: true })}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
