import React from 'react';
import { Network, MessageSquare, User } from 'lucide-react';

// Custom Home Icon Component (Letter M)
const MHomeIcon = ({ className, style }) => (
  <div 
    className={className}
    style={{
      ...style,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}
  >
    M
  </div>
);

// Shared Bottom Navigation - Merge Theme (Ultra Compact)
export default function BottomNav({ currentTab, navigate }) {
  const items = [
    { id: 'home', icon: FlameHomeIcon, label: 'Discover', path: '/home' },
    { id: 'discover', icon: Network, label: 'Matrix', path: '/discover' },
    { id: 'messages', icon: MessageSquare, label: 'Chats', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 select-none" 
      style={{ 
        WebkitTapHighlightColor: 'transparent', 
        WebkitTouchCallout: 'none', 
        userSelect: 'none',
        backgroundColor: '#000000',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-around" style={{ padding: '8px 4px' }}>
        {items.map(({ id, icon: Icon, label, path }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center transition-all"
              style={{
                minWidth: '48px',
                padding: '0'
              }}
            >
              {/* Icon with gradient background when active */}
              <div 
                className="relative rounded-lg transition-all"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
                  padding: '4px'
                } : {
                  background: 'transparent',
                  padding: '4px'
                }}
              >
                <Icon 
                  className="transition-all" 
                  style={{ 
                    width: '18px',
                    height: '18px',
                    color: isActive ? '#FFFFFF' : '#666666',
                    strokeWidth: isActive ? 2.5 : 2
                  }} 
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
