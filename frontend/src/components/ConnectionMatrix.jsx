import React, { useState, useEffect } from 'react';
import { X, Activity, Zap, MessageCircle, Star, TrendingUp, BarChart3, Network, Target } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

// Configure axios for this component
axios.defaults.withCredentials = true;

// Tier colors for data-driven feedback
const TIER_COLORS = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  legendary: 'from-blue-400 via-green-400 to-blue-500'
};

// Icon mapping for rewards (rebranded)
const REWARD_ICONS = {
  boost: TrendingUp,
  super_like: Star,
  dm: MessageCircle,
  star_coins: Activity,
  extra_spin: BarChart3,
  match_preview: Target,
  compatibility_boost: Zap,
  insight: Network,
  spotlight: TrendingUp,
  hidden_match: Target,
  avatar_animation: Activity,
  cooldown_skip: Zap,
  highlight: Star,
  streak_bonus: TrendingUp,
  seasonal_skin: BarChart3
};

// Network nodes for the matrix
const MATRIX_NODES = [
  { id: 1, type: 'boost', icon: REWARD_ICONS.boost, color: '#3B82F6' },
  { id: 2, type: 'super_like', icon: REWARD_ICONS.super_like, color: '#10B981' },
  { id: 3, type: 'dm', icon: REWARD_ICONS.dm, color: '#3B82F6' },
  { id: 4, type: 'star_coins', icon: REWARD_ICONS.star_coins, color: '#10B981' },
  { id: 5, type: 'extra_spin', icon: REWARD_ICONS.extra_spin, color: '#3B82F6' },
  { id: 6, type: 'boost', icon: REWARD_ICONS.boost, color: '#10B981' },
  { id: 7, type: 'super_like', icon: REWARD_ICONS.super_like, color: '#3B82F6' },
  { id: 8, type: 'star_coins', icon: REWARD_ICONS.star_coins, color: '#10B981' }
];

