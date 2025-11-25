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

// Shared Bottom Navigation - Sophisticated Merge Theme
export default function BottomNav({ currentTab, navigate }) {
  const items = [
    { id: 'home', icon: MHomeIcon, label: 'Home', path: '/home' },
    { id: 'discover', icon: Network, label: 'Discover', path: '/discover' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 select-none" 
      style={{ 
        WebkitTapHighlightColor: 'transparent', 
        WebkitTouchCallout: 'none', 
        userSelect: 'none',
        backgroundColor: 'rgba(23, 23, 23, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-default)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="flex items-center justify-around max-w-4xl mx-auto" style={{ padding: '12px 16px' }}>
        {items.map(({ id, icon: Icon, label, path }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 transition-all duration-300 ease-out relative"
              style={{
                minWidth: '64px',
                padding: '8px 12px',
                borderRadius: '16px',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-default)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Active indicator line at top */}
              {isActive && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '32px',
                    height: '3px',
                    borderRadius: '0 0 3px 3px',
                    backgroundColor: 'var(--accent-primary)',
                    boxShadow: '0 2px 8px var(--accent-glow)'
                  }}
                />
              )}
              
              {/* Icon container with glow effect for active */}
              <div 
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon 
                  className="transition-all duration-300" 
                  style={{ 
                    width: '22px',
                    height: '22px',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    strokeWidth: isActive ? 2.5 : 2,
                    transition: 'all 0.3s ease',
                    filter: isActive ? 'drop-shadow(0 0 6px var(--accent-glow))' : 'none'
                  }} 
                />
              </div>
              
              {/* Label */}
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.3px'
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
