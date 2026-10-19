// DEV ONLY: a tiny Live CBT simulator for the mock API. Codes:
//   HOST22 (or any session you create)  you are the host; use the buttons.
//   JOIN22                              you are a participant; the "host" approves and starts on a timer.
const now = () => Date.now();
const iso = (t) => new Date(t).toISOString();

const SAMPLE = [
  ['What is the SI unit of force?', ['Joule', 'Newton', 'Watt', 'Pascal'], 1],
  ['Which gas do plants take in for photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], 2],
  ['Solve: $2x + 6 = 14$. What is $x$?', ['2', '3', '4', '5'], 2],
  ['The powerhouse of the cell is the...', ['Nucleus', 'Mitochondrion', 'Ribosome', 'Golgi body'], 1],
  ['Which is a prime number?', ['21', '27', '29', '33'], 2],
  ['Water boils at what temperature at sea level?', ['50 C', '80 C', '100 C', '120 C'], 2],
];

const base = (code, over = {}) => ({
  id: code, shareCode: code, shareUrl: `${window.location.origin}/live-cbt/${code}`, title: 'MTH101 mock, Friday night', description: '',
  status: 'waiting', durationMinutes: 10, maxParticipants: 12, numQuestions: SAMPLE.length, difficulty: 'mixed', negativeMarking: 0, marksPerQuestion: 1,
  allowReview: true, startedAt: null, endsAt: null, ...over,
});

const rooms = {
  HOST22: { host: true, ...base('HOST22'), people: [
    { userId: 'u1', displayName: 'Amaka Obi', email: 'amaka@oauife.edu.ng', status: 'pending', attemptStatus: 'waiting' },
    { userId: 'u2', displayName: 'Tunde Bello', email: 'tunde@oauife.edu.ng', status: 'pending', attemptStatus: 'waiting' },
    { userId: 'u3', displayName: 'Chioma Eze', email: 'chioma@oauife.edu.ng', status: 'approved', attemptStatus: 'waiting' },
  ] },
  JOIN22: { host: false, ...base('JOIN22', { title: 'GST101 quick test' }), me: null, joinedAt: null, startedAt: null, submittedAt: null },
};

const counts = (r) => {
  const people = r.people ?? [];
  const pending = people.filter((p) => p.status === 'pending').length;
  const approved = people.filter((p) => p.status === 'approved').length;
  return { pendingCount: pending, approvedCount: approved, participantCount: pending + approved };
};

/** JOIN22 moves on by itself so you can see every participant state. */
const stepJoin = (r) => {
  const t = now();
  if (r.joinedAt && t - r.joinedAt > 3000 && r.me === 'pending') r.me = 'approved';
  if (r.me === 'approved' && r.status === 'waiting' && t - r.joinedAt > 8000) {
    r.status = 'in_progress';
    r.startedAt = t;
    r.endsAt = t + r.durationMinutes * 60000;
  }
  if (r.submittedAt && r.status === 'in_progress') r.status = 'completed';
  if (r.status === 'completed' && t - r.submittedAt > 6000) r.status = 'results_published';
};

const PRIVATE = ['host', 'people', 'me', 'joinedAt', 'submittedAt', 'answers'];
const roomView = (r) => ({
  ...Object.fromEntries(Object.entries(r).filter(([k]) => !PRIVATE.includes(k))),
  serverTime: iso(now()),
  ...(r.host ? counts(r) : { pendingCount: 0, approvedCount: r.me === 'approved' ? 4 : 3, participantCount: 4 }),
});

const forbidden = () => Object.assign(new Error('Only the host can do this.'), { status: 403 });
const find = (code) => {
  const r = rooms[code];
  if (!r) throw Object.assign(new Error('Examination not found.'), { status: 404 });
  return r;
};

export function liveRoute(method, path, body) {
  let m = path.match(/^\/api\/live-cbt$/);
  if (m && method === 'POST') {
    const code = `MK${Math.floor(10 + Math.random() * 89)}${'XYZ'[Math.floor(Math.random() * 3)]}A`.slice(0, 6);
    rooms[code] = { host: true, ...base(code, { title: body.title, durationMinutes: body.durationMinutes, numQuestions: body.numQuestions, maxParticipants: body.maxParticipants, difficulty: body.difficulty, negativeMarking: body.negativeMarking, allowReview: body.allowReview }), people: [] };
    return { exam: roomView(rooms[code]) };
  }
  m = path.match(/^\/api\/live-cbt\/([A-Za-z0-9]+)(?:\/(.+))?$/);
  if (!m) return undefined;
  const [, code, action] = m;
  const r = find(code);
  if (!r.host) stepJoin(r);

  if (!action && method === 'GET') {
    if (r.host) return { room: { ...roomView(r), membership: null } };
    return { room: { ...roomView(r), membership: r.me ? { status: r.me, attemptStatus: r.submittedAt ? 'submitted' : r.status === 'in_progress' ? 'in_progress' : 'waiting', sequenceNumber: 4 } : null } };
  }
  if (action === 'host' && method === 'GET') {
    if (!r.host) throw forbidden();
    return { room: { ...roomView(r), participants: r.people } };
  }
  if (action === 'join') { r.me = 'pending'; r.joinedAt = now(); return { status: 'pending' }; }
  if (action === 'approve' || action === 'reject') {
    const p = r.people.find((x) => x.userId === body.userId);
    if (p) p.status = action === 'approve' ? 'approved' : 'rejected';
    return { status: p?.status };
  }
  if (action === 'approve-all') { r.people.forEach((p) => { if (p.status === 'pending') p.status = 'approved'; }); return { ok: true }; }
  if (action === 'start') {
    r.status = 'in_progress'; r.startedAt = now(); r.endsAt = now() + r.durationMinutes * 60000;
    r.people.forEach((p) => { if (p.status === 'approved') p.attemptStatus = 'in_progress'; });
    return { exam: roomView(r) };
  }
  if (action === 'end') { r.status = 'completed'; return { exam: roomView(r) }; }
  if (action === 'publish') { r.status = 'results_published'; return { exam: roomView(r) }; }
  if (action === 'cancel') { r.status = 'cancelled'; return { exam: roomView(r) }; }
  if (action === 'questions') {
    r.answers = r.answers ?? {};
    return { exam: { shareCode: code, title: r.title, status: r.status, durationMinutes: r.durationMinutes, startedAt: iso(r.startedAt), endsAt: iso(r.endsAt), serverTime: iso(now()), totalQuestions: SAMPLE.length, attemptStatus: 'in_progress', questions: SAMPLE.map(([stem, options], index) => ({ index, stem, options, selectedOption: r.answers[index] ?? null })) } };
  }
  if (action === 'answer' && method === 'PATCH') { r.answers = r.answers ?? {}; r.answers[body.questionIndex] = body.selectedOption; return { answer: body }; }
  if (action === 'submit') {
    // The client hands back anything its autosave never delivered, exactly as the real API does.
    r.answers = r.answers ?? {};
    (body?.answers ?? []).forEach(({ questionIndex, selectedOption }) => { r.answers[questionIndex] = selectedOption; });
    r.submittedAt = now();
    return { result: { attemptStatus: 'submitted', answersAccepted: body?.answers?.length ?? 0 } };
  }
  if (action === 'result') {
    const a = r.answers ?? {};
    const correct = SAMPLE.filter(([, , c], i) => a[i] === c).length;
    const unanswered = SAMPLE.filter((_, i) => a[i] == null).length;
    return { result: { shareCode: code, title: r.title, rank: 2, score: correct, totalPossible: SAMPLE.length, correctCount: correct, incorrectCount: SAMPLE.length - correct - unanswered, unansweredCount: unanswered, accuracy: Math.round((correct / SAMPLE.length) * 100), timeTakenSeconds: 312, attemptStatus: 'submitted',
      corrections: SAMPLE.map(([stem, options, c], index) => ({ index, stem, options, selectedOption: a[index] ?? null, correctOption: c, isCorrect: a[index] === c, explanation: index === 2 ? 'Subtract 6 from both sides, then divide by 2.' : null })) } };
  }
  if (action === 'dashboard') {
    return { dashboard: { ...roomView(r), totals: { approved: 3, started: 3, submitted: 2, timedOut: 1, noShow: 0 },
      rankings: [{ userId: 'u3', displayName: 'Chioma Eze', attemptStatus: 'submitted', score: 5, accuracy: 83, timeTakenSeconds: 301, rank: 1 }, { userId: 'me', displayName: 'You', attemptStatus: 'submitted', score: 4, accuracy: 67, timeTakenSeconds: 345, rank: 2 }, { userId: 'u4', displayName: 'Kemi Ade', attemptStatus: 'timed_out', score: 2, accuracy: 33, timeTakenSeconds: 600, rank: 3 }],
      questionStats: SAMPLE.map(([stem], i) => ({ questionId: `q${i}`, stem, attempts: 3, correct: [3, 2, 1, 3, 2, 3][i], correctRate: Math.round(([3, 2, 1, 3, 2, 3][i] / 3) * 100) })) } };
  }
  return undefined;
}
