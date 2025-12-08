import React, { useState, useEffect } from 'react';
import './PulseCubedHeader.css';

const PulseCubedHeader = ({ onActivate }) => {
  const [pulseBoosts, setPulseBoosts] = useState(1);
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseTimeLeft, setPulseTimeLeft] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('pulseCubedState');
    if (savedState) {
      const { pulseBoosts, isPulsing, pulseTimeLeft, cooldownTime, lastUpdate } = JSON.parse(savedState);
      const now = Math.floor(Date.now() / 1000);
      const timePassed = now - lastUpdate;

      if (isPulsing && pulseTimeLeft > 0) {
        const newPulseTime = Math.max(0, pulseTimeLeft - timePassed);
        if (newPulseTime > 0) {
          setIsPulsing(true);
          setPulseTimeLeft(newPulseTime);
        } else {
          // Pulse³ ended while app was closed
          setIsPulsing(false);
          setCooldownTime(Math.max(0, 86400 - timePassed)); // 24h cooldown
        }
      } else if (cooldownTime > 0) {
        const newCooldown = Math.max(0, cooldownTime - timePassed);
        if (newCooldown > 0) {
          setCooldownTime(newCooldown);
        } else {
          setPulseBoosts(1);
          setCooldownTime(0);
        }
      } else {
        setPulseBoosts(pulseBoosts);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      pulseBoosts,
      isPulsing,
      pulseTimeLeft,
      cooldownTime,
      lastUpdate: Math.floor(Date.now() / 1000)
    };
    localStorage.setItem('pulseCubedState', JSON.stringify(state));
  }, [pulseBoosts, isPulsing, pulseTimeLeft, cooldownTime]);

  // Pulse³ countdown timer
  useEffect(() => {
    if (!isPulsing || pulseTimeLeft <= 0) return;

    const pulseTimer = setInterval(() => {
      setPulseTimeLeft(prev => {
        if (prev <= 1) {
          setIsPulsing(false);
          startCooldown(86400); // 24-hour cooldown
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(pulseTimer);
  }, [isPulsing, pulseTimeLeft]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownTime <= 0) return;

    const cooldownTimer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          setPulseBoosts(1); // Reset free Pulse³
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cooldownTimer);
  }, [cooldownTime]);

  // Handle Pulse³ activation
  const handlePulseClick = () => {
    if (pulseBoosts <= 0 || isPulsing) return;

    // Start Pulse³ boost
    setIsPulsing(true);
    setPulseTimeLeft(1800); // 30 minutes in seconds
    setPulseBoosts(0);

    // Call parent callback if provided
    if (onActivate) {
      onActivate();
    }
  };

  // Start cooldown period
  const startCooldown = (seconds) => {
    setCooldownTime(seconds);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  // Calculate button state
  const isButtonDisabled = pulseBoosts <= 0 && !isPulsing;
  const buttonClass = `pulse-cubed-btn ${isPulsing ? 'pulsing' : ''} ${isButtonDisabled ? 'cooldown' : ''}`;

  return (
    <button
      className={buttonClass}
      onClick={handlePulseClick}
      disabled={isButtonDisabled}
      title="Pulse³ - Exponential profile boost"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="pulse-text">Pulse³</span>
      {pulseBoosts > 0 && !isPulsing && (
        <div className="pulse-counter">{pulseBoosts}</div>
      )}
      
      {isPulsing ? (
        <div className="pulse-duration">{formatTime(pulseTimeLeft)}</div>
      ) : cooldownTime > 0 ? (
        <div className="cooldown-timer">{formatTime(cooldownTime)}</div>
      ) : null}
    </button>
  );
};

export default PulseCubedHeader;
