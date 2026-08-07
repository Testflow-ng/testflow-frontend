import apiClient from '../../api/client.js';

export const adminApi = {
  // Stats
  getStats: () => apiClient.get('/api/admin/stats').then((res) => res.data),

  // Students
  listStudents: (params) => apiClient.get('/api/admin/students', { params }).then((res) => res.data),
  createStudent: (payload) => apiClient.post('/api/admin/students', payload).then((res) => res.data.user),
  resetStudentPassword: (id, password) =>
    apiClient.patch(`/api/admin/students/${id}/reset-password`, { password }).then((res) => res.data),
  toggleStudentStatus: (id) =>
    apiClient.patch(`/api/admin/students/${id}/toggle-status`).then((res) => res.data.user),

  // Admin Roster (Super Admin)
  listAdmins: () => apiClient.get('/api/admin/roster').then((res) => res.data.admins),
  createAdmin: (payload) => apiClient.post('/api/admin/create', payload).then((res) => res.data.user),
  promoteAdmin: (email) => apiClient.post('/api/admin/promote', { email }).then((res) => res.data.user),
  demoteAdmin: (id) => apiClient.patch(`/api/admin/demote/${id}`).then((res) => res.data.user),
  deleteUser: (id) => apiClient.delete(`/api/admin/users/${id}`).then((res) => res.data),

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

  // Post-UTME Rankings
  getPostUtmeRankings: () => apiClient.get('/api/admin/post-utme/rankings').then((res) => res.data.rankings),

  // Global Settings
  getSettings: () => apiClient.get('/api/admin/settings').then((res) => res.data.settings),
  updateSettings: (payload) => apiClient.patch('/api/admin/settings', payload).then((res) => res.data.settings),
};
