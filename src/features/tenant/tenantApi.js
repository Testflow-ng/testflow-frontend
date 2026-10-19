import apiClient from '../../api/client.js';

// The API lives on another origin, so the tenant's address is sent explicitly. Everything here is scoped by it on the server.
let host = '';
export const setTenantHost = (h) => { host = h; };
const cfg = () => ({ headers: { 'X-Tenant-Host': host } });

/** The organisation's public face and its students' account calls. See backend/docs/frontend/EVERYONE_REQUIREMENTS.md section 7. */
export const tenantApi = {
  site: () => apiClient.get('/api/v1/public/site', cfg()).then((r) => r.data),
  me: () => apiClient.get('/api/v1/public/auth/me', cfg()).then((r) => r.data.user),
  login: (body) => apiClient.post('/api/v1/public/auth/login', body, cfg()).then((r) => r.data.user),
  register: (body) => apiClient.post('/api/v1/public/auth/register', body, cfg()).then((r) => r.data.user),
  logout: () => apiClient.post('/api/v1/public/auth/logout', {}, cfg()).then((r) => r.data),
  announcements: () => apiClient.get('/api/v1/public/announcements', cfg()).then((r) => r.data.items ?? r.data),
  results: () => apiClient.get('/api/v1/public/results', cfg()).then((r) => r.data.items ?? r.data),
  result: (id) => apiClient.get(`/api/v1/public/results/${id}`, cfg()).then((r) => r.data),
  flagQuestion: (questionId, body) => apiClient.post(`/api/v1/public/questions/${questionId}/flag`, body, cfg()).then((r) => r.data),
  exams: () => apiClient.get('/api/v1/public/exams', cfg()).then((r) => r.data.items ?? r.data),
};
