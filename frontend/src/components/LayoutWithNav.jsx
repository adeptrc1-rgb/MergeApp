import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const LayoutWithNav = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine current tab based on route
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/home') return 'home';
    if (path === '/discover') return 'discover';
    if (path === '/likes') return 'likes';
    if (path === '/messages' || path === '/astro-chat') return 'messages';
    if (path === '/profile' || path === '/settings') return 'profile';
    if (path === '/store') return 'store';
    return 'home';
  };
  
  // Determine if dark mode should be used - ALWAYS use dark mode for consistency
  const useDarkMode = () => {
    return true;
  };
  
  return (
    <>
      {children}
      <BottomNav 
        currentTab={getCurrentTab()} 
        navigate={navigate} 
        darkMode={useDarkMode()} 
      />
    </>
  );
};

export default LayoutWithNav;
