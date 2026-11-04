import { mockUser } from './mockData.js';

/**
 * Dev sample data for student feedback.
 *
 * One store with two readers, exactly like the real thing: `GET /api/feedback` returns the
 * signed-in student's own entries .with the status and any reply an admin left, because that
 * is the whole point of sending it .while `GET /api/admin/feedback` returns everything plus
 * the counts the queue's filters are labelled from.
 *
 * The status machine is `open → in_review → resolved`, and `open` is reachable again so a
 * decision can be undone.
 */

const STATUSES = ['open', 'in_review', 'resolved'];
const KINDS = ['problem', 'idea', 'other'];

let seq = 0;
const entries = new Map(); // id -> entry

const identity = (user) => ({
  fullName: user.fullName,
  matricNumber: user.matricNumber ?? null,
  username: user.username,
});

const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

/** The signed-in student's own entries. */
const mine = () => [...entries.values()].filter((e) => e.student.username === mockUser.username).sort(newestFirst);

const seed = () => {
  const add = ({ user = mockUser, kind, rating, message, screen = null, status, reply = null, hoursAgo }) => {
    seq += 1;
    entries.set(`fb_${seq}`, {
      id: `fb_${seq}`,
      kind,
      rating,
      message,
      screen,
      status,
      reply,
      createdAt: new Date(Date.now() - hoursAgo * 36e5).toISOString(),
      student: identity(user),
    });
  };

  /* The student's own: one still open, one already answered. */
  add({
    kind: 'problem',
    rating: 3,
    message: 'The countdown stopped while I was reading question 12. I only noticed because I looked up at the clock.',
    screen: 'Exam timer',
    status: 'open',
    hoursAgo: 5,
  });
  add({
    kind: 'idea',
    rating: 5,
    message: 'Please add a dark theme for the exam screen. Two hours of bright white at night is hard on the eyes.',
    status: 'resolved',
    reply: 'Shipped in the last release .the paper now follows your theme setting.',
    hoursAgo: 78,
  });

  /* Someone else's, so the admin queue is not identical to the student's list. */
  add({
    user: { fullName: 'Tunde Bello', matricNumber: 'CSC/2024/118', username: 'tunde_b' },
    kind: 'problem',
    rating: 2,
    message: 'The library reader lost my page when I rotated the phone, and I had to find my place again.',
    screen: 'Library reader',
    status: 'in_review',
    reply: 'Thanks .we can reproduce this on Android. A fix is in the next release.',
    hoursAgo: 26,
  });
};

seed();

const bad = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/* --- Routes --------------------------------------------------------------- */

/** Routes in the same shape `mockStudy.js` uses. Undefined when nothing matches. */
export function feedbackRoute(method, path, body) {
  if (method === 'POST' && path === '/api/feedback') {
    const message = String(body?.message ?? '').trim();
    if (message.length < 10) throw bad(400, 'Tell us a little more .at least 10 characters.');

    const { rating } = body ?? {};
    if (rating != null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      throw bad(400, 'A rating has to be a whole number from 1 to 5.');
    }

    seq += 1;
    const entry = {
      id: `fb_${seq}`,
      kind: KINDS.includes(body?.kind) ? body.kind : 'other',
      rating: rating ?? null,
      message: message.slice(0, 1000),
      screen: body?.screen ? String(body.screen).slice(0, 80) : null,
      status: 'open',
      reply: null,
      createdAt: new Date().toISOString(),
      student: identity(mockUser),
    };
    entries.set(entry.id, entry);
    return { feedback: entry };
  }

  if (method === 'GET' && path === '/api/feedback') {
    return { feedback: mine() };
  }

  if (method === 'GET' && path === '/api/admin/feedback') {
    const all = [...entries.values()].sort(newestFirst);
    const rated = all.filter((entry) => entry.rating != null);
    const average = rated.length
      ? Math.round((rated.reduce((sum, entry) => sum + entry.rating, 0) / rated.length) * 10) / 10
      : null;
    return {
      feedback: all,
      counts: {
        open: all.filter((entry) => entry.status === 'open').length,
        in_review: all.filter((entry) => entry.status === 'in_review').length,
        resolved: all.filter((entry) => entry.status === 'resolved').length,
        total: all.length,
        averageRating: average,
      },
    };
  }

  const match = path.match(/^\/api\/admin\/feedback\/([^/]+)$/);
  if (method === 'PATCH' && match) {
    const entry = entries.get(match[1]);
    if (!entry) throw bad(404, 'That feedback no longer exists.');
    if (body?.status != null) {
      if (!STATUSES.includes(body.status)) throw bad(400, 'Unknown status.');
      entry.status = body.status;
    }
    if (body?.reply !== undefined) {
      entry.reply = String(body.reply ?? '').slice(0, 500) || null;
    }
    return { feedback: entry };
  }

  return undefined;
}

/** Prefixes this delegate owns, kept here so `mockApi.js` stays a router, not a directory. */
export const FEEDBACK_PREFIXES = ['/api/feedback', '/api/admin/feedback'];
