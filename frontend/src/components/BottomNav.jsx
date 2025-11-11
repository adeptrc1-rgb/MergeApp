import React from 'react';
import { Home as HomeIcon, Sparkles, MessageCircle, Users, Star, ShoppingBag } from 'lucide-react';

// Shared Bottom Navigation (16px icons, consistent sizing)
export default function BottomNav({ currentTab, navigate }) {
  const items = [
    { id: 'home', icon: HomeIcon, label: 'Home', path: '/home' },
    { id: 'discover', icon: Sparkles, label: 'Discover', path: '/discover' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', path: '/messages' },
    { id: 'connections', icon: Users, label: 'Connect', path: '/connections' },
    { id: 'profile', icon: Star, label: 'Profile', path: '/profile' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 pb-safe z-40 select-none" style={{ WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none', userSelect: 'none' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ id, icon: Icon, label, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              currentTab === id ? 'text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] leading-none mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
