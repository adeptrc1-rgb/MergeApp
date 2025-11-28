import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './QuantumInfinityWheel.css';

const QuantumInfinityWheel = ({ isOpen, onClose, onRewardClaimed }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const wheelRef = useRef(null);
  const [phase, setPhase] = useState('idle');
  const [reward, setReward] = useState(null);
  const [showParticleExplosion, setShowParticleExplosion] = useState(false);
  const animationFrameRef = useRef(null);

  // REWARDS DATA
  const REWARDS = [
    { id: 1, type: 'boost', label: '2x Pulse³', color: '#00D9FF', amount: 2, emoji: '⚡' },
    { id: 2, type: 'super_like', label: '5 Super Likes', color: '#A855F7', amount: 5, emoji: '💜' },
    { id: 3, type: 'star_coins', label: '100 Star Coins', color: '#FFD700', amount: 100, emoji: '⭐' },
    { id: 4, type: 'aura', label: 'Exclusive Aura', color: '#EC4899', amount: 1, emoji: '✨' },
    { id: 5, type: 'boost', label: '1 Pulse³', color: '#667eea', amount: 1, emoji: '⚡' },
    { id: 6, type: 'star_coins', label: '50 Star Coins', color: '#FFA500', amount: 50, emoji: '💰' },
  ];

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const size = Math.min(window.innerWidth - 40, 400);
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00D9FF, 1.5);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x667eea, 1.5);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    createInfinityWheel(scene);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (wheelRef.current && phase === 'idle') {
        wheelRef.current.rotation.y += 0.01;
        wheelRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen, phase]);

  const createInfinityWheel = (scene) => {
    const group = new THREE.Group();

    const curve = new THREE.Curve();
    curve.getPoint = function(t) {
      const angle = t * Math.PI * 2;
      const scale = 2.2;
      const x = scale * Math.sin(angle) / (1 + Math.cos(angle) * Math.cos(angle));
      const y = scale * Math.sin(angle) * Math.cos(angle) / (1 + Math.cos(angle) * Math.cos(angle));
      return new THREE.Vector3(x, y, 0);
    };

    const points = curve.getPoints(150);
    
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      150,
      0.08,
      8,
      true
    );
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00D9FF,
      transparent: true,
      opacity: 0.8
    });
    const infinityTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    group.add(infinityTube);

    REWARDS.forEach((reward, index) => {
      const t = index / REWARDS.length;
      const point = curve.getPoint(t);
      
      const segmentGeometry = new THREE.CircleGeometry(0.35, 32);
      const segmentMaterial = new THREE.MeshBasicMaterial({
        color: parseInt(reward.color.replace('#', '0x')),
        transparent: true,
        opacity: 0.9
      });
      const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
      segment.position.copy(point);
      segment.userData = reward;
      
      const ringGeometry = new THREE.RingGeometry(0.36, 0.42, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(point);
      ring.position.z = -0.01;
      
      group.add(ring);
      group.add(segment);

      createTextSprite(reward.emoji, point, group);
    });

    wheelRef.current = group;
    scene.add(group);
  };

  const createTextSprite = (text, position, group) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;
    
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
      opacity: 0.9
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.z = 0.1;
    sprite.scale.set(0.6, 0.6, 1);
    group.add(sprite);
  };

  const handleSpin = async () => {
    if (phase !== 'idle') return;

    setPhase('genesis');
    await performQuantumGenesis();
    await sleep(1500);

    setPhase('mobius');
    await performMobiusTransform();
    await sleep(2000);

    setPhase('fractal');
    await performFractalExpansion();
    await sleep(1500);

    setPhase('spinning');
    const selectedReward = await performQuantumSpin();
    await sleep(2000);

    setPhase('revealing');
    setShowParticleExplosion(true);
    setReward(selectedReward);
    await sleep(2000);

    setShowParticleExplosion(false);
    
    setTimeout(() => {
      setPhase('idle');
      setReward(null);
      onClose();
      if (onRewardClaimed) {
        onRewardClaimed(selectedReward);
      }
    }, 2000);
  };

  const performQuantumGenesis = () => {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve();
        return;
      }
      
      wheelRef.current.scale.set(0, 0, 0);
      const startTime = Date.now();
      const duration = 1500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 3);

        if (wheelRef.current) {
          wheelRef.current.scale.set(easing, easing, easing);
          wheelRef.current.rotation.z = easing * Math.PI * 2;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  };

  const performMobiusTransform = () => {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const duration = 2000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (wheelRef.current) {
          wheelRef.current.rotation.x = progress * Math.PI * 2;
          wheelRef.current.rotation.y = progress * Math.PI;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          wheelRef.current.rotation.x = 0;
          wheelRef.current.rotation.y = 0;
          resolve();
        }
      };
      animate();
    });
  };

  const performFractalExpansion = () => {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const duration = 1500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const pulse = Math.sin(progress * Math.PI * 4);

        if (wheelRef.current) {
          const scale = 1 + pulse * 0.15;
          wheelRef.current.scale.set(scale, scale, scale);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          wheelRef.current.scale.set(1, 1, 1);
          resolve();
        }
      };
      animate();
    });
  };

  const performQuantumSpin = () => {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve(REWARDS[0]);
        return;
      }

      const startTime = Date.now();
      const duration = 2000;
      const spins = 8;
      const targetRotation = spins * Math.PI * 2 + (Math.random() * Math.PI * 2);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 4);

        if (wheelRef.current) {
          wheelRef.current.rotation.z = easing * targetRotation;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          const selectedIndex = Math.floor(Math.random() * REWARDS.length);
          resolve(REWARDS[selectedIndex]);
        }
      };
      animate();
    });
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const shiftColor = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 255) + amount);
    const g = Math.min(255, ((num >> 8) & 255) + amount);
    const b = Math.min(255, (num & 255) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="quantum-wheel-overlay" onClick={onClose}>
      <div className="quantum-wheel-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2 className="wheel-title">
          <span className="infinity-symbol">∞</span> Infinity Wheel
        </h2>

        <div 
          ref={containerRef} 
          className={`wheel-3d-container phase-${phase}`}
          style={{ width: '100%', height: '400px', position: 'relative' }}
        />

        {phase === 'revealing' && reward && (
          <>
            {showParticleExplosion && (
              <div className="particle-explosion">
                {[...Array(30)].map((_, i) => (
                  <div 
                    key={i}
                    className="explosion-particle"
                    style={{
                      '--angle': `${(360 / 30) * i}deg`,
                      '--delay': `${i * 0.02}s`,
                      '--color': reward.color
                    }}
                  />
                ))}
              </div>
            )}

            <div className="reward-card holographic-card">
              <div className="shimmer-overlay"></div>
              <div className="scan-lines"></div>
              <div className="reward-glow" style={{ background: reward.color }}></div>
              
              <div className="reward-content">
                <div className="reward-emoji" style={{ color: reward.color }}>
                  {reward.emoji}
                </div>
                <h3 className="reward-title" style={{ 
                  background: `linear-gradient(135deg, ${reward.color} 0%, ${shiftColor(reward.color, 40)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {reward.label}
                </h3>
                <p className="reward-subtitle">Quantum Locked!</p>
                
                <div className="holographic-badge">
                  <div className="badge-glow" style={{ background: reward.color }}></div>
                  <span style={{ color: reward.color }}>+{reward.amount}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {phase === 'idle' && !reward && (
          <button className="quantum-spin-btn" onClick={handleSpin}>
            <span className="btn-text">ACTIVATE QUANTUM SPIN</span>
            <div className="quantum-ripple"></div>
            <div className="quantum-ripple" style={{ animationDelay: '0.5s' }}></div>
            <div className="quantum-ripple" style={{ animationDelay: '1s' }}></div>
          </button>
        )}

        <div className="math-particles">
          {['∞', 'π', '∫', '∂', '∑', 'Δ', 'φ', 'Ω'].map((symbol, i) => (
            <div 
              key={i} 
              className={`math-particle ${phase === 'spinning' ? 'active' : ''}`}
              style={{ 
                animationDelay: `${i * 0.4}s`,
                '--start-x': `${Math.random() * 100}%`,
                '--start-y': `${Math.random() * 100}%`
              }}
            >
              {symbol}
            </div>
          ))}
        </div>

        {(phase === 'spinning' || phase === 'fractal') && (
          <div className="probability-waves">
            <div className="probability-wave"></div>
            <div className="probability-wave" style={{ animationDelay: '0.4s' }}></div>
            <div className="probability-wave" style={{ animationDelay: '0.8s' }}></div>
          </div>
        )}

        <div className="phase-indicator" style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          color: 'rgba(255,255,255,0.3)',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          {phase.toUpperCase()}
        </div>
      </div>
    </div>
  );

  function createInfinityWheel(scene) {
    const group = new THREE.Group();

    const curve = new THREE.Curve();
    curve.getPoint = function(t) {
      const angle = t * Math.PI * 2;
      const scale = 2.2;
      const x = scale * Math.sin(angle) / (1 + Math.cos(angle) * Math.cos(angle));
      const y = scale * Math.sin(angle) * Math.cos(angle) / (1 + Math.cos(angle) * Math.cos(angle));
      return new THREE.Vector3(x, y, 0);
    };

    const points = curve.getPoints(150);
    
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      150,
      0.08,
      8,
      true
    );
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00D9FF,
      transparent: true,
      opacity: 0.8
    });
    const infinityTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    group.add(infinityTube);

    REWARDS.forEach((reward, index) => {
      const t = index / REWARDS.length;
      const point = curve.getPoint(t);
      
      const segmentGeometry = new THREE.CircleGeometry(0.35, 32);
      const segmentMaterial = new THREE.MeshBasicMaterial({
        color: parseInt(reward.color.replace('#', '0x')),
        transparent: true,
        opacity: 0.9
      });
      const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
      segment.position.copy(point);
      segment.userData = reward;
      
      const ringGeometry = new THREE.RingGeometry(0.36, 0.42, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(point);
      ring.position.z = -0.01;
      
      group.add(ring);
      group.add(segment);

      createTextSprite(reward.emoji, point, group);
    });

    wheelRef.current = group;
    scene.add(group);
  }

  function createTextSprite(text, position, group) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;
    
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
      opacity: 0.9
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.z = 0.1;
    sprite.scale.set(0.6, 0.6, 1);
    group.add(sprite);
  }

  function performQuantumGenesis() {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve();
        return;
      }
      
      wheelRef.current.scale.set(0, 0, 0);
      const startTime = Date.now();
      const duration = 1500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 3);

        if (wheelRef.current) {
          wheelRef.current.scale.set(easing, easing, easing);
          wheelRef.current.rotation.z = easing * Math.PI * 2;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      animate();
    });
  }

  function performMobiusTransform() {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const duration = 2000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (wheelRef.current) {
          wheelRef.current.rotation.x = progress * Math.PI * 2;
          wheelRef.current.rotation.y = progress * Math.PI;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          wheelRef.current.rotation.x = 0;
          wheelRef.current.rotation.y = 0;
          resolve();
        }
      };
      animate();
    });
  }

  function performFractalExpansion() {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const duration = 1500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const pulse = Math.sin(progress * Math.PI * 4);

        if (wheelRef.current) {
          const scale = 1 + pulse * 0.15;
          wheelRef.current.scale.set(scale, scale, scale);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          wheelRef.current.scale.set(1, 1, 1);
          resolve();
        }
      };
      animate();
    });
  }

  function performQuantumSpin() {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve(REWARDS[0]);
        return;
      }

      const startTime = Date.now();
      const duration = 2000;
      const spins = 8;
      const targetRotation = spins * Math.PI * 2 + (Math.random() * Math.PI * 2);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 4);

        if (wheelRef.current) {
          wheelRef.current.rotation.z = easing * targetRotation;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          const selectedIndex = Math.floor(Math.random() * REWARDS.length);
          resolve(REWARDS[selectedIndex]);
        }
      };
      animate();
    });
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
};

export default QuantumInfinityWheel;
