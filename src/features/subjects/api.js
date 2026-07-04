import apiClient from '../../api/client.js';

export const subjectsApi = {
  list: () => apiClient.get('/api/subjects').then((res) => res.data.subjects),
};
