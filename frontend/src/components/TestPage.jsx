import React, { useState } from 'react';
import CosmicWheel from './CosmicWheel';
import Home from './Home';

// Simple test page for testing features without complex auth
export default function TestPage() {
  const [showCosmicWheel, setShowCosmicWheel] = useState(false);
  const [testUser] = useState({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    zodiac_sign: 'Gemini',
    age: 30
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 Cosmic Wheel Test Page</h1>
        
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={() => setShowCosmicWheel(true)}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            🎰 Open Cosmic Wheel
          </button>
          
          <button
            onClick={() => window.location.href = '/home'}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            🏠 Go to Home (Swiping)
          </button>
          
          <button
            onClick={() => window.location.href = '/profile'}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            👤 Go to Profile
          </button>
        </div>
        
        <div className="mt-8 text-center text-white/60">
          <p>Direct testing page - no authentication required</p>
          <p>Use this to test Cosmic Wheel and other features</p>
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