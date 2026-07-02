import apiClient from '../../api/client.js';

export const authApi = {
  me: () => apiClient.get('/api/auth/me').then((res) => res.data.user),
  login: (payload) => apiClient.post('/api/auth/login', payload).then((res) => res.data.user),
  register: (payload) => apiClient.post('/api/auth/register', payload).then((res) => res.data.user),
  logout: () => apiClient.post('/api/auth/logout'),
  forgotPassword: (payload) =>
    apiClient.post('/api/auth/forgot-password', payload).then((res) => res.data),
  resetPassword: (payload) =>
    apiClient.post('/api/auth/reset-password', payload).then((res) => res.data),
  verifyEmail: (token) => apiClient.post('/api/auth/verify-email', { token }).then((res) => res.data),
  resendVerification: (payload) =>
    apiClient.post('/api/auth/resend-verification', payload).then((res) => res.data),
};
