import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDC8IhBsprrgV92YOeE4AxUghZc6kzPlWc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'testflow-9bda9.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'testflow-9bda9',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'testflow-9bda9.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '941643491660',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:941643491660:web:c3b4f91ac453f54a7007e9',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-NMMYCP4GR5',
};

export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BJjWvW59DuuIx_smx4xPSyOEtEXruIJgBxGhhG8da0IipLBUZvHD3YLW13H5-v0QC1RRoogfSSbwsW19Zy22TsQ';

export const getFirebaseApp = () => {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
};

export const getFirebaseMessaging = async () => {
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  const app = getFirebaseApp();
  return getMessaging(app);
};
