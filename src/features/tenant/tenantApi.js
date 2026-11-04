import apiClient from '../../api/client.js';

// The API lives on another origin, so the tenant's address is sent explicitly. Everything here is scoped by it on the server.
let host = '';
export const setTenantHost = (h) => { host = h; };
const readCookie = (name) => document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);
// The site has its own session (and CSRF token), separate from Testflow's.
const cfg = () => {
  const csrf = readCookie('tfo_csrf');
  return { headers: { 'X-Tenant-Host': host, ...(csrf ? { 'X-CSRF-Token': decodeURIComponent(csrf) } : {}) } };
};

/** The organisation's public face and its students' account calls. See backend/docs/frontend/EVERYONE_REQUIREMENTS.md section 7. */
export const tenantApi = {
  site: () => apiClient.get('/api/v1/public/site', cfg()).then((r) => r.data),
  me: () => apiClient.get('/api/v1/public/auth/me', cfg()).then((r) => r.data.user),
  register: (body) => apiClient.post('/api/v1/public/auth/register', body, cfg()).then((r) => r.data.user),
  googleComplete: (code) => apiClient.post('/api/v1/public/auth/google/complete', { code }, cfg()).then((r) => r.data.user),
  testflowComplete: (body) => apiClient.post('/api/v1/public/auth/testflow/complete', body, cfg()).then((r) => r.data.user),
  login: (body) => apiClient.post('/api/v1/public/auth/login', body, cfg()).then((r) => r.data.user),
  logout: () => apiClient.post('/api/v1/public/auth/logout', {}, cfg()).then((r) => r.data),
  announcements: () => apiClient.get('/api/v1/public/announcements', cfg()).then((r) => r.data.items ?? r.data),
  results: () => apiClient.get('/api/v1/public/results', cfg()).then((r) => r.data.items ?? r.data),
  result: (id) => apiClient.get(`/api/v1/public/results/${id}`, cfg()).then((r) => r.data),
  flagQuestion: (questionId, body) => apiClient.post(`/api/v1/public/questions/${questionId}/flag`, body, cfg()).then((r) => r.data),
  startExam: (id, body = {}) => apiClient.post(`/api/v1/public/exams/${id}/start`, body, cfg()).then((r) => r.data.attempt),
  saveAnswer: (attemptId, body) => apiClient.patch(`/api/v1/public/attempts/${attemptId}/answers`, body, cfg()).then((r) => r.data),
  submit: (attemptId) => apiClient.post(`/api/v1/public/attempts/${attemptId}/submit`, {}, cfg()).then((r) => r.data.result),
  checkout: (examId, idempotencyKey) => apiClient.post(`/api/v1/public/exams/${examId}/checkout`, { idempotencyKey }, cfg()).then((r) => r.data),
  verifyPayment: (reference) => apiClient.get('/api/v1/public/payments/verify', { ...cfg(), params: { reference } }).then((r) => r.data),
  exams: () => apiClient.get('/api/v1/public/exams', cfg()).then((r) => r.data.items ?? r.data),
};
