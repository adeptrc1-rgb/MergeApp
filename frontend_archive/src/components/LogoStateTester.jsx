/**
 * Logo State Tester Component
 * Developer tool to test logo state animations
 */

import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { updateLogoState } from '../utils/logoStateManager';

const LogoStateTester = () => {
  const [isOpen, setIsOpen] = useState(false);

  const states = [
    {
      name: 'default',
      label: 'Default',
      color: '#f8fafc',
      description: 'Normal browsing'
    },
    {
      name: 'connected',
      label: 'Connected',
      color: '#22c55e',
      description: 'Unread messages (persistent)'
    },
    {
      name: 'highMatch',
      label: 'High Match',
      color: '#f59e0b',
      description: '85%+ compatibility (4.5s)'
    },
    {
      name: 'newMatch',
      label: 'New Match',
      color: '#a855f7',
      description: 'Mutual match confirmed (5s)'
    },
    {
      name: 'peakEnergy',
      label: 'Peak Energy',
      color: '#3b82f6',
      description: 'High engagement period (persistent)'
    }
  ];

  const handleStateClick = (stateName) => {
    updateLogoState(stateName);
    console.log(`Logo state set to: ${stateName}`);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110"
        title="Test Logo States"
      >
        <Palette className="w-6 h-6" />
      </button>

      {/* State Testing Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-light text-white">Logo States</h2>
                <p className="text-white/60 text-sm mt-1">Test different animations</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* State Buttons */}
            <div className="space-y-3">
              {states.map((state) => (
                <button
                  key={state.name}
                  onClick={() => handleStateClick(state.name)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    {/* Color Preview Dot */}
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 border border-white/20"
                      style={{ backgroundColor: state.color }}
                    />
                    
                    {/* State Info */}
                    <div className="flex-1">
                      <div className="text-white font-medium">{state.label}</div>
                      <div className="text-white/60 text-sm">{state.description}</div>
                    </div>

                    {/* Arrow */}
                    <div className="text-white/40 group-hover:text-white/60 transition-colors">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-xs text-center">
                Click any state to see the logo animation in the header
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoStateTester;
