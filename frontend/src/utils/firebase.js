/**
 * Firebase Configuration and Messaging Setup
 * Handles push notification registration and token management
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let messaging = null;

// Initialize messaging (only in supported browsers)
try {
  messaging = getMessaging(app);
  console.log('✅ Firebase Messaging initialized');
} catch (error) {
  console.warn('⚠️ Firebase Messaging not supported in this browser:', error);
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn('Messaging not supported');
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        console.log('✅ FCM Token obtained:', token);
        return token;
      } else {
        console.warn('⚠️ No FCM token available');
        return null;
      }
    } else {
      console.warn('⚠️ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 * @param {Function} callback - Function to call when message received
 */
export function onForegroundMessage(callback) {
  if (!messaging) {
    console.warn('Messaging not supported');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('📬 Message received in foreground:', payload);
    callback(payload);
  });
}

/**
 * Check if notifications are supported
 * @returns {boolean}
 */
export function isNotificationSupported() {
  return 'Notification' in window && messaging !== null;
}

/**
 * Check current notification permission status
 * @returns {string} 'granted' | 'denied' | 'default'
 */
export function getNotificationPermission() {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'default';
}

export { messaging };
