// TestFlow Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDC8IhBsprrgV92YOeE4AxUghZc6kzPlWc',
  authDomain: 'testflow-9bda9.firebaseapp.com',
  projectId: 'testflow-9bda9',
  storageBucket: 'testflow-9bda9.firebasestorage.app',
  messagingSenderId: '941643491660',
  appId: '1:941643491660:web:c3b4f91ac453f54a7007e9',
  measurementId: 'G-NMMYCP4GR5',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'TestFlow';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || '/favicons/favicon-192x192.png',
    badge: '/favicons/favicon-32x32.png',
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/',
    },
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'testflow-notification',
    renotify: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
