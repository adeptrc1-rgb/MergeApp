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
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        bottom: 0,
        paddingTop: '2px',
        paddingBottom: 'max(env(safe-area-inset-bottom), 34px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 9999,
        pointerEvents: 'auto',
        touchAction: 'manipulation',
        isolation: 'isolate',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div className="flex items-end justify-between mx-auto" style={{ padding: '0 16px', paddingBottom: '4px', maxWidth: '500px' }}>
        {items.map(({ id, icon: Icon, label, path, isCustom }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`[BottomNav] Navigating to: ${path} (from tab: ${id})`);
                navigate(path);
              }}
              className="flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-out"
              style={{
                minWidth: '64px',
                minHeight: '56px',
                padding: '8px 10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                cursor: 'pointer',
                background: isActive 
                  ? 'rgba(0, 217, 255, 0.1)' 
                  : 'transparent',
                border: 'none',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 10000,
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isActive 
                  ? '0 4px 12px rgba(0, 217, 255, 0.2)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.background = isActive 
                  ? 'rgba(0, 217, 255, 0.15)' 
                  : 'rgba(255, 255, 255, 0.1)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.background = isActive 
                  ? 'rgba(0, 217, 255, 0.1)' 
                  : 'transparent';
              }}
            >
              {isCustom ? (
                <Icon 
                  focused={isActive}
                  size={20}
                />
              ) : (
                <Icon 
                  className="transition-all duration-300" 
                  style={{ 
                    width: '20px',
                    height: '20px',
                    color: isActive ? '#00D9FF' : '#FFFFFF',
                    strokeWidth: isActive ? 2.5 : 2,
                    fill: id === 'likes' && isActive ? '#00D9FF' : 'none',
                    transition: 'all 0.3s ease',
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))' : 'none',
                    pointerEvents: 'none'
                  }} 
                />
              )}
              <span 
                className="text-[9px] font-semibold transition-all duration-300"
                style={{
                  color: isActive ? '#00D9FF' : '#FFFFFF',
                  opacity: isActive ? 1 : 0.7,
                  letterSpacing: '0.3px',
                  pointerEvents: 'none',
                  textShadow: isActive ? '0 0 10px rgba(0, 217, 255, 0.5)' : 'none'
                }}
              >
                {label}
              </span>
              {isActive && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '32px',
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #00D9FF, transparent)',
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 0 8px rgba(0, 217, 255, 0.8)',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
