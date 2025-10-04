// Particle Effects Utility for Cosmic Animations

export const createStarburstEffect = (x, y, container = document.body) => {
  const particleCount = 12;
  const colors = ['#f9a8d4', '#fbbf24', '#ddd6fe', '#c4b5fd'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle starburst-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.background = `radial-gradient(circle, ${colors[i % colors.length]}, transparent)`;
    particle.style.animationDelay = `${i * 0.02}s`;
    
    const angle = (360 / particleCount) * i;
    const distance = 30 + Math.random() * 20;
    particle.style.setProperty('--angle', `${angle}deg`);
    particle.style.setProperty('--distance', `${distance}px`);
    
    container.appendChild(particle);
    
    setTimeout(() => particle.remove(), 500);
  }
};

export const createSparkleTrail = (x, y, container = document.body) => {
  const sparkleCount = 8;
  
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'particle sparkle-particle';
    sparkle.style.left = `${x + (Math.random() - 0.5) * 40}px`;
    sparkle.style.top = `${y + (Math.random() - 0.5) * 40}px`;
    sparkle.style.animationDelay = `${i * 0.05}s`;
    
    container.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 400);
  }
};

export const createShootingStar = (x, y, direction = 'left', container = document.body) => {
  const star = document.createElement('div');
  star.className = 'particle shooting-star-particle';
  star.style.left = `${x}px`;
  star.style.top = `${y}px`;
  
  if (direction === 'left') {
    star.style.transform = 'rotate(-45deg)';
  } else {
    star.style.transform = 'rotate(45deg)';
  }
  
  container.appendChild(star);
  
  setTimeout(() => star.remove(), 300);
};

export const createHeartBurst = (x, y, container = document.body) => {
  const heartCount = 10;
  const hearts = ['💖', '💕', '✨', '💫', '⭐'];
  
  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement('div');
    heart.className = 'particle heart-particle';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = `${x + (Math.random() - 0.5) * 100}px`;
    heart.style.top = `${y}px`;
    heart.style.animationDelay = `${i * 0.05}s`;
    
    container.appendChild(heart);
    
    setTimeout(() => heart.remove(), 500);
  }
};

export const createStardustTrail = (x, y, count = 15, container = document.body) => {
  for (let i = 0; i < count; i++) {
    const dust = document.createElement('div');
    dust.className = 'particle stardust-particle';
    dust.style.left = `${x + (Math.random() - 0.5) * 60}px`;
    dust.style.top = `${y + (Math.random() - 0.5) * 60}px`;
    dust.style.animationDelay = `${i * 0.03}s`;
    
    container.appendChild(dust);
    
    setTimeout(() => dust.remove(), 500);
  }
};

export const createFloatingSign = (buttonElement) => {
  const rect = buttonElement.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  const sign = document.createElement('div');
  sign.className = 'particle float-up-particle';
  sign.innerHTML = '✨';
  sign.style.left = `${x}px`;
  sign.style.top = `${y}px`;
  sign.style.fontSize = '24px';
  sign.style.zIndex = '10000';
  
  document.body.appendChild(sign);
  
  setTimeout(() => sign.remove(), 500);
};

export const createMatchAnimation = (user1Avatar, user2Avatar) => {
  const overlay = document.createElement('div');
  overlay.className = 'match-animation';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  
  // Get avatar positions
  const rect1 = user1Avatar?.getBoundingClientRect();
  const rect2 = user2Avatar?.getBoundingClientRect();
  
  if (rect1 && rect2) {
    line.setAttribute('class', 'constellation-line');
    line.setAttribute('x1', `${rect1.left + rect1.width / 2}`);
    line.setAttribute('y1', `${rect1.top + rect1.height / 2}`);
    line.setAttribute('x2', `${rect2.left + rect2.width / 2}`);
    line.setAttribute('y2', `${rect2.top + rect2.height / 2}`);
    
    svg.appendChild(line);
  }
  
  overlay.appendChild(svg);
  document.body.appendChild(overlay);
  
  // Create heart burst in center
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  createHeartBurst(centerX, centerY, overlay);
  createStardustTrail(centerX, centerY, 30, overlay);
  
  setTimeout(() => overlay.remove(), 1000);
};

export const createMessageSentEffect = (messageElement) => {
  if (!messageElement) return;
  
  const rect = messageElement.getBoundingClientRect();
  const x = rect.right;
  const y = rect.top + rect.height / 2;
  
  createStardustTrail(x, y, 8);
};

export const createMessageReceivedEffect = (messageElement) => {
  if (!messageElement) return;
  
  messageElement.classList.add('gentle-pulse');
  
  const rect = messageElement.getBoundingClientRect();
  const x = rect.left;
  const y = rect.top + rect.height / 2;
  
  // Create floating stars
  for (let i = 0; i < 5; i++) {
    const star = document.createElement('div');
    star.className = 'particle stardust-particle';
    star.style.left = `${x + (Math.random() - 0.5) * 30}px`;
    star.style.top = `${y}px`;
    star.style.animationDelay = `${i * 0.1}s`;
    
    document.body.appendChild(star);
    
    setTimeout(() => star.remove(), 500);
  }
  
  setTimeout(() => {
    messageElement.classList.remove('gentle-pulse');
  }, 1500);
};

export const createDailyRewardPulse = (element) => {
  if (!element) return;
  
  element.classList.add('cosmic-pulse-icon');
  
  setTimeout(() => {
    element.classList.remove('cosmic-pulse-icon');
  }, 2000);
};

export const createAchievementSparkle = (x, y) => {
  createStarburstEffect(x, y);
  createSparkleTrail(x, y);
  
  setTimeout(() => {
    createShootingStar(x, y, 'left');
  }, 200);
};
