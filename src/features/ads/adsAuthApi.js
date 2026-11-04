import apiClient from '../../api/client.js';

// Advertiser auth (backend/docs/ads/IMPLEMENTATION.md). Same cookies as the
// student app; logout and refresh are shared (/api/auth/logout, /api/auth/refresh).
export const adsAuthApi = {
  register: (payload) => apiClient.post('/api/ads/auth/register', payload).then((res) => res.data),
  login: (payload) => apiClient.post('/api/ads/auth/login', payload).then((res) => res.data),
  me: () => apiClient.get('/api/ads/auth/me').then((res) => res.data),
};
