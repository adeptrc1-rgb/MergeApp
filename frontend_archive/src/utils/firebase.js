/**
 * Firebase Configuration and Messaging Setup (robust + mobile-safe)
 * Handles push notification registration and token management
 */

import { initializeApp } from 'firebase/app';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// VAPID Key for push notifications
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

// Initialize Firebase once
const app = initializeApp(firebaseConfig);

// Lazily resolve Messaging only on supported browsers to avoid runtime errors
async function resolveMessaging() {
  try {
    // Dynamically import messaging only when needed
    const messagingMod = await import('firebase/messaging');
    const supported = await messagingMod.isSupported();
    if (!supported) {
      console.warn('⚠️ Firebase Messaging not supported in this browser');
      return null;
    }
    const messaging = messagingMod.getMessaging(app);
    return { messaging, getToken: messagingMod.getToken, onMessage: messagingMod.onMessage };
  } catch (error) {
    console.warn('⚠️ Unable to initialize Firebase Messaging:', error);
    return null;
  }
}

/**
 * Heuristic check for Web Push support (synchronous)
 * Note: Actual support is verified again in resolveMessaging()
 */
export function isNotificationSupported() {
  try {
    const hasBasics = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    const isSecure = window.isSecureContext === true; // required for push
    return hasBasics && isSecure;
  } catch {
    return false;
  }
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if failed/unsupported
 */
export async function requestNotificationPermission() {
  // Ensure messaging is available first
  const bundle = await resolveMessaging();
  if (!bundle) return null;

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return null;
    }

    // Ensure service worker is registered for messaging
    let swReg = null;
    if ('serviceWorker' in navigator) {
      try {
        // Reuse existing registration if available, else register
        swReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        if (!swReg) {
          swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }
      } catch (e) {
        console.warn('⚠️ Service worker registration failed for messaging:', e);
      }
    }

    // Get FCM token
    const token = await bundle.getToken(bundle.messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg || (await navigator.serviceWorker.ready).catch(() => undefined)
    });

    if (token) {
      console.log('✅ FCM Token obtained');
      return token;
    }
    console.warn('⚠️ No FCM token available');
    return null;
  } catch (error) {
    console.error('❌ Error getting notification permission/token:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 * @param {Function} callback - Function to call when message received
 */
export async function onForegroundMessage(callback) {
  const bundle = await resolveMessaging();
  if (!bundle) return () => {};
  return bundle.onMessage(bundle.messaging, (payload) => {
    console.log('📬 Message received in foreground:', payload);
    try { callback(payload); } catch {}
  });
}

/**
 * Check current notification permission status
 * @returns {string} 'granted' | 'denied' | 'default'
 */
export function getNotificationPermission() {
  if (typeof Notification !== 'undefined') {
    return Notification.permission;
  }
  return 'default';
}

// No default export; keep named API
export { app };
