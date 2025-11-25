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

// Shared Bottom Navigation - Minimal & Modern
export default function BottomNav({ currentTab, navigate }) {
  const items = [
    { id: 'home', icon: MHomeIcon, path: '/home' },
    { id: 'discover', icon: Network, path: '/discover' },
    { id: 'messages', icon: MessageSquare, path: '/messages' },
    { id: 'profile', icon: User, path: '/profile' },
  ];
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 select-none" 
      style={{ 
        WebkitTapHighlightColor: 'transparent', 
        WebkitTouchCallout: 'none', 
        userSelect: 'none',
        backgroundColor: 'rgba(23, 23, 23, 0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -1px 8px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto" style={{ padding: '6px 20px', height: '48px' }}>
        {items.map(({ id, icon: Icon, path }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex items-center justify-center transition-all duration-200 ease-out relative"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'var(--surface-hover)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-default)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '1px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    boxShadow: '0 0 6px var(--accent-primary)'
                  }}
                />
              )}
              
              <Icon 
                className="transition-all duration-200" 
                style={{ 
                  width: '19px',
                  height: '19px',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  strokeWidth: isActive ? 2.5 : 1.8,
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
