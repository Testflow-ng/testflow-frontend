import apiClient from '../../api/client.js';

export const authApi = {
  me: () => apiClient.get('/api/auth/me').then((res) => res.data.user),
  login: (payload) => apiClient.post('/api/auth/login', payload).then((res) => res.data.user),
  register: (payload) => apiClient.post('/api/auth/register', payload).then((res) => res.data.user),
  logout: () => apiClient.post('/api/auth/logout'),
  setUsername: (username) =>
    apiClient.patch('/api/auth/username', { username }).then((res) => res.data.user),
  updateProfile: (payload) =>
    apiClient.patch('/api/auth/profile', payload).then((res) => res.data.user),
  changePassword: (payload) =>
    apiClient.post('/api/auth/change-password', payload).then((res) => res.data),
};
