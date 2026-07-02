import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Shared Axios instance for the TestFlow API.
 * - withCredentials so httpOnly auth cookies flow to the server.
 * - Response interceptor normalizes errors to a predictable shape for the UI.
 */
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      status: error.response?.status ?? 0,
      message:
        error.response?.data?.message ??
        error.message ??
        'Something went wrong. Please try again.',
      data: error.response?.data ?? null,
    };
    return Promise.reject(normalized);
  },
);

export default apiClient;
