import axios from 'axios';

// The API origin is deliberately configured at build time rather than tied to
// a hosting provider. Use HTTPS for production and configure CORS/cookies on
// the backend for this frontend's origin.
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');

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

// The identity service issues a readable `tf_csrf` cookie; unsafe requests must echo it in X-CSRF-Token.
// Local design work: answer API calls from sample data (src/dev/mockData.js) instead of a backend.
//
// The sampler is a dynamic import, so put it on the request itself before it is
// dispatched. Without this the app's opening queries race the import, resolve
// their adapter early, and go out to the real backend .which is usually not
// running during design work.
let mockReady;
if (import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
  mockReady = import('../dev/mockApi.js')
    .then(({ mockAdapter }) => {
      apiClient.defaults.adapter = mockAdapter;
      return mockAdapter;
    })
    .catch((error) => {
      console.error('Could not load the sample API; requests will go to the real backend.', error);
      return undefined;
    });
}

const readCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};
apiClient.interceptors.request.use(async (config) => {
  if (mockReady) {
    const adapter = await mockReady;
    if (adapter) config.adapter = adapter;
  }
  if (['post', 'put', 'patch', 'delete'].includes((config.method ?? 'get').toLowerCase())) {
    const token = readCookie('tf_csrf');
    if (token) config.headers['X-CSRF-Token'] = token;
  }
  return config;
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
        // Single-flight: create the refresh once and clear it only when it
        // settles (inside its own finally), so late-joining requests dedupe
        // onto the same in-flight refresh instead of starting a new one.
        if (!refreshPromise) {
          refreshPromise = apiClient.post('/api/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return apiClient(original);
      } catch {
        // Refresh failed (expired session or backend down) .fall through to
        // the normalized rejection below so the caller can redirect to login.
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export default apiClient;
