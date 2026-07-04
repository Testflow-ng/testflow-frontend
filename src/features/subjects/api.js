import apiClient from '../../api/client.js';

export const subjectsApi = {
  list: () => apiClient.get('/api/subjects').then((res) => res.data.subjects),
  topics: (code) => apiClient.get(`/api/subjects/${code}/topics`).then((res) => res.data.topics),
};
