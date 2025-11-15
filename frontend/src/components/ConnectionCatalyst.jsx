import React, { useState, useEffect } from 'react';
import { Network, Zap, GitBranch, Activity } from 'lucide-react';

const ANIMATION_PHASES = {
  MATCH_REVEAL: { duration: 2000, label: "CONNECTION ESTABLISHED" },
  ALGORITHM_PROCESSING: { duration: 2500, label: "Activating your first interaction..." },
  CATALYST_ANIMATION: { duration: 2500, label: "" },
  RESULT_REVEAL: { duration: 2000, label: "" }
};

const TOTAL_DURATION = 9000; // 9 seconds total

export default function ConnectionCatalyst({ 
  isOpen, 
  onClose, 
  matchData,
  currentUserId,
  winnerId,
  animationStartTime,
  otherUserName = "Your Match"
}) {
  const [currentPhase, setCurrentPhase] = useState('waiting');
  const [nodeRotation, setNodeRotation] = useState(0);
  const [showNodes, setShowNodes] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  
  const isUserStarts = currentUserId === winnerId;

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
    setShowNodes(true);

    setTimeout(() => {
      // Phase 2: Algorithm Processing
      setCurrentPhase('algorithm_processing');
    }, ANIMATION_PHASES.MATCH_REVEAL.duration);

    setTimeout(() => {
      // Phase 3: Catalyst Animation
      setCurrentPhase('catalyst_animation');
      startCatalystAnimation();
    }, ANIMATION_PHASES.MATCH_REVEAL.duration + ANIMATION_PHASES.ALGORITHM_PROCESSING.duration);

    setTimeout(() => {
      // Phase 4: Result Reveal
      setCurrentPhase('result_reveal');
      setShowNodes(true);
    }, ANIMATION_PHASES.MATCH_REVEAL.duration + ANIMATION_PHASES.ALGORITHM_PROCESSING.duration + ANIMATION_PHASES.CATALYST_ANIMATION.duration);
  };

  const startCatalystAnimation = () => {
    let count = 0;
    const animationInterval = setInterval(() => {
      count++;
      setNodeRotation(count * 60);
      setProcessingCount(count);
      
      if (count >= 5) {
        clearInterval(animationInterval);
      }
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Animated Network Nodes */}
      {showNodes && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-node-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 2 === 0 ? '#3B82F6' : '#8B5CF6',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-md w-full">
        {/* Phase 1: Match Reveal */}
        {currentPhase === 'match_reveal' && (
          <div className="text-center animate-reveal-in">
            <h1 className="text-3xl font-semibold text-white mb-8 animate-glow-pulse">
              {ANIMATION_PHASES.MATCH_REVEAL.label}
            </h1>
            
            {/* Network Connection Visual */}
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* User Node */}
              <div className="relative">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center animate-node-float"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)',
                    border: '2px solid rgba(59, 130, 246, 0.8)'
                  }}
                >
                  <Network className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Connection Line with pulses */}
              <div className="relative w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-pulse-line">
                <div className="absolute top-1/2 left-0 w-3 h-3 bg-blue-400 rounded-full -translate-y-1/2 animate-pulse-travel" />
              </div>

              {/* Match Node */}
              <div className="relative">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center animate-node-float"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
                    border: '2px solid rgba(139, 92, 246, 0.8)',
                    animationDelay: '0.3s'
                  }}
                >
                  <Network className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            <p className="text-white/70 text-sm">Two networks aligned</p>
          </div>
        )}

        {/* Phase 2: Algorithm Processing */}
        {currentPhase === 'algorithm_processing' && (
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white mb-8 animate-pulse">
              {ANIMATION_PHASES.ALGORITHM_PROCESSING.label}
            </h2>
            <div className="relative h-64 flex items-center justify-center">
              {/* Data Processing Rings */}
              {[0, 1, 2].map((ring, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border-2 animate-ripple-out"
                  style={{
                    width: `${120 + ring * 60}px`,
                    height: `${120 + ring * 60}px`,
                    borderColor: i % 2 === 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)',
                    animationDelay: `${i * 0.4}s`
                  }}
                />
              ))}
              
              {/* Center Processing Core */}
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center animate-glow-pulse"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)'
                }}
              >
                <Activity className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Catalyst Animation */}
        {currentPhase === 'catalyst_animation' && (
          <div className="text-center">
            <div className="relative h-64 flex items-center justify-center">
              {/* Rotating Geometric Token with Nodes */}
              <div
                className="relative w-40 h-40 transition-transform duration-500"
                style={{
                  transform: `rotate(${nodeRotation}deg)`,
                }}
              >
                {/* Central Token */}
                <div 
                  className="absolute inset-0 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                    boxShadow: '0 0 50px rgba(59, 130, 246, 0.8), 0 0 100px rgba(139, 92, 246, 0.6)',
                    transform: 'rotate(45deg)'
                  }}
                >
                  <div style={{ transform: 'rotate(-45deg)' }}>
                    <GitBranch className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                {/* Connection Nodes at corners */}
                {[0, 90, 180, 270].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-6 rounded-full animate-pulse"
                    style={{
                      background: i % 2 === 0 ? '#3B82F6' : '#8B5CF6',
                      boxShadow: `0 0 20px ${i % 2 === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(139, 92, 246, 0.8)'}`,
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${angle}deg) translateX(80px) translateY(-50%)`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Result Reveal */}
        {currentPhase === 'result_reveal' && (
          <div className="text-center animate-reveal-in">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 animate-glow-pulse"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)'
                }}
              >
                <Zap className="w-10 h-10 text-white" />
              </div>
              
              {isUserStarts ? (
                <>
                  <h1 className="text-3xl font-semibold text-white mb-4 animate-glow-pulse">
                    You're up first!
                  </h1>
                  <p className="text-lg text-white/80 mb-2">
                    The algorithm picked you to break the ice
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-semibold text-white mb-4">
                    The algorithm suggests
                  </h1>
                  <p className="text-2xl text-white/90 mb-2 font-medium">
                    {otherUserName} starts the conversation
                  </p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isUserStarts ? (
                <>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-medium hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      color: '#FFFFFF'
                    }}
                  >
                    <Zap className="w-5 h-5" />
                    Start Conversation
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                  >
                    View AI Starter Suggestions
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                  >
                    Wait for Their Message
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/5 text-white/70 rounded-xl font-medium hover:bg-white/10 transition-all"
                  >
                    Prepare Your Response
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live Connection Indicator */}
        {(currentPhase === 'match_reveal' || currentPhase === 'algorithm_processing' || currentPhase === 'catalyst_animation') && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-xs">Analyzing Connection</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes node-pulse {
          0%, 100% { 
            transform: scale(0.8);
            opacity: 0.3; 
          }
          50% { 
            transform: scale(1.2);
            opacity: 1; 
          }
        }
        
        @keyframes reveal-in {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        @keyframes ripple-out {
          0% { 
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% { 
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px currentColor, 0 0 60px currentColor;
            transform: scale(1.05);
          }
        }
        
        @keyframes node-float {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
          }
          50% { 
            transform: translateY(-10px) scale(1.05); 
          }
        }
        
        @keyframes pulse-line {
          0%, 100% { 
            opacity: 0.6;
            transform: scaleX(1);
          }
          50% { 
            opacity: 1;
            transform: scaleX(1.1);
          }
        }
        
        @keyframes pulse-travel {
          0% { 
            left: 0;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% { 
            left: 100%;
            opacity: 0;
          }
        }
        
        .animate-node-pulse { animation: node-pulse 3s ease-in-out infinite; }
        .animate-reveal-in { animation: reveal-in 0.8s ease-out; }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-node-float { animation: node-float 3s ease-in-out infinite; }
        .animate-ripple-out { animation: ripple-out 2s ease-out infinite; }
        .animate-pulse-line { animation: pulse-line 2s ease-in-out infinite; }
        .animate-pulse-travel { animation: pulse-travel 2s linear infinite; }
      `}</style>
    </div>
  );
}
