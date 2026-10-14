// DEV ONLY: an axios adapter that answers API calls from `mockData.js`, so screens render without a backend.
// Installed by `api/client.js` only when `VITE_DEV_BYPASS_AUTH=true` in `npm run dev`.
import { liveRoute } from './mockLive.js';
import { mockSessions, mockStats, mockSubjects, mockUser } from './mockData.js';

const pinned = new Set(mockUser.pinnedSubjects);

const routes = [
  ['GET', /^\/api\/exam-sessions\/stats$/, () => ({ stats: mockStats })],
  ['GET', /^\/api\/exam-sessions$/, () => ({ sessions: mockSessions })],
  [
    'GET',
    /^\/api\/subjects\/([^/]+)\/leaderboard$/,
    (m) => ({
      leaderboard: [
        ['tunde_b', 'Tunde Bello', 96], ['chioma', 'Chioma Eze', 92], ['feranmi', 'Feranmi Oresajo', 88], ['kemi_a', 'Kemi Ade', 84],
        ['dayo', 'Dayo Alli', 79], ['amaka', 'Amaka Obi', 75], ['sade', 'Sade Ola', 71], ['ibk', 'Ibrahim K', 66], ['ngozi', 'Ngozi N', 61], ['segun', 'Segun A', 58],
      ].map(([username, fullName, score], i) => ({ username, fullName, score: Math.max(40, score - (m[1].charCodeAt(1) % 5) * (i % 3)), totalQuestions: 50, timeTakenSeconds: 420 + i * 37, date: new Date().toISOString() })),
    }),
  ],
  ['GET', /^\/api\/subjects$/, () => ({ subjects: mockSubjects })],
  [
    'POST',
    /^\/api\/subjects\/([^/]+)\/pin$/,
    (m) => {
      if (pinned.has(m[1])) pinned.delete(m[1]);
      else pinned.add(m[1]);
      return { pinnedSubjects: [...pinned] };
    },
  ],
  ['GET', /^\/api\/auth\/me$/, () => ({ user: { ...mockUser, pinnedSubjects: [...pinned] } })],
  ['PATCH', /^\/api\/auth\/profile$/, (_m, body) => ({ user: { ...mockUser, ...body } })],
  ['POST', /^\/api\/auth\/change-password$/, () => ({ ok: true })],
];

export function mockAdapter(config) {
  const path = (config.url ?? '').replace(config.baseURL ?? '', '').split('?')[0];
  const method = (config.method ?? 'get').toUpperCase();
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : (config.data ?? {});
  const hit = routes.find(([m, re]) => m === method && re.test(path));
  let live;
  let liveError;
  if (!hit && path.startsWith('/api/live-cbt')) {
    try {
      live = liveRoute(method, path, body);
    } catch (e) {
      liveError = e;
    }
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (liveError || live !== undefined) {
        if (liveError) {
          const error = new Error(liveError.message);
          error.config = config;
          error.response = { status: liveError.status ?? 400, data: { error: { code: 'MOCK', message: liveError.message } }, config };
          reject(error);
        } else {
          resolve({ data: live, status: 200, statusText: 'OK', headers: {}, config });
        }
        return;
      }
      if (!hit) {
        const error = new Error(`No sample data for ${method} ${path}. Add it in src/dev/mockApi.js.`);
        error.config = config;
        error.response = { status: 404, data: { error: { code: 'MOCK_MISSING', message: error.message } }, config };
        reject(error);
        return;
      }
      resolve({ data: hit[2](path.match(hit[1]), body), status: 200, statusText: 'OK', headers: {}, config });
    }, 250);
  });
}
