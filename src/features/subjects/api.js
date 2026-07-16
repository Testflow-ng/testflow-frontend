import apiClient from '../../api/client.js';

export const subjectsApi = {
  list: (params) => apiClient.get('/api/subjects', { params }).then((res) => res.data.subjects),
  togglePin: (id) => apiClient.post(`/api/subjects/${id}/pin`).then((res) => res.data),
  leaderboard: (id) => apiClient.get(`/api/subjects/${id}/leaderboard`).then((res) => res.data.leaderboard),
  topics: (id) => apiClient.get(`/api/subjects/${id}/topics`).then((res) => res.data.topics),
};
