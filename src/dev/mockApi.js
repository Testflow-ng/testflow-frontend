// DEV ONLY: an axios adapter that answers API calls from `mockData.js`, so screens render without a backend.
// Installed by `api/client.js` only when `VITE_DEV_BYPASS_AUTH=true` in `npm run dev`.
import { liveRoute } from './mockLive.js';
import { examRoute, summaryFor } from './mockExam.js';
import { studyRoute, STUDY_PREFIXES } from './mockStudy.js';
import { feedbackRoute, FEEDBACK_PREFIXES } from './mockFeedback.js';
import { adminRoute, ADMIN_PREFIXES } from './mockAdmin.js';
import { mockBooks, mockReading, mockSessions, mockStats, mockSubjects, mockUser } from './mockData.js';

const pinned = new Set(mockUser.pinnedSubjects);

/* Library: bookmarks and reading progress are mutated in place, so the mock behaves like the API. */
const bookmarked = new Set(mockBooks.filter((b) => b.bookmarked).map((b) => b.id));

const bookById = (id) => mockBooks.find((b) => b.id === id);
const withBookmark = (b) => (b ? { ...b, bookmarked: bookmarked.has(b.id) } : b);

/** Sample reader content. The real pages come from the books API. */
const pageBlocks = (b, page) => [
  { type: 'heading', text: `${b.code} · Page ${page}` },
  {
    type: 'paragraph',
    text: 'Sample text from the development mock. Published book content arrives from the library pages endpoint.',
  },
  {
    type: 'paragraph',
    text: `${b.title} is ${b.pages} pages long and this is page ${page}. Use the arrows below to move through it; where you stop is saved.`,
  },
];

const routes = [
  ['GET', /^\/api\/exam-sessions\/stats$/, () => ({ stats: mockStats })],
  // Scores in the list come from the same marked paper the result page renders (`mockExam.js`),
  // so a history row can never disagree with the report behind it.
  [
    'GET',
    /^\/api\/exam-sessions$/,
    () => ({
      sessions: mockSessions.map((s) => (s.status === 'submitted' ? { ...s, ...summaryFor(s) } : s)),
    }),
  ],
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

  /* Library. List is paged and searchable server-side; the client never pulls the whole shelf. */
  [
    'GET',
    /^\/api\/library\/books$/,
    (_m, _body, config) => {
      const { q = '', page = 1, limit = 12, filter = 'all' } = config.params ?? {};
      const needle = String(q).trim().toLowerCase();
      const rows = mockBooks.filter((b) => {
        if (filter === 'bookmarks' && !bookmarked.has(b.id)) return false;
        if (!needle) return true;
        return [b.code, b.title, b.subtitle, b.author, ...b.topics].join(' ').toLowerCase().includes(needle);
      });
      const total = rows.length;
      const pageCount = Math.max(1, Math.ceil(total / limit));
      const start = (Math.max(1, page) - 1) * limit;
      return { books: rows.slice(start, start + limit).map(withBookmark), page: Math.max(1, page), pageCount, total };
    },
  ],
  ['GET', /^\/api\/library\/reading$/, () => ({
    reading: [...mockReading]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((r) => ({ ...r, book: withBookmark(bookById(r.bookId)) })),
  })],
  ['GET', /^\/api\/library\/books\/([^/]+)\/pages$/, (m, _body, config) => {
    const b = bookById(m[1]);
    if (!b) return { error: 'not_found' };
    const page = Math.min(Math.max(1, Number(config.params?.page) || 1), b.pages);
    return { bookId: b.id, page, totalPages: b.pages, blocks: pageBlocks(b, page) };
  }],
  ['GET', /^\/api\/library\/books\/([^/]+)$/, (m) => ({ book: withBookmark(bookById(m[1])) })],
  ['GET', /^\/api\/library\/books\/([^/]+)\/download$/, (m) => {
    const b = bookById(m[1]);
    // Dev stands in for the signed URL the real endpoint returns with a small text file,
    // so the download button does something real without shipping a PDF.
    const note = `TestFlow sample file for ${b.code} .${b.title}.\nThe published PDF comes from GET /api/library/books/:id/download.\n`;
    return {
      fileName: `${b.code}-sample.txt`,
      sizeBytes: b.sizeKb * 1024,
      url: `data:text/plain;charset=utf-8,${encodeURIComponent(note)}`,
    };
  }],
  ['POST', /^\/api\/library\/books\/([^/]+)\/bookmark$/, (m) => {
    if (bookmarked.has(m[1])) bookmarked.delete(m[1]);
    else bookmarked.add(m[1]);
    return { id: m[1], bookmarked: bookmarked.has(m[1]) };
  }],
  ['PUT', /^\/api\/library\/books\/([^/]+)\/progress$/, (m, body) => {
    const b = bookById(m[1]);
    const pages = b?.pages ?? 1;
    const page = Math.min(Math.max(1, Number(body?.page) || 1), pages);
    const percent = Math.round((page / pages) * 100);
    const updatedAt = new Date().toISOString();
    const entry = mockReading.find((r) => r.bookId === m[1]);
    if (entry) Object.assign(entry, { page, percent, updatedAt });
    else mockReading.unshift({ bookId: m[1], page, percent, updatedAt });
    return { progress: { bookId: m[1], page, percent, updatedAt } };
  }],
];

/**
 * Everything too big for the table above lives in its own module and owns a path prefix.
 * First match wins; a delegate that returns `undefined` has not claimed the request, which
 * then falls through to `routes` and finally to the MOCK_MISSING error.
 */
const DELEGATES = [
  { owns: (path) => path.startsWith('/api/live-cbt'), route: liveRoute },
  { owns: (path) => path.startsWith('/api/exam-sessions'), route: examRoute },
  { owns: (path) => STUDY_PREFIXES.some((prefix) => path.startsWith(prefix)), route: studyRoute },
  { owns: (path) => FEEDBACK_PREFIXES.some((prefix) => path.startsWith(prefix)), route: feedbackRoute },
  { owns: (path) => ADMIN_PREFIXES.some((prefix) => path.startsWith(prefix)), route: adminRoute },
];

export function mockAdapter(config) {
  const path = (config.url ?? '').replace(config.baseURL ?? '', '').split('?')[0];
  const method = (config.method ?? 'get').toUpperCase();
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : (config.data ?? {});
  const hit = routes.find(([m, re]) => m === method && re.test(path));

  let delegated;
  let delegatedError;
  if (!hit) {
    const delegate = DELEGATES.find((entry) => entry.owns(path));
    if (delegate) {
      try {
        delegated = delegate.route(method, path, body, config);
      } catch (e) {
        delegatedError = e;
      }
    }
  }
  const handled = Boolean(delegatedError) || delegated !== undefined;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (handled) {
        if (delegatedError) {
          const error = new Error(delegatedError.message);
          error.config = config;
          error.response = { status: delegatedError.status ?? 400, data: { error: { code: 'MOCK', message: delegatedError.message } }, config };
          reject(error);
        } else {
          resolve({ data: delegated, status: 200, statusText: 'OK', headers: {}, config });
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
      resolve({ data: hit[2](path.match(hit[1]), body, config), status: 200, statusText: 'OK', headers: {}, config });
    }, 250);
  });
}
