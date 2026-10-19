import apiClient from '../../api/client.js';

const base = (code) => `/api/live-cbt/${code}`;
const data = (key) => (res) => res.data[key] ?? res.data;

export const liveApi = {
  create: (payload) => apiClient.post('/api/live-cbt', payload).then(data('exam')),
  membership: (code) => apiClient.get(base(code)).then(data('room')),
  hostRoom: (code) => apiClient.get(`${base(code)}/host`).then(data('room')),
  join: (code) => apiClient.post(`${base(code)}/join`).then((res) => res.data),
  approve: (code, userId) => apiClient.post(`${base(code)}/approve`, { userId }).then((res) => res.data),
  reject: (code, userId) => apiClient.post(`${base(code)}/reject`, { userId }).then((res) => res.data),
  approveAll: (code) => apiClient.post(`${base(code)}/approve-all`).then((res) => res.data),
  start: (code) => apiClient.post(`${base(code)}/start`).then(data('exam')),
  end: (code) => apiClient.post(`${base(code)}/end`).then(data('exam')),
  publish: (code) => apiClient.post(`${base(code)}/publish`).then(data('exam')),
  cancel: (code) => apiClient.post(`${base(code)}/cancel`).then(data('exam')),
  questions: (code) => apiClient.get(`${base(code)}/questions`).then(data('exam')),
  saveAnswer: (code, payload) => apiClient.patch(`${base(code)}/answer`, payload).then(data('answer')),
  submit: (code, answers) => apiClient.post(`${base(code)}/submit`, { answers }).then(data('result')),
  result: (code) => apiClient.get(`${base(code)}/result`).then(data('result')),
  participantResult: (code, userId) => apiClient.get(`${base(code)}/participants/${userId}/result`).then(data('result')),
  dashboard: (code) => apiClient.get(`${base(code)}/dashboard`).then(data('dashboard')),
};

/** CSV export needs the session cookie, so fetch it as a blob and save it. */
export async function downloadCsv(code) {
  const res = await apiClient.get(`/api/live-cbt/${code}/export.csv`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `live-cbt-${code}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
