import React from 'react';
import { TrendingUp, Heart, Send, User } from 'lucide-react';

// Custom Merge Logo Icon Component - Using actual logo image
const MergeLogoIcon = ({ focused, color, size = 24 }) => {
  return (
    <img 
      src="https://customer-assets.emergentagent.com/job_datapp-overhaul/artifacts/5arika4k_1b67058b-c8b7-4c56-94c3-dbae55e7728c.png"
      alt="Merge"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: focused 
          ? 'brightness(0) saturate(100%) invert(71%) sepia(73%) saturate(2234%) hue-rotate(166deg) brightness(102%) contrast(101%) drop-shadow(0 0 0.5px #00D9FF)' // Cyan filter with slight thickness
          : 'brightness(0) invert(1) drop-shadow(0 0 0.3px #FFFFFF)', // White filter with slight thickness
        transition: 'all 0.2s ease'
      }}
    />
  );
};

// Shared Bottom Navigation - Premium 5-Tab Layout
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
        background: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
        backdropFilter: darkMode ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: darkMode ? 'blur(10px)' : 'none',
        bottom: 0,
        paddingBottom: '0px',
        marginBottom: 'calc(env(safe-area-inset-bottom, 0px) * -0.5)',
        zIndex: 200
      }}
    >
      <div className="flex items-center justify-between mx-auto" style={{ padding: '2px 24px', height: '46px', maxWidth: '500px' }}>
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
                  size={24}
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
