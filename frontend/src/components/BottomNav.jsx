import React from 'react';
import { Zap, Network, MessageSquare, User } from 'lucide-react';

// Shared Bottom Navigation - Merge Theme (Optimized & Compact)
export default function BottomNav({ currentTab, navigate }) {
  const items = [
    { id: 'home', icon: Zap, label: 'Discover', path: '/home' },
    { id: 'discover', icon: Network, label: 'Matrix', path: '/discover' },
    { id: 'messages', icon: MessageSquare, label: 'Chats', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black z-40 select-none" 
      style={{ 
        WebkitTapHighlightColor: 'transparent', 
        WebkitTouchCallout: 'none', 
        userSelect: 'none',
        borderTop: '1px solid #262626',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ id, icon: Icon, label, path }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center transition-all relative"
              style={{
                minWidth: '52px',
                padding: '2px 4px'
              }}
            >
              {/* Icon with gradient background when active */}
              <div 
                className="relative rounded-lg transition-all"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                  padding: '6px'
                } : {
                  background: 'transparent',
                  padding: '6px'
                }}
              >
                <Icon 
                  className="transition-all" 
                  style={{ 
                    width: '20px',
                    height: '20px',
                    color: isActive ? '#FFFFFF' : '#737373',
                    strokeWidth: isActive ? 2.5 : 2
                  }} 
                />
              </div>
              
              {/* Label */}
              <span 
                className="font-medium transition-all mt-0.5"
                style={{ 
                  color: isActive ? '#FAFAFA' : '#737373',
                  fontSize: '10px',
                  letterSpacing: '0.01em'
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
