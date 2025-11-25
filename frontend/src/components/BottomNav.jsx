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
        backgroundColor: 'var(--surface-glass)',
        backdropFilter: 'var(--blur-md)',
        WebkitBackdropFilter: 'var(--blur-md)',
        borderTop: '1px solid var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <div className="flex items-center justify-around" style={{ padding: '8px 4px' }}>
        {items.map(({ id, icon: Icon, label, path }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center transition-all duration-200 ease-out"
              style={{
                minWidth: '56px',
                padding: '6px',
                borderRadius: '12px',
                backgroundColor: isActive ? 'var(--surface-hover)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-default)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon 
                className="transition-all duration-200" 
                style={{ 
                  width: '20px',
                  height: '20px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  strokeWidth: isActive ? 2.5 : 2,
                  transition: 'all 0.2s ease'
                }} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