export default function ConnectionMatrix({ isOpen, onClose, onRewardClaimed }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [matrixStatus, setMatrixStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNodes, setActiveNodes] = useState([]);

  const isPreview = typeof window !== 'undefined' && window.location.hostname.includes('preview.emergentagent.com');

  useEffect(() => {
    if (isOpen) fetchMatrixStatus();
  }, [isOpen]);

  // Dev environment - always allow analysis
  useEffect(() => {
    const ensureAnalyzable = async () => {
      if (!isPreview) return;
      if (!matrixStatus || !matrixStatus.can_spin) {
        try { 
          await axios.post(`${API}/rewards/reset-cosmic-wheel`, {}, { withCredentials: true }); 
        } catch {}
        await fetchMatrixStatus();
      }
    };
    ensureAnalyzable();
  }, [isPreview, matrixStatus?.can_spin]);

  const fetchMatrixStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/rewards/cosmic-wheel-status`, { withCredentials: true });
      setMatrixStatus(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wheel status:', err);
      if (err.response?.status === 401) {
        setError('Please log in to use the Merge Wheel');
      } else {
        setError(err.response?.data?.detail || 'Unable to load Merge Wheel');
      }
      setLoading(false);
    }
  };

  const analyzeConnections = async () => {
    if (!matrixStatus?.can_spin || analyzing) return;

    setAnalyzing(true);
    setProgress(0);
    setActiveNodes([]);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Animate nodes lighting up
    const nodeInterval = setInterval(() => {
      setActiveNodes(prev => {
        if (prev.length >= MATRIX_NODES.length) {
          clearInterval(nodeInterval);
          return prev;
        }
        return [...prev, MATRIX_NODES[prev.length].id];
      });
    }, 200);

    try {
      const response = await axios.post(`${API}/rewards/spin-cosmic-wheel`, {}, { withCredentials: true });
      
      setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(nodeInterval);
        setProgress(100);
        setActiveNodes(MATRIX_NODES.map(n => n.id));
        
        setTimeout(() => {
          setSelectedReward(response.data.reward);
          setShowReward(true);
          setAnalyzing(false);
          
          if (onRewardClaimed) {
            onRewardClaimed(response.data.reward);
          }
        }, 500);
      }, 2000);
      
    } catch (err) {
      clearInterval(progressInterval);
      clearInterval(nodeInterval);
      console.error('Error analyzing connections:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.detail || 'No spins remaining today');
      } else {
        setError(err.response?.data?.detail || 'Analysis failed');
      }
      setAnalyzing(false);
    }
  };

  const handleClaimReward = async () => {
    setShowReward(false);
    setSelectedReward(null);
    setProgress(0);
    setActiveNodes([]);
    await fetchMatrixStatus();
  };

  const formatTimeRemaining = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const rewardDisplayName = (reward) => {
    const names = {
      boost: 'Profile Boost',
      super_like: 'Priority Match',
      dm: 'Direct Message Token',
      star_coins: 'Connection Credits',
      extra_spin: 'Extra Analysis',
      match_preview: 'Match Preview',
      compatibility_boost: 'Compatibility Boost',
      insight: 'Connection Insight',
      spotlight: 'Spotlight Feature',
      hidden_match: 'Hidden Match Reveal',
      avatar_animation: 'Profile Animation',
      cooldown_skip: 'Instant Refresh',
      highlight: 'Profile Highlight',
      streak_bonus: 'Streak Bonus',
      seasonal_skin: 'Premium Theme'
    };
    return names[reward?.type] || reward?.type || 'Reward';
  };

  if (!isOpen) {
    console.log('[CONNECTIONMATRIX] Modal is closed (isOpen=false)');
    return null;
  }

  console.log('[CONNECTIONMATRIX] Rendering modal, loading=', loading, 'error=', error, 'matrixStatus=', matrixStatus);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="relative rounded-2xl p-8 max-w-md w-full"
        style={{ 
          backgroundColor: '#0A0A0A',
          border: '1px solid #262626',
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: '#737373' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FAFAFA'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#737373'}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔷</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#FAFAFA' }}>
            MERGE WHEEL
          </h2>
          <p className="text-sm" style={{ color: '#A3A3A3' }}>
            Spin to earn rewards and boosts
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Activity className="w-12 h-12 animate-spin mb-4" style={{ color: '#3B82F6' }} />
            <p style={{ color: '#A3A3A3' }}>Loading matrix...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="mb-4" style={{ color: '#EF4444' }}>{error}</p>
            <button
              onClick={fetchMatrixStatus}
              className="px-6 py-2 rounded-full transition-all"
              style={{ backgroundColor: '#3B82F6', color: '#FAFAFA' }}
            >
              Retry
            </button>
          </div>
        ) : showReward ? (
          <div className="text-center py-8">
            <div className="mb-6">
              {selectedReward && React.createElement(REWARD_ICONS[selectedReward.type] || Activity, {
                className: "w-20 h-20 mx-auto",
                style: { color: '#10B981' }
              })}
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FAFAFA' }}>
              Analysis Complete!
            </h3>
            <p className="mb-2" style={{ color: '#10B981', fontSize: '18px', fontWeight: '600' }}>
              {rewardDisplayName(selectedReward)}
            </p>
            <p className="text-sm mb-6" style={{ color: '#A3A3A3' }}>
              {selectedReward?.description || 'Connection data optimized'}
            </p>
            <button
              onClick={handleClaimReward}
              className="px-8 py-3 rounded-full font-semibold transition-all"
              style={{ backgroundColor: '#3B82F6', color: '#FAFAFA' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
            >
              Claim Reward
            </button>
          </div>
        ) : (
          <>
            {/* Network Visualization */}
            <div className="relative mb-8" style={{ height: '280px' }}>
              {/* Grid background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Central node */}
                  <div 
                    className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ 
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: analyzing ? '#3B82F6' : '#171717',
                      border: `2px solid ${analyzing ? '#10B981' : '#404040'}`,
                      boxShadow: analyzing ? '0 0 30px rgba(59, 130, 246, 0.5)' : 'none'
                    }}
                  >
                    <Network className="w-8 h-8" style={{ color: analyzing ? '#FAFAFA' : '#737373' }} />
                  </div>

                  {/* Surrounding nodes */}
                  {MATRIX_NODES.map((node, index) => {
                    const angle = (index / MATRIX_NODES.length) * 2 * Math.PI - Math.PI / 2;
                    const radius = 110;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const isActive = activeNodes.includes(node.id);
                    const IconComponent = node.icon;

                    return (
                      <div
                        key={node.id}
                        className="absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                          backgroundColor: isActive ? node.color : '#171717',
                          border: `2px solid ${isActive ? '#10B981' : '#404040'}`,
                          boxShadow: isActive ? `0 0 20px ${node.color}` : 'none'
                        }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: isActive ? '#FAFAFA' : '#737373' }} />
                      </div>
                    );
                  })}

                  {/* Connection lines */}
                  {analyzing && activeNodes.length > 0 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {activeNodes.map((nodeId) => {
                        const index = MATRIX_NODES.findIndex(n => n.id === nodeId);
                        const angle = (index / MATRIX_NODES.length) * 2 * Math.PI - Math.PI / 2;
                        const radius = 110;
                        const x = Math.cos(angle) * radius + 128;
                        const y = Math.sin(angle) * radius + 128;
                        
                        return (
                          <line
                            key={nodeId}
                            x1="128"
                            y1="128"
                            x2={x}
                            y2={y}
                            stroke="#3B82F6"
                            strokeWidth="2"
                            opacity="0.3"
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {analyzing && (
              <div className="mb-6">
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#171717' }}>
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: '#3B82F6',
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                    }}
                  />
                </div>
                <p className="text-center text-xs mt-2" style={{ color: '#3B82F6' }}>
                  Analyzing connection patterns... {progress}%
                </p>
              </div>
            )}

            {/* Action Button */}
            {matrixStatus?.can_spin ? (
              <button
                onClick={analyzeConnections}
                disabled={analyzing}
                className="w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-50"
                style={{ 
                  backgroundColor: analyzing ? '#171717' : '#3B82F6',
                  color: '#FAFAFA',
                  border: '1px solid #3B82F6'
                }}
                onMouseEnter={(e) => !analyzing && (e.currentTarget.style.backgroundColor = '#2563EB')}
                onMouseLeave={(e) => !analyzing && (e.currentTarget.style.backgroundColor = '#3B82F6')}
              >
                {analyzing ? 'Spinning...' : 'Spin the Wheel'}
              </button>
            ) : (
              <div className="text-center py-4 rounded-xl" style={{ backgroundColor: '#171717', border: '1px solid #262626' }}>
                <p className="mb-2" style={{ color: '#FAFAFA' }}>Merge Wheel Activated!</p>
                <p className="text-sm" style={{ color: '#A3A3A3' }}>
                  Next spin in {formatTimeRemaining(matrixStatus?.time_until_next_spin || 0)}
                </p>
              </div>
            )}

            <p className="text-center text-xs mt-4" style={{ color: '#525252' }}>
              Generate connection insights and rewards
            </p>
          </>
        )}
      </div>
    </div>
  );
}
