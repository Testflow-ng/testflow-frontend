import apiClient from './client.js';

export const publicApi = {
  getStats: () => apiClient.get('/api/public/stats').then((res) => res.data),
};
