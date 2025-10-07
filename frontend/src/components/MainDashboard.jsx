import React, { useState, useContext } from 'react';
import Home from './Home';
import Discover from './Discover';
import Messages from './Messages';
import Connections from './Connections';
import Profile from './Profile';
import CosmicWheel from './CosmicWheel';

export default function MainDashboard({ user, logout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [showCosmicWheel, setShowCosmicWheel] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠', component: Home },
    { id: 'discover', label: 'Discover', icon: '🔍', component: Discover },
    { id: 'messages', label: 'Messages', icon: '💬', component: Messages },
    { id: 'connections', label: 'Connect', icon: '🤝', component: Connections },
    { id: 'profile', label: 'Profile', icon: '👤', component: Profile }
  ];

  const renderContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    const Component = activeTabData?.component;
    
    if (!Component) return null;
    
    return <Component user={user} logout={logout} />;
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10">
        <div className="flex justify-around items-center py-2 px-4 safe-bottom">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-tab={tab.id}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'text-purple-400 bg-purple-500/20'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Cosmic Wheel Button */}
      <button
        onClick={() => setShowCosmicWheel(true)}
        className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-all"
      >
        <span className="text-xl">🎰</span>
      </button>

      {/* Cosmic Wheel Modal */}
      {showCosmicWheel && (
        <CosmicWheel
          isOpen={showCosmicWheel}
          onClose={() => setShowCosmicWheel(false)}
          onRewardClaimed={(reward) => {
            console.log('Reward claimed:', reward);
            // You can add notification logic here
          }}
        />
      )}
    </div>
  );
}