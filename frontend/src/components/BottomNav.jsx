import React from 'react';
import { TrendingUp, Heart, Send, User } from 'lucide-react';

// Custom Merge Logo Icon Component
const MergeLogoIcon = ({ focused, color, size = 20 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12Z"
        fill={focused ? color : "none"}
        stroke={color}
        strokeWidth={1.5}
      />
      <path
        d="M12 16V19M12 8V5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};

// Shared Bottom Navigation - Premium 5-Tab Layout
export default function BottomNav({ currentTab, navigate }) {
  const items = [
    { id: 'home', icon: MergeLogoIcon, label: 'Explore', path: '/home', isCustom: true },
    { id: 'discover', icon: TrendingUp, label: 'Trending', path: '/discover' },
    { id: 'likes', icon: Heart, label: 'Likes', path: '/likes' },
    { id: 'messages', icon: Send, label: 'Messages', path: '/messages' },
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
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.6)'
      }}
    >
      <div className="flex items-center justify-around mx-auto" style={{ padding: '4px 12px', height: '52px', maxWidth: '500px' }}>
        {items.map(({ id, icon: Icon, label, path }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ease-out"
              style={{
                minWidth: '52px',
                padding: '4px 6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <Icon 
                className="transition-all duration-200" 
                style={{ 
                  width: '20px',
                  height: '20px',
                  color: isActive ? '#00D9FF' : '#FFFFFF',
                  strokeWidth: isActive ? 2.5 : 2,
                  fill: isActive ? '#00D9FF' : 'none',
                  transition: 'all 0.2s ease',
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.5))' : 'none'
                }} 
              />
              <span 
                className="text-[9px] font-medium transition-all duration-200"
                style={{
                  color: isActive ? '#00D9FF' : '#FFFFFF',
                  opacity: isActive ? 1 : 0.6,
                  letterSpacing: '0.2px'
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
