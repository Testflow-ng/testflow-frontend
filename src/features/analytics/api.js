import apiClient from '../../api/client.js';

export const analyticsApi = {
  stats: () => apiClient.get('/api/exam-sessions/stats').then((res) => res.data.stats),
};
