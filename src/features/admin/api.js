import apiClient from '../../api/client.js';

export const adminApi = {
  // Stats
  getStats: () => apiClient.get('/api/admin/stats').then((res) => res.data),

  // Questions
  listQuestions: (params) => apiClient.get('/api/questions', { params }).then((res) => res.data),
  getQuestion: (id) => apiClient.get(`/api/questions/${id}`).then((res) => res.data.question),
  createQuestion: (data) => apiClient.post('/api/questions', data).then((res) => res.data.question),
  bulkCreateQuestions: (data) => apiClient.post('/api/questions/bulk', data).then((res) => res.data),
  updateQuestion: (id, data) =>
    apiClient.patch(`/api/questions/${id}`, data).then((res) => res.data.question),
  deleteQuestion: (id) => apiClient.delete(`/api/questions/${id}`).then((res) => res.data),

  // Subjects
  createSubject: (data) => apiClient.post('/api/subjects', data).then((res) => res.data.subject),
  updateSubject: (id, data) =>
    apiClient.patch(`/api/subjects/${id}`, data).then((res) => res.data.subject),
  deleteSubject: (id) => apiClient.delete(`/api/subjects/${id}`).then((res) => res.data),
};
