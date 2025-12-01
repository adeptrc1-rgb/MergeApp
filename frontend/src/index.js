import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import "@/styles/zodiacAnimations.css";
import "@/styles/premiumSkins.css";
import App from "@/App";

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
