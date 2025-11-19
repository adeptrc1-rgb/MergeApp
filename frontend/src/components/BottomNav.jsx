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
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}
  >
    M
  </div>
);

// Shared Bottom Navigation - Merge Theme (Ultra Compact)
export default function BottomNav({ currentTab, navigate }) {
  const items = [
    { id: 'home', icon: MHomeIcon, label: 'Discover', path: '/home' },
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
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-around" style={{ padding: '16px 8px' }}>
        {items.map(({ id, icon: Icon, label, path }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center transition-all"
              style={{
                minWidth: '64px',
                padding: '8px',
                borderRadius: '12px',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
              }}
            >
              <Icon 
                className="transition-all" 
                style={{ 
                  width: '22px',
                  height: '22px',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  strokeWidth: isActive ? 2 : 1.5
                }} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
