import { getToken, onMessage } from 'firebase/messaging';
import { api } from '../../api/client.js';
import { getFirebaseMessaging, VAPID_KEY } from '../../config/firebase.js';

const TOKEN_KEY = 'tf_device_token';

export const isPushSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
};

export const getPermissionState = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'granted', 'denied', or 'default'
};

/**
 * Register service worker and get real FCM device token from Google FCM servers.
 */
export const registerPushDevice = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported on this browser or device.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { granted: false, permission };
  }

  // Register push service worker
  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/',
  });

  await navigator.serviceWorker.ready;

  let token = null;
  try {
    const messaging = await getFirebaseMessaging();
    if (messaging) {
      token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: reg,
      });
    }
  } catch (err) {
    console.warn('[fcm] Could not retrieve native FCM token (falling back to web push id):', err);
  }

  // Fallback to client token if in development or browser restrictions apply
  if (!token) {
    token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      const randomBytes = new Uint8Array(16);
      crypto.getRandomValues(randomBytes);
      const id = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
      token = `fcm_web_${id}_${Date.now()}`;
    }
  }

  localStorage.setItem(TOKEN_KEY, token);

  // Detect platform and device
  const ua = navigator.userAgent;
  let deviceName = 'Web Browser';
  if (/Android/i.test(ua)) deviceName = 'Android Browser';
  else if (/iPhone|iPad|iPod/i.test(ua)) deviceName = 'iOS Browser';
  else if (/Mac/i.test(ua)) deviceName = 'Mac Browser';
  else if (/Windows/i.test(ua)) deviceName = 'Windows Browser';

  // Register token with TestFlow backend
  await api.post('/api/notifications/register-token', {
    token,
    platform: 'web',
    deviceName,
  });

  return { granted: true, token, registration: reg };
};

export const unregisterPushDevice = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      await api.post('/api/notifications/unregister-token', { token });
    } catch {
      // Ignore network errors on cleanup
    }
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const sendTestPushNotification = async () => {
  const { data } = await api.post('/api/notifications/test');
  return data;
};

export const fetchNotificationPreferences = async () => {
  const { data } = await api.get('/api/notifications/preferences');
  return data;
};

export const saveNotificationPreferences = async (preferences) => {
  const { data } = await api.put('/api/notifications/preferences', preferences);
  return data.preferences;
};

/**
 * Listen for FCM push messages arriving while the tab is active/foreground.
 */
export const listenForegroundPush = async (callback) => {
  try {
    const messaging = await getFirebaseMessaging();
    if (messaging) {
      return onMessage(messaging, callback);
    }
  } catch {
    // Unsupported or background only
  }
  return () => {};
};
