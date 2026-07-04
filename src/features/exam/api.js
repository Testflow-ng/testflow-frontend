import apiClient from '../../api/client.js';

export const examApi = {
  start: (payload) => apiClient.post('/api/exam-sessions', payload).then((res) => res.data.session),
  get: (id) => apiClient.get(`/api/exam-sessions/${id}`).then((res) => res.data.session),
  saveAnswer: (id, payload) =>
    apiClient.patch(`/api/exam-sessions/${id}/answer`, payload).then((res) => res.data.answer),
  recordStrike: (id) =>
    apiClient.post(`/api/exam-sessions/${id}/strike`).then((res) => res.data.result),
  submit: (id) => apiClient.post(`/api/exam-sessions/${id}/submit`).then((res) => res.data.result),
  result: (id) => apiClient.get(`/api/exam-sessions/${id}/result`).then((res) => res.data.result),
  history: () => apiClient.get('/api/exam-sessions').then((res) => res.data.sessions),
};
