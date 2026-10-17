import { mockUser } from './mockData.js';
import { makeQuestions } from './mockExam.js';

/**
 * Dev sample data for the two things a student can do to a *question* rather than to a paper:
 * save it, and report it.
 *
 * Both are keyed by question id. The sample paper generator gives each question an id of
 * `<SUBJECT>-q<position>` (`makeQuestions`), so a bookmark or a report resolves back to the
 * exact rendering the student was looking at .same numbers, same word list .instead of a
 * fresh one that merely shares the template.
 *
 * Real question ids come from the question bank and are stable across papers; these are
 * per-paper-position only because the sample data has no bank of its own.
 */

const QUESTION_ID = /^([A-Z]{2,4}[0-9]{3})-q([0-9]+)$/;

/** A session question rendered from the bank, without the sitting's own state. */
export function sampleQuestion(questionId) {
  const match = QUESTION_ID.exec(String(questionId ?? ''));
  if (!match) return null;
  const [, code, raw] = match;
  const index = Number(raw);
  const question = makeQuestions(code, index + 1)[index];
  if (!question) return null;
  return {
    id: questionId,
    subjectCode: code,
    index,
    stem: question.stem,
    options: question.options,
    correctOption: question.correctOption,
    explanation: question.explanation ?? null,
    topic: question.topic ?? null,
  };
}

/* --- Store ---------------------------------------------------------------- */

let bookmarkSeq = 0;
let flagSeq = 0;

const bookmarks = new Map(); // id -> { id, questionId, createdAt }
const flags = new Map(); // id -> { id, questionId, reason, note, status, createdAt, student }

/** Two saved questions and a flagged one, so the profile and the admin queue are not empty. */
const seed = () => {
  ['MTH101-q3', 'GST101-q5', 'PHY101-q12'].forEach((questionId) => {
    if (!sampleQuestion(questionId)) return;
    bookmarkSeq += 1;
    bookmarks.set(`bkq_${bookmarkSeq}`, {
      id: `bkq_${bookmarkSeq}`,
      questionId,
      createdAt: new Date(Date.now() - bookmarkSeq * 36e5).toISOString(),
    });
  });

  const report = (questionId, reason, note, hoursAgo) => {
    if (!sampleQuestion(questionId)) return;
    flagSeq += 1;
    flags.set(`fl_${flagSeq}`, {
      id: `fl_${flagSeq}`,
      questionId,
      reason,
      note,
      status: 'open',
      createdAt: new Date(Date.now() - hoursAgo * 36e5).toISOString(),
      student: {
        fullName: mockUser.fullName,
        matricNumber: mockUser.matricNumber,
        username: mockUser.username,
      },
    });
  };

  /* Two reports on one question: the count is the signal an admin actually reads. */
  report('PHY101-q4', 'wrong_answer', 'I am certain 9.8 should give 98, not 9.8.', 30);
  report('PHY101-q4', 'wrong_answer', 'Same as the other report .the unit is wrong.', 6);
  report('CHM101-q7', 'typo', 'Option C has a spelling mistake in the reagent name.', 52);
};

seed();

const bad = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const bookmarkView = (row) => ({
  ...row,
  question: sampleQuestion(row.questionId),
});

const reportCountFor = (questionId) =>
  [...flags.values()].filter((flag) => flag.questionId === questionId).length;

const flagView = (flag) => ({
  ...flag,
  question: sampleQuestion(flag.questionId),
  reportCount: reportCountFor(flag.questionId),
});

/* --- Routes --------------------------------------------------------------- */

/** Routes in the same shape `mockExam.js` uses. Undefined when nothing matches. */
export function studyRoute(method, path, body) {
  /* --- Saved questions --- */
  if (method === 'GET' && path === '/api/question-bookmarks') {
    const rows = [...bookmarks.values()]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(bookmarkView);
    return { bookmarks: rows };
  }

  if (method === 'POST' && path === '/api/question-bookmarks') {
    const questionId = body?.questionId;
    if (!sampleQuestion(questionId)) throw bad(404, 'That question no longer exists.');

    const existing = [...bookmarks.values()].find((row) => row.questionId === questionId);
    if (existing) {
      bookmarks.delete(existing.id);
      return { questionId, bookmarked: false };
    }
    bookmarkSeq += 1;
    bookmarks.set(`bkq_${bookmarkSeq}`, {
      id: `bkq_${bookmarkSeq}`,
      questionId,
      createdAt: new Date().toISOString(),
    });
    return { questionId, bookmarked: true };
  }

  if (method === 'DELETE' && path.startsWith('/api/question-bookmarks/')) {
    const id = path.split('/')[3];
    if (!bookmarks.has(id)) throw bad(404, 'That bookmark no longer exists.');
    bookmarks.delete(id);
    return { id, bookmarked: false };
  }

  /* --- Reporting a question --- */
  const flagMatch = path.match(/^\/api\/questions\/([^/]+)\/flag$/);
  if (method === 'POST' && flagMatch) {
    const questionId = flagMatch[1];
    if (!sampleQuestion(questionId)) throw bad(404, 'That question no longer exists.');

    /* One report per student per question: flagging twice updates the reason rather than
       inflating the count, which is what makes the count worth reading. */
    const mine = [...flags.values()].find(
      (flag) => flag.questionId === questionId && flag.student.username === mockUser.username,
    );
    const patch = { reason: body?.reason ?? 'other', note: body?.note ?? '' };

    if (mine) {
      Object.assign(mine, patch);
      return { flag: flagView(mine) };
    }
    flagSeq += 1;
    const flag = {
      id: `fl_${flagSeq}`,
      questionId,
      ...patch,
      status: 'open',
      createdAt: new Date().toISOString(),
      student: {
        fullName: mockUser.fullName,
        matricNumber: mockUser.matricNumber,
        username: mockUser.username,
      },
    };
    flags.set(flag.id, flag);
    return { flag: flagView(flag) };
  }

  if (method === 'GET' && path === '/api/admin/question-flags') {
    const all = [...flags.values()].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    return {
      flags: all.map(flagView),
      counts: {
        open: all.filter((flag) => flag.status === 'open').length,
        questionCount: new Set(all.map((flag) => flag.questionId)).size,
        resolved: all.filter((flag) => flag.status === 'resolved').length,
        dismissed: all.filter((flag) => flag.status === 'dismissed').length,
      },
    };
  }

  const resolveMatch = path.match(/^\/api\/admin\/question-flags\/([^/]+)$/);
  if (method === 'PATCH' && resolveMatch) {
    const flag = flags.get(resolveMatch[1]);
    if (!flag) throw bad(404, 'That report no longer exists.');
    flag.status = body?.status ?? flag.status;
    flag.resolution = body?.resolution ?? '';
    return { flag: flagView(flag) };
  }

  return undefined;
}

/** Prefixes this delegate owns. Kept here so `mockApi.js` stays a router, not a directory. */
export const STUDY_PREFIXES = [
  '/api/question-bookmarks',
  '/api/questions',
  '/api/admin/question-flags',
];
