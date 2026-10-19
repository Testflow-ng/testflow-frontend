// DEV ONLY: sample data for the admin console (users, questions, reports, feedback, verifications, ads, settings).
// Stats, activity and the CSV export live in mockAdmin.js. Edit freely.
const ago = (h) => new Date(Date.now() - h * 3600000).toISOString();
const names = ['Amaka Obi', 'Tunde Bello', 'Chioma Eze', 'Kemi Adeyemi', 'Dayo Alli', 'Ngozi Nwosu', 'Segun Ade', 'Sade Ola', 'Ibrahim Musa', 'Zainab Bello', 'Femi Ojo', 'Ada Okoro'];
const students = names.map((fullName, i) => ({ id: `u${i}`, fullName, email: `${fullName.split(' ')[0].toLowerCase()}${i}@oauife.edu.ng`, matricNumber: `CSC/2024/0${10 + i}`, isEmailVerified: i % 7 !== 6, createdAt: ago(i * 30 + 2), role: 'student' }));
const admins = [{ id: 'a1', fullName: 'Feranmi Oresajo', email: 'ferouslos6@gmail.com', role: 'super_admin' }, { id: 'a2', fullName: 'Owa Edison', email: 'owa@eddyrus.com', role: 'admin' }];

const codes = ['MTH101', 'GST101', 'BIO101', 'CHM101', 'PHY101'];
const questions = Array.from({ length: 40 }, (_, i) => ({
  id: `q${i}`, subject: { code: codes[i % 5], title: codes[i % 5] }, stem: i % 4 === 0 ? `If $x^2 - ${i + 3}x + ${2 * i + 2} = 0$, find the sum of the roots.` : `Sample question number ${i + 1} about ${codes[i % 5]}?`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'], correctIndex: i % 4, difficulty: ['easy', 'medium', 'hard'][i % 3], isActive: i % 9 !== 0, isShareable: i % 5 === 0, topic: 'Basics', explanation: '',
}));

let flags = [
  { id: 'f1', status: 'open', reason: 'wrong_answer', note: 'I think B is correct, not A.', createdAt: ago(3), questionId: 'q1', reportCount: 3, resolution: null, student: { username: 'tunde_b', matricNumber: 'CSC/2024/011' }, question: { stem: questions[1].stem, options: questions[1].options, correctOption: 1, subjectCode: 'GST101' } },
  { id: 'f2', status: 'open', reason: 'unclear', note: 'The question does not say which units to use.', createdAt: ago(20), questionId: 'q4', reportCount: 1, resolution: null, student: { username: null, matricNumber: 'CSC/2024/014' }, question: { stem: questions[4].stem, options: questions[4].options, correctOption: 0, subjectCode: 'MTH101' } },
  { id: 'f3', status: 'resolved', reason: 'typo', note: '', createdAt: ago(70), questionId: 'q7', reportCount: 1, resolution: 'Fixed the spelling of option C.', student: { username: 'amaka', matricNumber: null }, question: { stem: questions[7].stem, options: questions[7].options, correctOption: 3, subjectCode: 'CHM101' } },
];
let feedback = [
  { id: 'fb1', kind: 'bug', rating: null, screen: 'Exam', message: 'The timer jumped back by a minute when I switched tabs.', status: 'open', reply: null, createdAt: ago(5), student: { username: 'dayo', matricNumber: 'CSC/2024/014' } },
  { id: 'fb2', kind: 'rating', rating: 5, screen: 'Dashboard', message: 'Love the new look. Practising is actually fun now.', status: 'open', reply: null, createdAt: ago(26), student: { username: 'chioma', matricNumber: null } },
  { id: 'fb3', kind: 'idea', rating: null, screen: 'Library', message: 'Please add past questions for GST courses.', status: 'in_review', reply: null, createdAt: ago(60), student: { username: null, matricNumber: 'CSC/2024/019' } },
  { id: 'fb4', kind: 'rating', rating: 4, screen: 'Progress', message: 'Nice charts.', status: 'resolved', reply: 'Thank you! More coming soon.', createdAt: ago(120), student: { username: 'kemi_a', matricNumber: null } },
];
let verifications = [
  { id: 'v1', status: 'pending', transactionRef: 'TRX-88213', receiptImage: 'https://example.com/receipt1.png', createdAt: ago(2), student: { fullName: 'Amaka Obi', verificationCode: 'TF-4821' } },
  { id: 'v2', status: 'pending', transactionRef: 'TRX-88290', receiptImage: 'https://example.com/receipt2.png', createdAt: ago(9), student: { fullName: 'Segun Ade', verificationCode: 'TF-1033' } },
  { id: 'v3', status: 'approved', transactionRef: 'TRX-88001', receiptImage: null, createdAt: ago(80), student: { fullName: 'Chioma Eze', verificationCode: 'TF-7752' } },
];
let settings = { isPostUtmeActive: true, postUtmePrice: 2000, paymentBankName: 'Test Bank', paymentAccountNumber: '1234567890', paymentAccountName: 'Testflow Admin', updatedAt: 'v1' };
let adsSettings = { adsEnabled: true, dailyFeeKobo: 100000, minDurationDays: 1, maxDurationDays: 30, maxAdsPerStudentPerDay: 3 };
const campaigns = [
  { id: 'c1', status: 'pending_review', title: 'Campus laptop deals', description: 'Fresh stock, student prices.', destination: { type: 'whatsapp', whatsapp: '2348012345678' }, advertiser: { fullName: 'Campus Laptops' }, durationDays: 7, priceKobo: 700000, keywords: ['laptops'], submittedAt: ago(4) },
  { id: 'c2', status: 'active', title: 'Print and photocopy', description: 'Cheap, fast, near the gate.', destination: { type: 'url', url: 'https://quickprint.example' }, advertiser: { fullName: 'QuickPrint' }, durationDays: 30, priceKobo: 3000000, keywords: [], submittedAt: ago(200) },
];

