import React, { useState } from 'react';
import CosmicWheel from './CosmicWheel';
import Home from './Home';
import Profile from './Profile';

export default function TestDashboard({ user, onLogout }) {
  const [currentTab, setCurrentTab] = useState('home');
  const [showCosmicWheel, setShowCosmicWheel] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home user={user} logout={onLogout} />;
      case 'profile':
        return <Profile user={user} logout={onLogout} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                🎯 {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
              </h2>
              <p className="text-white/60">Feature coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🌟</div>
            <div>
              <h1 className="text-white font-bold">A Sign</h1>
              <p className="text-white/60 text-sm">Welcome, {user?.name || 'Test User'}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowCosmicWheel(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:scale-105 transition-all"
            >
              🎰 Cosmic Wheel
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white/5 backdrop-blur-md border-r border-white/20 p-4">
          <nav className="space-y-2">
            {[
              { id: 'home', label: '🏠 Home (Swiping)', icon: '🏠' },
              { id: 'discover', label: '🔍 Discover', icon: '🔍' },
              { id: 'messages', label: '💬 Messages', icon: '💬' },
              { id: 'connections', label: '🤝 Connections', icon: '🤝' },
              { id: 'profile', label: '👤 Profile', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  currentTab === tab.id
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label.split(' ').slice(1).join(' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
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