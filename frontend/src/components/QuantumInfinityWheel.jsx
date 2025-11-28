import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './QuantumInfinityWheel.css';

const QuantumInfinityWheel = ({ isOpen, onClose, onRewardClaimed }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const wheelRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle, genesis, mobius, fractal, spinning, revealing
  const [reward, setReward] = useState(null);
  const animationFrameRef = useRef(null);

  // REWARDS DATA
  const REWARDS = [
    { id: 1, type: 'boost', label: '2x Pulse³', color: '#00D9FF', amount: 2 },
    { id: 2, type: 'super_like', label: '5 Super Likes', color: '#A855F7', amount: 5 },
    { id: 3, type: 'star_coins', label: '100 Star Coins', color: '#FFD700', amount: 100 },
    { id: 4, type: 'aura', label: 'Exclusive Aura', color: '#EC4899', amount: 1 },
    { id: 5, type: 'boost', label: '1 Pulse³', color: '#667eea', amount: 1 },
    { id: 6, type: 'star_coins', label: '50 Star Coins', color: '#FFA500', amount: 50 },
  ];

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const size = Math.min(window.innerWidth - 40, 400);
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00D9FF, 1);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x667eea, 1);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Create Infinity Wheel (Möbius-inspired)
    createInfinityWheel(scene);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (wheelRef.current) {
        // Continuous subtle rotation
        wheelRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen]);

  // Create Möbius-inspired Infinity Wheel
  const createInfinityWheel = (scene) => {
    const group = new THREE.Group();

    // Create infinity symbol path
    const curve = new THREE.Curve();
    curve.getPoint = function(t) {
      const angle = t * Math.PI * 2;
      const scale = 2;
      const x = scale * Math.sin(angle) / (1 + Math.cos(angle) * Math.cos(angle));
      const y = scale * Math.sin(angle) * Math.cos(angle) / (1 + Math.cos(angle) * Math.cos(angle));
      return new THREE.Vector3(x, y, 0);
    };

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create glowing infinity line
    const material = new THREE.LineBasicMaterial({
      color: 0x00D9FF,
      linewidth: 3
    });
    const infinityLine = new THREE.Line(geometry, material);
    group.add(infinityLine);

    // Add segments as circles along the path
    REWARDS.forEach((reward, index) => {
      const t = index / REWARDS.length;
      const point = curve.getPoint(t);
      
      const segmentGeometry = new THREE.CircleGeometry(0.3, 32);
      const segmentMaterial = new THREE.MeshBasicMaterial({
        color: parseInt(reward.color.replace('#', '0x')),
        transparent: true,
        opacity: 0.8
      });
      const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
      segment.position.copy(point);
      segment.userData = reward;
      group.add(segment);

      // Add segment label
      createTextLabel(reward.label, point, group);
    });

    wheelRef.current = group;
    scene.add(group);
  };

  // Create text labels (simplified)
  const createTextLabel = (text, position, group) => {
    // Using sprites for text (simplified version)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'white';
    context.font = 'bold 20px Inter';
    context.textAlign = 'center';
    context.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.z = 0.5;
    sprite.scale.set(2, 0.5, 1);
    group.add(sprite);
  };

  // Start quantum spin animation
  const handleSpin = async () => {
    if (phase !== 'idle') return;

    // Phase 1: Quantum Genesis
    setPhase('genesis');
    await sleep(1500);

    // Phase 2: Möbius Transform
    setPhase('mobius');
    if (wheelRef.current) {
      animateMobius();
    }
    await sleep(2000);

    // Phase 3: Fractal Depth
    setPhase('fractal');
    await sleep(1500);

    // Phase 4: Quantum Spin
    setPhase('spinning');
    const selectedReward = await quantumSpin();
    await sleep(2000);

    // Phase 5: Collapse & Reveal
    setPhase('revealing');
    setReward(selectedReward);
    await sleep(1500);

    // Return to idle
    setPhase('idle');
    
    if (onRewardClaimed) {
      onRewardClaimed(selectedReward);
    }
  };

  const animateMobius = () => {
    if (!wheelRef.current) return;
    
    const startTime = Date.now();
    const duration = 2000;

    const rotateMobius = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (wheelRef.current) {
        wheelRef.current.rotation.x = progress * Math.PI * 2;
        wheelRef.current.rotation.y = progress * Math.PI;
      }

      if (progress < 1) {
        requestAnimationFrame(rotateMobius);
      }
    };
    rotateMobius();
  };

  const quantumSpin = () => {
    return new Promise((resolve) => {
      if (!wheelRef.current) {
        resolve(REWARDS[0]);
        return;
      }

      const startTime = Date.now();
      const duration = 2000;
      const targetRotation = Math.PI * 8 + (Math.random() * Math.PI * 2);

      const spinWheel = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 3);

        if (wheelRef.current) {
          wheelRef.current.rotation.z = easing * targetRotation;
        }

        if (progress < 1) {
          requestAnimationFrame(spinWheel);
        } else {
          // Select random reward
          const selectedReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
          resolve(selectedReward);
        }
      };
      spinWheel();
    });
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
          <div className="reward-card holographic">
            <div className="reward-glow" style={{ background: reward.color }}></div>
            <div className="reward-content">
              <h3 style={{ color: reward.color }}>{reward.label}</h3>
              <p>Claimed!</p>
            </div>
          </div>
        )}

        {phase === 'idle' && !reward && (
          <button className="quantum-spin-btn" onClick={handleSpin}>
            <span className="btn-text">ACTIVATE QUANTUM SPIN</span>
            <div className="quantum-ripple"></div>
          </button>
        )}

        {/* Mathematical particle overlays */}
        <div className="math-particles">
          {['∞', 'π', '∫', '∂', '∑', 'Δ'].map((symbol, i) => (
            <div 
              key={i} 
              className="math-particle" 
              style={{ 
                animationDelay: `${i * 0.3}s`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Quantum probability waves */}
        {phase === 'spinning' && (
          <div className="probability-waves">
            <div className="probability-wave"></div>
            <div className="probability-wave" style={{ animationDelay: '0.3s' }}></div>
            <div className="probability-wave" style={{ animationDelay: '0.6s' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantumInfinityWheel;
