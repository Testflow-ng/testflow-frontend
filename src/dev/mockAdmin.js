// DEV ONLY: sample data for the admin dashboard, so `/admin` renders for the development
// account instead of erroring on every request. Served by `mockApi.js` while
// `VITE_DEV_BYPASS_AUTH=true`.
//
// Only the three things the dashboard itself asks for live here. The other admin screens
// (students, subjects, verifications, roster, question bank) still need the real backend —
// they answer MOCK_MISSING in dev.

const students = [
  { id: 'u1', fullName: 'Chioma Eze', username: 'chioma', level: '200', matricNumber: 'CSC/2024/044', createdAt: '2026-10-16T08:12:00.000Z' },
  { id: 'u2', fullName: 'Tunde Bello', username: 'tunde_b', level: '100', matricNumber: 'CSC/2024/118', createdAt: '2026-10-15T19:40:00.000Z' },
  { id: 'u3', fullName: 'Kemi Ade', username: 'kemi_a', level: '300', matricNumber: 'MED/2023/091', createdAt: '2026-10-15T11:05:00.000Z' },
  { id: 'u4', fullName: 'Dayo Alli', username: 'dayo', level: '100', matricNumber: 'ENG/2024/007', createdAt: '2026-10-14T16:22:00.000Z' },
  { id: 'u5', fullName: 'Amaka Obi', username: 'amaka', level: '200', matricNumber: 'LAW/2024/233', createdAt: '2026-10-13T09:58:00.000Z' },
];

const hoursAgo = (n) => new Date(Date.now() - n * 36e5).toISOString();

const logs = [
  { id: 'log_1', action: 'CREATE_STUDENT', actor: { fullName: 'Feranmi Oresajo' }, metadata: {}, createdAt: hoursAgo(0.4) },
  { id: 'log_2', action: 'APPROVE_VERIFICATION', actor: { fullName: 'Feranmi Oresajo' }, metadata: { studentName: 'Kemi Ade', verificationCode: 'TF-7741' }, createdAt: hoursAgo(3) },
  { id: 'log_3', action: 'BULK_IMPORT', actor: { fullName: 'Feranmi Oresajo' }, metadata: { count: 120 }, createdAt: hoursAgo(9) },
  { id: 'log_4', action: 'CREATE_SUBJECT', actor: { fullName: 'Feranmi Oresajo' }, metadata: { code: 'PHY101' }, createdAt: hoursAgo(26) },
  { id: 'log_5', action: 'UPDATE_SETTINGS', actor: { fullName: 'Feranmi Oresajo' }, metadata: {}, createdAt: hoursAgo(31) },
];

/**
 * The shape `AdminDashboardPage` reads: `stats.users`, `stats.usage`, `stats.content`, plus the
 * newest students for the sidebar list. Numbers are made up but plausible, and every field the
 * page touches is present .a missing one takes the whole route down.
 */
const stats = {
  users: {
    students: 1284,
    postUtmePaid: 312,
    growth: { today: 18, todayPercent: 12.5, week: 96, weekPercent: 8.1, month: 402, monthPercent: -3.4 },
    activity: { daily: 214, weekly: 806, monthly: 1284 },
  },
  usage: {
    activeNow: 37,
    totalSessions: 5240,
    averageScore: 63,
    topSubject: 'GST101',
    completedSessions: 4988,
  },
  content: {
    questions: 3184,
    subjects: 12,
    levels: { 100: 4, 200: 3, 300: 2, 400: 1, 500: 1, Unleveled: 2 },
  },
};

const exportCsv = () => {
  const rows = students.map((student, i) => [
    student.fullName,
    student.matricNumber,
    i % 2 ? 'MTH101' : 'GST101',
    58 + ((i * 7) % 40),
    hoursAgo(i + 2),
  ]);
  const head = ['fullName', 'matricNumber', 'subjectCode', 'score', 'submittedAt'];
  return [head, ...rows].map((row) => row.join(',')).join('\n');
};

/** Routes in the same shape `mockStudy.js` uses. Undefined when nothing matches. */
export function adminRoute(method, path) {
  if (method === 'GET' && path === '/api/admin/stats') {
    return { stats, recentUsers: students };
  }

  if (method === 'GET' && path === '/api/admin/activity') {
    return { logs };
  }

  // The dashboard's Export button turns this straight into a download.
  if (method === 'GET' && path === '/api/admin/export-results') {
    return new Blob([exportCsv()], { type: 'text/csv' });
  }

  return undefined;
}

/** Prefixes this delegate owns, kept here so `mockApi.js` stays a router, not a directory. */
export const ADMIN_PREFIXES = ['/api/admin/stats', '/api/admin/activity', '/api/admin/export-results'];
