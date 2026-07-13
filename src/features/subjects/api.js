import apiClient from '../../api/client.js';

export const subjectsApi = {
  list: () => apiClient.get('/api/subjects').then((res) => res.data.subjects),
  togglePin: (id) => apiClient.post(`/api/subjects/${id}/pin`).then((res) => res.data),
  leaderboard: (id) => apiClient.get(`/api/subjects/${id}/leaderboard`).then((res) => res.data.leaderboard),
};
