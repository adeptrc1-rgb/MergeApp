import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import "@/styles/zodiacAnimations.css";
import "@/styles/premiumSkins.css";
import App from "@/App";

// JS VIEWPORT VARIABLE TECHNIQUE - Fix 100vh issues on mobile
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // Also set safe area insets
  const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px';
  console.log('📐 Viewport height updated:', window.innerHeight, 'px');
};

// Set on load
setViewportHeight();

// Update on resize (handles orientation changes)
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ PWA Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('💫 PWA install prompt ready');
});

window.addEventListener('appinstalled', () => {
  console.log('✅ Merge PWA installed successfully!');
  deferredPrompt = null;
});
