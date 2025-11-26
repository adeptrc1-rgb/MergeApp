import React from 'react';
import { TrendingUp, Heart, Send, User } from 'lucide-react';

// Custom Merge Logo Icon Component - Infinity/Figure-8 interlocking design
const MergeLogoIcon = ({ focused, color, size = 20 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      {/* Infinity/Figure-8 interlocking shape - Merge logo */}
      <path
        d="M7 12C7 9.79086 8.79086 8 11 8C12.3261 8 13.5 8.67157 14.25 9.66667C14.75 10.3333 15.25 10.3333 15.75 9.66667C16.5 8.67157 17.6739 8 19 8C21.2091 8 23 9.79086 23 12C23 14.2091 21.2091 16 19 16C17.6739 16 16.5 15.3284 15.75 14.3333C15.25 13.6667 14.75 13.6667 14.25 14.3333C13.5 15.3284 12.3261 16 11 16C8.79086 16 7 14.2091 7 12Z"
        fill={focused ? color : "none"}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small center diamond/connection point */}
      <path
        d="M14.25 10.5L15 12L14.25 13.5L13.5 12L14.25 10.5Z"
        fill={focused ? color : "none"}
        stroke={color}
        strokeWidth={1.0}
        strokeLinecap="round"
        strokeLinejoin="round"
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
        {items.map(({ id, icon: Icon, label, path, isCustom }) => {
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
              {isCustom ? (
                <Icon 
                  focused={isActive}
                  color={isActive ? '#00D9FF' : '#FFFFFF'}
                  size={20}
                />
              ) : (
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
              )}
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
