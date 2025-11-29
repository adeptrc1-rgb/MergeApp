import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Sparkles, Star, Check, Lock, Zap, Flame } from 'lucide-react';
import BottomNav from './BottomNav';
import MergeLogo from './MergeLogo';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;
axios.defaults.withCredentials = true;

export default function Store({ user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState({ owned_items: [], active_light: null, active_skin: null, star_coins: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lights');
  const [purchasing, setPurchasing] = useState(null);
  const [message, setMessage] = useState(null);

  // Check URL params for tab on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'skins' || tab === 'lights') {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      const [itemsRes, inventoryRes] = await Promise.all([
        axios.get(`${API}/store/items`),
        axios.get(`${API}/store/inventory`)
      ]);
      setItems(itemsRes.data || []);
      setInventory(inventoryRes.data || { owned_items: [], active_light: null, active_skin: null, star_coins: 0 });
    } catch (error) {
      console.error('Error loading store:', error);
    }
    setLoading(false);
  };

  const purchaseItem = async (item) => {
    if (purchasing) return;
    
    try {
      setPurchasing(item.id);
      const res = await axios.post(`${API}/store/purchase`, { item_id: item.id });
      
      if (res.data.success) {
        showMessage(`✨ Purchased ${item.name}!`, 'success');
        await loadStore();
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Purchase failed';
      showMessage(msg, 'error');
    } finally {
      setPurchasing(null);
    }
  };

  const activateItem = async (itemId, itemType) => {
    try {
      const res = await axios.post(`${API}/store/activate`, { item_id: itemId, item_type: itemType });
      
      if (res.data.success) {
        showMessage(`Activated ${res.data.item?.name || itemType}!`, 'success');
        await loadStore();
      }
    } catch (error) {
      showMessage('Activation failed', 'error');
    }
  };

  const deactivateItem = async (itemType) => {
    try {
      const res = await axios.post(`${API}/store/activate`, { item_id: null, item_type: itemType });
      
      if (res.data.success) {
        showMessage(`Removed ${itemType}`, 'success');
        await loadStore();
      }
    } catch (error) {
      showMessage('Deactivation failed', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const isOwned = (itemId) => inventory.owned_items.includes(itemId);
  const isActive = (itemId, itemType) => {
    return itemType === 'light' ? inventory.active_light === itemId : inventory.active_skin === itemId;
  };

  const filteredItems = items.filter(item => {
    // 'lights' tab shows 'light' type, 'skins' tab shows 'skin' type
    const targetType = activeTab.slice(0, -1); // removes the 's' from 'lights' or 'skins'
    return item.type === targetType;
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {/* Subtle animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading Marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-5" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 z-10" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <MergeLogo size="sm" color="#FFFFFF" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-default)' }}>
              <Star className="w-5 h-5" style={{ color: '#FFD700' }} />
              <span className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>{inventory.star_coins}</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>coins</span>
            </div>
          </div>

          {/* Message Toast */}
          {message && (
            <div className="mb-3 px-4 py-2 rounded-lg inline-flex items-center gap-2" style={{
              backgroundColor: message.type === 'success' ? 'var(--surface-default)' : 'rgba(239, 68, 68, 0.2)',
              border: message.type === 'success' ? '1px solid var(--border-default)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: message.type === 'success' ? 'var(--text-primary)' : '#FCA5A5'
            }}>
              <Sparkles className="w-4 h-4" style={{ color: message.type === 'success' ? 'var(--accent-primary)' : 'var(--error)' }} />
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('lights')}
              className="flex-1 px-4 py-2 rounded-lg transition-all"
              style={{
                background: activeTab === 'lights' ? 'var(--accent-primary)' : 'var(--surface-default)',
                border: activeTab === 'lights' ? 'none' : '1px solid var(--border-subtle)',
                color: activeTab === 'lights' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'lights') {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'lights') {
                  e.currentTarget.style.backgroundColor = 'var(--surface-default)';
                }
              }}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Lights
            </button>
            <button
              onClick={() => setActiveTab('skins')}
              className="flex-1 px-4 py-2 rounded-lg transition-all"
              style={{
                background: activeTab === 'skins' ? 'var(--accent-primary)' : 'var(--surface-default)',
                border: activeTab === 'skins' ? 'none' : '1px solid var(--border-subtle)',
                color: activeTab === 'skins' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'skins') {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'skins') {
                  e.currentTarget.style.backgroundColor = 'var(--surface-default)';
                }
              }}
            >
              <Flame className="w-4 h-4 inline mr-2" />
              Auras
            </button>
          </div>
        </div>
      </div>

      {/* Store Items Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const owned = isOwned(item.id);
            const active = isActive(item.id, item.type);

            return (
              <div
                key={item.id}
                className="relative rounded-2xl border overflow-hidden transition-all"
                style={{ 
                  background: active ? 'var(--surface-hover)' : 'var(--surface-default)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  boxShadow: active ? 'var(--shadow-accent)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {/* Preview Area */}
                <div className="h-48 relative overflow-hidden">
                  {item.type === 'light' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-32 h-32 rounded-full"
                        style={{
                          background: item.effect.type === 'glow' 
                            ? `radial-gradient(circle, ${item.effect.color}80, transparent)`
                            : item.effect.colors
                            ? `linear-gradient(135deg, ${item.effect.colors.join(', ')})`
                            : '#a78bfa',
                          boxShadow: `0 0 60px ${item.effect.color || item.effect.colors?.[0] || '#a78bfa'}`,
                          animation: 'pulse 2s ease-in-out infinite'
                        }}
                      />
                    </div>
                  )}
                  {item.type === 'skin' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      {/* Show sample profile with animated text */}
                      <div className="text-center">
                        <div 
                          className="text-4xl font-light mb-2"
                          style={{
                            color: item.effect.textGlow || '#ffffff',
                            textShadow: `0 0 10px ${item.effect.textGlow || '#ffffff'}`,
                            ...(item.effect.nameAnimation === 'glow' && { animation: 'text-glow 3s ease-in-out infinite' }),
                            ...(item.effect.nameAnimation === 'gradient_shift' && { 
                              background: `linear-gradient(90deg, ${item.effect.overlayColors?.join(', ')})`,
                              backgroundSize: '200% auto',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              animation: 'text-gradient 4s linear infinite'
                            }),
                            ...(item.effect.nameAnimation === 'shimmer' && {
                              background: `linear-gradient(90deg, white, ${item.effect.textGlow}, white)`,
                              backgroundSize: '200% auto',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              animation: 'text-shimmer 5s linear infinite'
                            }),
                            ...(item.effect.nameAnimation === 'neon_pulse' && { animation: 'text-neon 2s ease-in-out infinite' }),
                            ...(item.effect.nameAnimation === 'rainbow_gradient' && { 
                              background: `linear-gradient(90deg, ${item.effect.gradientColors?.join(', ')})`,
                              backgroundSize: '200% auto',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              animation: 'text-gradient 4s linear infinite'
                            }),
                            ...(item.effect.nameAnimation === 'autism_gradient' && { 
                              background: `linear-gradient(90deg, ${item.effect.gradientColors?.join(', ')})`,
                              backgroundSize: '200% auto',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              animation: 'text-gradient 4s linear infinite'
                            })
                          }}
                        >
                          Name
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Active Badge */}
                  {active && (
                    <div className="absolute top-2 right-2 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #667EEA 100%)' }}>
                      <Check className="w-3 h-3" />
                      Active
                    </div>
                  )}
                  
                  {/* Owned Badge */}
                  {owned && !active && (
                    <div className="absolute top-2 right-2 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs border border-white/20">
                      Owned
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <h3 className="text-lg font-medium text-white mb-1">{item.name}</h3>
                  <p className="text-sm text-white/60 mb-3">{item.description}</p>

                  {/* Price / Action */}
                  {!owned ? (
                    <button
                      onClick={() => purchaseItem(item)}
                      disabled={purchasing === item.id || inventory.star_coins < item.price}
                      className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                        inventory.star_coins >= item.price
                          ? 'hover:scale-105'
                          : 'bg-white/10 cursor-not-allowed'
                      }`}
                      style={inventory.star_coins >= item.price ? { background: 'linear-gradient(135deg, #6C63FF 0%, #667EEA 100%)' } : {}}
                    >
                      {purchasing === item.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Purchasing...
                        </>
                      ) : inventory.star_coins >= item.price ? (
                        <>
                          <Star className="w-4 h-4" />
                          {item.price} coins
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          {item.price} coins
                        </>
                      )}
                    </button>
                  ) : active ? (
                    <button
                      onClick={() => deactivateItem(item.type)}
                      className="w-full py-2 rounded-lg font-medium bg-white/10 hover:bg-white/20 transition-all border border-white/20"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => activateItem(item.id, item.type)}
                      className="w-full py-2 rounded-lg font-medium hover:scale-105 transition-all"
                      style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #667EEA 100%)' }}
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="store" navigate={navigate} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
