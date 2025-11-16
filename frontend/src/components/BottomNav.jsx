import React from 'react';
import { Zap, Network, MessageSquare, User } from 'lucide-react';

// Shared Bottom Navigation - Merge Theme
export default function BottomNav({ currentTab, navigate }) {
  const items = [
    { id: 'home', icon: Zap, label: 'Discover', path: '/home' },
    { id: 'discover', icon: Network, label: 'Matrix', path: '/discover' },
    { id: 'messages', icon: MessageSquare, label: 'Chats', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black pb-safe z-40 select-none" 
      style={{ 
        WebkitTapHighlightColor: 'transparent', 
        WebkitTouchCallout: 'none', 
        userSelect: 'none',
        borderTop: '1px solid #262626'
      }}
    >
      <div className="flex items-center justify-around px-4 py-3">
        {items.map(({ id, icon: Icon, label, path }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 transition-all relative"
              style={{
                minWidth: '60px',
                padding: '4px 8px'
              }}
            >
              {/* Icon with gradient background when active */}
              <div 
                className="relative p-2 rounded-xl transition-all"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                } : {
                  background: 'transparent'
                }}
              >
                <Icon 
                  className="w-5 h-5 transition-all" 
                  style={{ 
                    color: isActive ? '#FFFFFF' : '#737373',
                    strokeWidth: isActive ? 2.5 : 2
                  }} 
                />
              </div>
              
              {/* Label */}
              <span 
                className="text-xs font-medium transition-all"
                style={{ 
                  color: isActive ? '#FAFAFA' : '#737373',
                  fontSize: '11px',
                  letterSpacing: '0.02em'
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
