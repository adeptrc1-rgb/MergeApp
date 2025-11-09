import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Zap } from 'lucide-react';
import ConstellationIcon from './ConstellationIcon';

const ANIMATION_PHASES = {
  MATCH_REVEAL: { duration: 2000, label: "IT'S A COSMIC ALIGNMENT!" },
  ENERGY_GATHERING: { duration: 2000, label: "THE UNIVERSE IS DECIDING..." },
  COIN_FLIP: { duration: 3000, label: "" },
  RESULT_REVEAL: { duration: 2000, label: "" }
};

const TOTAL_DURATION = 9000; // 9 seconds total

export default function SynchronizedCosmicFlip({ 
  isOpen, 
  onClose, 
  matchData,
  currentUserId,
  winnerId,
  animationStartTime,
  otherUserName = "Your Match",
  currentUserZodiac = "Leo",
  otherUserZodiac = "Aries"
}) {
  const [currentPhase, setCurrentPhase] = useState('waiting');
  const [coinRotation, setCoinRotation] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  
  const isWinner = currentUserId === winnerId;

  useEffect(() => {
    if (!isOpen || !animationStartTime) return;

    // Calculate when to start based on server time
    const startTime = new Date(animationStartTime).getTime();
    const now = Date.now();
    const timeUntilStart = startTime - now;

    // Wait until synchronized start time
    const startTimeout = setTimeout(() => {
      startAnimationSequence();
    }, Math.max(0, timeUntilStart));

    return () => clearTimeout(startTimeout);
  }, [isOpen, animationStartTime]);

  const startAnimationSequence = () => {
    // Phase 1: Match Reveal
    setCurrentPhase('match_reveal');
    setShowParticles(true);

    setTimeout(() => {
      // Phase 2: Energy Gathering
      setCurrentPhase('energy_gathering');
    }, ANIMATION_PHASES.MATCH_REVEAL.duration);

    setTimeout(() => {
      // Phase 3: Coin Flip
      setCurrentPhase('coin_flip');
      startCoinFlip();
    }, ANIMATION_PHASES.MATCH_REVEAL.duration + ANIMATION_PHASES.ENERGY_GATHERING.duration);

    setTimeout(() => {
      // Phase 4: Result Reveal
      setCurrentPhase('result_reveal');
      setShowParticles(true);
    }, ANIMATION_PHASES.MATCH_REVEAL.duration + ANIMATION_PHASES.ENERGY_GATHERING.duration + ANIMATION_PHASES.COIN_FLIP.duration);
  };

  const startCoinFlip = () => {
    let count = 0;
    const flipInterval = setInterval(() => {
      count++;
      setCoinRotation(count * 180);
      setFlipCount(count);
      
      if (count >= 5) {
        clearInterval(flipInterval);
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Animated Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-md w-full">
        {/* Phase 1: Match Reveal */}
        {currentPhase === 'match_reveal' && (
          <div className="text-center animate-cosmic-reveal">
            <h1 className="text-4xl font-light text-white mb-8 animate-pulse-glow">
              {ANIMATION_PHASES.MATCH_REVEAL.label}
            </h1>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-white/30 animate-float-slow" />
              <Sparkles className="w-8 h-8 text-purple-400 animate-spin-slow" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white/30 animate-float-slow" />
            </div>
          </div>
        )}

        {/* Phase 2: Energy Gathering */}
        {currentPhase === 'energy_gathering' && (
          <div className="text-center">
            <h2 className="text-2xl font-light text-white mb-8 animate-pulse">
              {ANIMATION_PHASES.ENERGY_GATHERING.label}
            </h2>
            <div className="relative h-64 flex items-center justify-center">
              {/* Orbiting Glyphs */}
              {[0, 120, 240].map((angle, i) => (
                <div
                  key={i}
                  className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-white/40 flex items-center justify-center"
                  style={{
                    animation: `orbit 2s linear infinite`,
                    animationDelay: `${i * 0.3}s`,
                    transformOrigin: 'center'
                  }}
                >
                  <Star className="w-8 h-8 text-white" />
                </div>
              ))}
              
              {/* Center Energy Core */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white to-purple-400 animate-pulse-glow shadow-2xl shadow-purple-500/50" />
            </div>
          </div>
        )}

        {/* Phase 3: Coin Flip */}
        {currentPhase === 'coin_flip' && (
          <div className="text-center">
            <div className="relative h-64 flex items-center justify-center perspective-1000">
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border-4 border-yellow-300 shadow-2xl shadow-yellow-500/50 flex items-center justify-center transition-transform duration-600"
                style={{
                  transform: `rotateY(${coinRotation}deg) translateY(${Math.sin(flipCount * 0.5) * 20}px)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="text-4xl font-bold text-amber-900">✧</div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Result Reveal */}
        {currentPhase === 'result_reveal' && (
          <div className="text-center animate-cosmic-reveal">
            <h1 className="text-3xl font-light text-white mb-6 animate-pulse-glow">
              THE COSMOS CHOOSES
            </h1>
            <div className="mb-8">
              <div className={`text-5xl font-light mb-4 ${isWinner ? 'text-yellow-400 animate-text-glow' : 'text-purple-400'}`}>
                {isWinner ? 'YOU' : otherUserName.toUpperCase()}
              </div>
              {isWinner && (
                <div className="text-white/80 text-lg mb-2">
                  🌟 You have the cosmic honor of starting the conversation
                </div>
              )}
              {!isWinner && (
                <div className="text-white/60 text-lg">
                  The universe awaits their message to you
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isWinner ? (
                <>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Send First Message
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                  >
                    Get Conversation Ideas
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                  >
                    Await Their Message
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/5 text-white/70 rounded-xl font-medium hover:bg-white/10 transition-all"
                  >
                    Prepare Your Energy
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live Connection Indicator */}
        {(currentPhase === 'match_reveal' || currentPhase === 'energy_gathering' || currentPhase === 'coin_flip') && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-xs">Live Cosmic Connection</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-200px) scale(1); opacity: 0; }
        }
        
        @keyframes cosmic-reveal {
          0% { opacity: 0; transform: scale(0.8) rotate(-5deg); }
          50% { opacity: 1; transform: scale(1.05) rotate(0deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
          50% { text-shadow: 0 0 30px currentColor, 0 0 60px currentColor; }
        }
        
        .animate-float-up { animation: float-up 4s ease-out infinite; }
        .animate-cosmic-reveal { animation: cosmic-reveal 1s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-text-glow { animation: pulse-glow 1.5s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        .perspective-1000 { perspective: 1000px; }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
