import React, { useState } from 'react';
import CosmicWheel from './CosmicWheel';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

// Simple test page for testing features; now auto logs in test user before opening wheel
export default function TestPage() {
  const [showCosmicWheel, setShowCosmicWheel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const openWheelWithLogin = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/test-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'testuser@asign.com' })
      });
      if (!res.ok) throw new Error(`Login failed (${res.status})`);
      // Wait a tick for cookie to settle
      setTimeout(() => setShowCosmicWheel(true), 400);
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 Cosmic Wheel Test Page</h1>
        
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={openWheelWithLogin}
            disabled={busy}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-medium hover:scale-105 transition-all shadow-lg disabled:opacity-60"
          >
            {busy ? 'Preparing…' : '🎰 Open Cosmic Wheel (Auto Login)'}
          </button>
          
          <button
            onClick={() => { window.location.href = '/profile?openWheel=1'; }}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            👤 Go to Profile (open wheel)
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-3 text-sm">{error}</div>
          )}
        </div>
        
        <div className="mt-8 text-center text-white/60">
          <p>This page now auto-logs in the test user before opening the wheel.</p>
        </div>
      </div>
      
      {/* Cosmic Wheel Modal */}
      {showCosmicWheel && (
        <CosmicWheel
          isOpen={showCosmicWheel}
          onClose={() => setShowCosmicWheel(false)}
          onRewardClaimed={(reward) => {
            console.log('Reward claimed:', reward);
            alert(`🎉 You won: ${reward.name}!`);
          }}
        />
      )}
    </div>
  );
}