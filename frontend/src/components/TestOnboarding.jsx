import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TestOnboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
        <h1 className="text-4xl font-light text-white mb-6 text-center">
          Test Onboarding Flow ✨
        </h1>
        
        <p className="text-white/80 mb-8 text-center">
          Click below to start the new 13-question gamified onboarding experience
        </p>

        <button
          onClick={() => navigate('/onboarding')}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-medium transition-all shadow-lg"
        >
          Start Onboarding
        </button>

        <div className="mt-8 space-y-3">
          <h3 className="text-white font-semibold text-sm">What you'll experience:</h3>
          <ul className="text-white/70 text-sm space-y-2">
            <li>✨ Step 1: Cosmic Identity (4 questions)</li>
            <li>⚡ Step 2: MBTI Personality (5 bubble questions)</li>
            <li>🎨 Step 3: Interests & Lifestyle (9 factors)</li>
            <li>📸 Step 4: Photos (3 uploads)</li>
          </ul>
          <p className="text-white/60 text-xs mt-4">
            Progress tracker shows "X of 13 cosmic sparks collected"
          </p>
        </div>
      </div>
    </div>
  );
}