const page = (items, params, limitDefault = 15) => {
  const limit = Number(params.limit ?? limitDefault);
  const pg = Number(params.page ?? 1);
  const total = items.length;
  return { items: items.slice((pg - 1) * limit, pg * limit), total, page: pg, limit, pages: Math.max(1, Math.ceil(total / limit)) };
};

export function adminConsoleRoute(method, path, body, config = {}) {
  const params = config.params ?? {};
  if (path === '/api/admin/students' && method === 'GET') {
    const q = String(params.search ?? '').toLowerCase();
    return page(students.filter((s) => !q || `${s.fullName} ${s.email} ${s.matricNumber}`.toLowerCase().includes(q)), params);
  }
  if (path === '/api/admin/students' && method === 'POST') { const s = { id: `u${students.length}`, ...body, isEmailVerified: true, createdAt: new Date().toISOString() }; students.unshift(s); return { user: s }; }
  const toggle = path.match(/^\/api\/admin\/students\/([^/]+)\/toggle-status$/);
  if (toggle) { const s = students.find((x) => x.id === toggle[1]); if (s) s.isEmailVerified = !s.isEmailVerified; return { user: s }; }
  if (/\/reset-password$/.test(path)) return { message: 'ok' };
  if (path === '/api/admin/roster') return { admins };
  if (path === '/api/admin/promote') return { user: { id: 'a9', ...body } };
  if (path === '/api/admin/create') { const u = { id: `a${admins.length + 1}`, role: 'admin', ...body }; admins.push(u); return { user: u }; }
  if (/^\/api\/admin\/demote\//.test(path)) return { user: {} };
  if (/^\/api\/admin\/users\//.test(path)) return {};
  if (path === '/api/admin/settings') { if (method === 'PATCH') settings = { ...settings, ...body }; return { settings }; }
  if (path === '/api/admin/question-flags' && method === 'GET') return { flags, counts: { open: flags.filter((f) => f.status === 'open').length, resolved: flags.filter((f) => f.status === 'resolved').length, dismissed: flags.filter((f) => f.status === 'dismissed').length, questionCount: 3 } };
  const flag = path.match(/^\/api\/admin\/question-flags\/([^/]+)$/);
  if (flag) { const f = flags.find((x) => x.id === flag[1]); Object.assign(f, { status: body.status, resolution: body.resolution }); return { flag: f }; }
  if (path === '/api/admin/feedback' && method === 'GET') {
    const list = feedback.filter((f) => (!params.status || f.status === params.status) && (!params.kind || f.kind === params.kind));
    const n = (s) => feedback.filter((f) => f.status === s).length;
    return { feedback: list, counts: { open: n('open'), in_review: n('in_review'), resolved: n('resolved'), total: feedback.length, averageRating: 4.5, ratedCount: 2 }, page: 1, total: list.length };
  }
  const fb = path.match(/^\/api\/admin\/feedback\/([^/]+)$/);
  if (fb) { const f = feedback.find((x) => x.id === fb[1]); Object.assign(f, { status: body.status, reply: body.reply }); return { feedback: f }; }
  if (/^\/api\/admin\/questions\/[^/]+\/analytics$/.test(path)) return { total: 24, options: [{ _id: 0, count: 6 }, { _id: 1, count: 12 }, { _id: 2, count: 4 }, { _id: 3, count: 2 }], accuracy: [{ _id: true, count: 12 }, { _id: false, count: 12 }] };
  if (/^\/api\/admin\/questions\/bulk-/.test(path)) return { message: 'Done.' };
  if (path === '/api/questions' && method === 'GET') {
    const q = String(params.search ?? '').toLowerCase();
    return page(questions.filter((x) => (!params.subject || x.subject.code === params.subject) && (!params.difficulty || x.difficulty === params.difficulty) && (!q || x.stem.toLowerCase().includes(q))), params);
  }
  const one = path.match(/^\/api\/questions\/([^/]+)$/);
  if (one && method === 'GET') return { question: questions.find((x) => x.id === one[1]) ?? questions[0] };
  if (path === '/api/questions' || one || path === '/api/questions/bulk') return { question: { id: 'new' }, message: 'Imported.' };
  if (path === '/api/verifications/queue') return { requests: verifications.filter((v) => params.status === 'all' || v.status === params.status) };
  const ver = path.match(/^\/api\/verifications\/([^/]+)\/process$/);
  if (ver) { const v = verifications.find((x) => x.id === ver[1]); Object.assign(v, { status: body.status, rejectionReason: body.rejectionReason }); return { request: v }; }
  if (path === '/api/admin/ads/overview') return { campaignsByStatus: { pending_review: 1, active: 1, suspended: 0 }, revenue: { amountKobo: 3700000, payments: 2, currency: 'NGN' } };
  if (path === '/api/admin/ads/campaigns') return page(campaigns, { limit: 100 });
  if (/^\/api\/admin\/ads\/campaigns\/[^/]+\/(approve|reject|suspend|reinstate|remove)$/.test(path)) { const c = campaigns.find((x) => path.includes(x.id)); if (c) c.status = path.endsWith('approve') ? 'active' : path.endsWith('reject') ? 'rejected' : path.endsWith('suspend') ? 'suspended' : 'active'; return { campaign: c }; }
  if (path === '/api/admin/ads/payments') return page([{ id: 'p1', reference: 'AD-48213', advertiser: { fullName: 'Campus Laptops' }, amountKobo: 700000, status: 'paid', paidAt: ago(30) }], { limit: 100 });
  if (path === '/api/admin/ads/settings') { if (method === 'PATCH') adsSettings = { ...adsSettings, ...body }; return { settings: adsSettings }; }
  if (path === '/api/advertising/admin/health') return { health: { providers: { testflow: { enabled: true }, google_adsense: { enabled: true, requested: true, configured: true, requireConsent: false } }, placements: { registered: 7, enabled: 3, enabledIds: [] }, entitlements: { adFree: 18, liveCbtHost: 18 }, purchases: { paid: 21, pending: 2 }, issues: [{ level: 'warn', code: 'NO_AD_UNITS', message: 'No ad units are configured yet; placements will get a publisher id with no slot.' }] } };
  if (/^\/api\/billing\/ad-free\/entitlements\//.test(path)) return { entitlement: {} };
  return undefined;
}

export const ADMIN_CONSOLE_PREFIXES = [
  '/api/admin/students', '/api/admin/roster', '/api/admin/promote', '/api/admin/create', '/api/admin/demote', '/api/admin/users',
  '/api/admin/settings', '/api/admin/question-flags', '/api/admin/feedback', '/api/admin/questions', '/api/admin/ads',
  '/api/questions', '/api/verifications/queue', '/api/verifications/', '/api/advertising/admin', '/api/billing/ad-free/entitlements',
];
