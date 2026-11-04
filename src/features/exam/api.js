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
  /* Mints (or returns) the public share link for this attempt. The link is served by the
     backend because the preview card is built from Open Graph tags, and WhatsApp, Telegram
     and X read those without running any JavaScript. */
  share: (id) => apiClient.post(`/api/exam-sessions/${id}/share`).then((res) => res.data.share),
  history: () => apiClient.get('/api/exam-sessions').then((res) => res.data.sessions),
};

/**
 * Report a problem with a question.
 *
 * Nothing to do with the paper's own "mark for review": that is the student's private note to
 * come back to during the sitting. This tells the admins the *question* is broken, and lands
 * in a review queue they work through.
 */
export const flagQuestion = (questionId, payload) =>
  apiClient.post(`/api/questions/${questionId}/flag`, payload).then((res) => res.data.flag);
