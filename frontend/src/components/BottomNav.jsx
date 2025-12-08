import React from 'react';
import { TrendingUp, Heart, Send, User, Home } from 'lucide-react';

// Custom Merge Logo Icon Component - Simplified for better performance
const MergeLogoIcon = ({ focused, size = 22 }) => {
  return (
    <div style={{ 
      width: size, 
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      <Home 
        style={{
          width: size,
          height: size,
          color: focused ? '#00D9FF' : '#FFFFFF',
          strokeWidth: focused ? 2.5 : 2,
          filter: focused ? 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))' : 'none',
          transition: 'all 0.2s ease'
        }}
      />
    </div>
  );
};

// Redesigned Bottom Navigation - Optimized for Profile Tab
export default function BottomNav({ currentTab, navigate, darkMode = false }) {
  const items = [
    { id: 'home', icon: MergeLogoIcon, label: 'Explore', path: '/home', isCustom: true },
    { id: 'discover', icon: TrendingUp, label: 'Trending', path: '/discover' },
    { id: 'likes', icon: Heart, label: 'Connections', path: '/likes' },
    { id: 'messages', icon: Send, label: 'Messages', path: '/messages' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];
  
  return (
    <div 
      className="fixed left-0 right-0 select-none" 
      style={{ 
        WebkitTapHighlightColor: 'transparent', 
        WebkitTouchCallout: 'none', 
        userSelect: 'none',
        background: darkMode 
          ? 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.95) 100%)'
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        bottom: 0,
        paddingTop: '8px',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        borderTop: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)' 
          : '1px solid rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        isolation: 'isolate',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="flex items-center justify-between mx-auto" style={{ padding: '0 16px', maxWidth: '500px' }}>
        {items.map(({ id, icon: Icon, label, path, isCustom }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(path);
              }}
              className="flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ease-out"
              style={{
                minWidth: '56px',
                minHeight: '44px',
                padding: '6px 8px',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                position: 'relative',
                zIndex: 10000
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
              onTouchStart={(e) => {
                // Ensure touch events work
                e.currentTarget.style.opacity = '0.7';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {isCustom ? (
                <Icon 
                  focused={isActive}
                  color={isActive ? '#00D9FF' : '#FFFFFF'}
                  size={18}
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <Icon 
                  className="transition-all duration-200" 
                  style={{ 
                    width: '16px',
                    height: '16px',
                    color: isActive ? '#00D9FF' : '#FFFFFF',
                    strokeWidth: isActive ? 2.5 : 2,
                    fill: isActive ? '#00D9FF' : 'none',
                    transition: 'all 0.2s ease',
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.5))' : 'none',
                    pointerEvents: 'none'
                  }} 
                />
              )}
              <span 
                className="text-[8px] font-medium transition-all duration-200"
                style={{
                  color: isActive ? '#00D9FF' : '#FFFFFF',
                  opacity: isActive ? 1 : 0.6,
                  letterSpacing: '0.2px',
                  pointerEvents: 'none'
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
