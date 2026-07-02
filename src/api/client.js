import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Shared Axios instance for the TestFlow API.
 * - withCredentials so httpOnly auth cookies flow to the server.
 * - On a 401, transparently attempts a single token refresh (de-duplicated
 *   across concurrent requests) and retries the original request once.
 * - Rejects with a normalized error shape `{ status, code, message, data }`.
 */
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const normalizeError = (error) => ({
  status: error.response?.status ?? 0,
  code: error.response?.data?.error?.code ?? 'NETWORK_ERROR',
  message:
    error.response?.data?.error?.message ??
    error.message ??
    'Something went wrong. Please try again.',
  data: error.response?.data ?? null,
});

// Endpoints that must never trigger the refresh-and-retry loop.
const isAuthFlowUrl = (url = '') =>
  url.includes('/api/auth/refresh') ||
  url.includes('/api/auth/login') ||
  url.includes('/api/auth/register');

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !isAuthFlowUrl(original.url)) {
      original._retry = true;
      try {
        // De-duplicate concurrent refreshes into a single in-flight request.
        refreshPromise = refreshPromise ?? apiClient.post('/api/auth/refresh');
        await refreshPromise;
        return apiClient(original);
      } catch {
        // Refresh failed — fall through to the normalized rejection below.
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export default apiClient;
