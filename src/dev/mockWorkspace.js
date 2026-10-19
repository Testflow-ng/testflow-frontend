// DEV ONLY: sample data for the organisation console (Testflow for Everyone). Edit freely.
const ago = (d) => new Date(Date.now() - d * 86400000).toISOString();

let org = { id: 'o1', name: 'Grace CBT', slug: 'grace', plan: 'pro', payout: { status: 'none', platformPercent: 10 } };
let site = {
  version: 1, publishedAt: null, hasUnpublished: true, template: 'modern',
  brand: { name: 'Grace CBT', tagline: 'Pass JAMB with Grace', logoUrl: '', primaryColor: '#163a5f', accentColor: '#f5c542' },
  landing: { sections: [
    { id: 'b1', type: 'hero', heading: 'Prepare with confidence at Grace CBT', subheading: 'Online practice exams for JAMB and WAEC.', imageUrl: '', cta: { label: 'Start a test', url: '#' } },
    { id: 'b2', type: 'about', title: 'About us', text: 'We help students across Ibadan pass the first time.', imageUrl: '' },
    { id: 'b3', type: 'exams', title: 'Open exams' },
    { id: 'b4', type: 'contact', title: 'Contact', email: 'hello@grace.example', whatsapp: '2348012345678', address: '12 Ring Road, Ibadan' },
  ] },
  portal: { welcome: { heading: 'Welcome back', text: 'Pick an exam to get started.', imageUrl: '' }, sections: [{ id: 'p1', type: 'announcements', title: 'Notices' }] },
  pages: { exams: true, results: true, library: true, community: false, leaderboard: true, about: true, contact: true },
  footer: { text: '© Grace CBT', links: [] },
};
let exams = [
  { id: 'e1', title: 'Mathematics mock', questionCount: 8, durationMinutes: 45, status: 'published', priceMinor: 0, mode: 'anytime', access: 'link', showCorrections: 'now' },
  { id: 'e2', title: 'Use of English (Live CBT)', questionCount: 0, durationMinutes: 40, status: 'draft', priceMinor: 100000, mode: 'live', startsAt: '2026-11-02T09:00', access: 'code', accessCode: 'GRACE24', showCorrections: 'after_exam' },
];
let examQs = { e1: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'], e2: [] };
let posts = [{ id: 'n1', type: 'announcement', text: 'Mock exams open on Monday. Please read the instructions first.', pinned: true, createdAt: new Date(Date.now() - 86400000).toISOString(), commentCount: 0 }];
const questions = Array.from({ length: 26 }, (_, i) => ({ id: `q${i}`, stem: i % 5 === 0 ? `Solve $x^2 = ${(i + 2) ** 2}$ for positive $x$.` : `Sample question ${i + 1}?`, options: ['A', 'B', 'C', 'D'], correctIndex: i % 4, topic: ['Algebra', 'Grammar', 'Physics'][i % 3], difficulty: ['easy', 'medium', 'hard'][i % 3], stemImageUrl: i % 7 === 0 ? 'x' : '' }));
const students = Array.from({ length: 18 }, (_, i) => ({ id: `s${i}`, fullName: ['Ada Obi', 'Tunde Bello', 'Chioma Eze', 'Kemi Ade', 'Dayo Alli', 'Ngozi N'][i % 6] + (i > 5 ? ` ${i}` : ''), email: `student${i}@mail.com`, status: i % 5 ? 'active' : 'invited', attempts: i * 2, joinedAt: ago(i + 1) }));
let books = [
  { id: 'k1', title: 'JAMB Maths Notes', code: 'MTH', priceMinor: 0, visibility: 'all_students', color: '#4a35f0' },
  { id: 'k2', title: 'English Past Questions', code: 'ENG', priceMinor: 150000, visibility: 'paid', color: '#1b4332' },
];
const banks = [{ code: '058', name: 'GTBank' }, { code: '044', name: 'Access Bank' }, { code: '011', name: 'First Bank' }, { code: '057', name: 'Zenith Bank' }, { code: '033', name: 'UBA' }];
const series = Array.from({ length: 14 }, (_, i) => ({ date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10), grossKobo: 50000 + ((i * 37) % 9) * 40000 }));
const payments = Array.from({ length: 24 }, (_, i) => { const gross = 100000 + (i % 3) * 50000; const fee = Math.round(gross * 0.1); return { id: `p${i}`, reference: `EX-${48200 + i}`, studentName: ['Ada Obi', 'Tunde Bello', 'Chioma Eze', 'Kemi Ade'][i % 4], paidAt: ago(i * 3 + 1), item: ['Use of English (Live CBT)', 'Mathematics mock', 'JAMB Physics'][i % 3], grossKobo: gross, platformFeeKobo: fee, orgShareKobo: gross - fee, status: i === 6 ? 'refunded' : 'paid' }; });
let qbanks = [
  { id: 'b1', name: 'JAMB Mathematics', description: 'Algebra, calculus and statistics.' },
  { id: 'b2', name: 'JAMB English', description: 'Grammar and comprehension.' },
  { id: 'b3', name: 'Physics', description: '' },
];
const bankOf = (q, i) => (i < 13 ? 'b1' : i < 22 ? 'b2' : 'b3');
let domains = [];
let flags = [
  { id: 'f1', status: 'open', reason: 'wrong_answer', note: 'I think B is correct, not C.', createdAt: ago(0.2), reportCount: 2, examTitle: 'Mathematics mock', studentName: 'Tunde Bello', question: { id: 'q1', stem: 'Solve $2x + 6 = 14$.', options: ['2', '3', '4', '5'], correctIndex: 2 } },
  { id: 'f2', status: 'resolved', reason: 'typo', note: '', createdAt: ago(3), reportCount: 1, examTitle: 'Mathematics mock', studentName: 'Ada Obi', resolution: 'Fixed the spelling.', question: { id: 'q2', stem: 'The SI unit of force is the...', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctIndex: 1 } },
];
let subscription = { id: 'sub1', planKey: 'pro', planName: 'Pro', status: 'active', priceMinor: 700000, currency: 'NGN', interval: 'month', currentPeriodEnd: '12 Nov 2026', adsEnabled: true };
const plans = [{ key: 'pro', name: 'Pro', priceMinor: 700000, currency: 'NGN', interval: 'month', adsEnabled: true }, { key: 'studio', name: 'Studio', priceMinor: 2000000, currency: 'NGN', interval: 'month', adsEnabled: false }];

const page = (items, params = {}) => { const limit = Number(params.limit ?? 15); const pg = Number(params.page ?? 1); return { items: items.slice((pg - 1) * limit, pg * limit), total: items.length, page: pg, pages: Math.max(1, Math.ceil(items.length / limit)), limit }; };
const base = '/api/v1/everybody';

let tenantUser = null;

export function workspaceRoute(method, path, body, config = {}) {
  const params = config.params ?? {};
  // The organisation's own site: what a visitor and its students call on grace.testflow.com.ng.
  if (path.startsWith('/api/v1/public/')) {
    const t = path.slice('/api/v1/public/'.length);
    if (t === 'site') return { organization: { name: org.name, slug: org.slug }, site: { ...site, publishedAt: site.publishedAt ?? 'draft', ads: { enabled: org.plan !== 'studio', publisherId: 'ca-pub-0000000000000000', slots: { portal_home: '1111111111', before_corrections: '2222222222' } } } };
    if (/^questions\/[^/]+\/flag$/.test(t)) return { ok: true };
    if (t === 'announcements') return { items: posts.filter((x) => !x.hidden) };
    if (t === 'results') return { items: [{ id: 'r1', examTitle: 'Mathematics mock', scorePercent: 78, submittedAt: ago(2) }, { id: 'r2', examTitle: 'Use of English', scorePercent: 52, submittedAt: ago(9) }] };
    if (/^results\//.test(t)) return { examTitle: 'Mathematics mock', scorePercent: 78, correct: 6, total: 8, timeMinutes: 31, corrections: [{ questionId: 'q1', stem: 'Solve $2x + 6 = 14$.', options: ['2', '3', '4', '5'], correctIndex: 2, selectedIndex: 2, explanation: 'Subtract 6, then divide by 2.' }, { questionId: 'q2', stem: 'The SI unit of force is the...', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctIndex: 1, selectedIndex: 3, explanation: '' }] };
    if (t === 'exams') return { items: exams.filter((e) => e.status === 'published') };
    if (t === 'auth/me') { if (!tenantUser) throw Object.assign(new Error('Not signed in.'), { status: 401 }); return { user: tenantUser }; }
    if (t === 'auth/register') { tenantUser = { id: 'tu1', fullName: body.fullName, email: body.email }; return { user: tenantUser }; }
    if (t === 'auth/login') { tenantUser = { id: 'tu1', fullName: 'Ada Obi', email: body.email }; return { user: tenantUser }; }
    if (t === 'auth/logout') { tenantUser = null; return { ok: true }; }
    return undefined;
  }
  const p = path.slice(base.length);
  if (p === '/organizations' && method === 'GET') return { items: [org] };
  if (p === '/organizations' && method === 'POST') { org = { ...org, name: body.name, slug: body.slug }; site = { ...site, brand: { ...site.brand, name: body.name } }; return { organization: org }; }
  if (/^\/organizations\/[^/]+$/.test(p) && method === 'PATCH') { org = { ...org, ...body }; return { organization: org }; }
  if (p === '/banks') return { banks };
  if (p === '/plans') return { plans };
  if (p === '/subscription') {
    // Dev only: open any page with ?plan=free|pro|studio once to try that plan.
    try { const q = new URLSearchParams(window.location.search).get('plan'); if (q) localStorage.setItem('mockPlan', q); } catch { /* storage unavailable */ }
    const key = (() => { try { return localStorage.getItem('mockPlan'); } catch { return null; } })();
    if (key === 'free') return { subscription: { id: 'sub1', planKey: 'free', planName: 'Free', status: 'active', priceMinor: 0, currency: 'NGN', interval: 'month', adsEnabled: true } };
    if (key === 'studio') return { subscription: { ...subscription, planKey: 'studio', planName: 'Studio', priceMinor: 2000000, adsEnabled: false } };
    return { subscription };
  }
  if (/^\/subscriptions\/[^/]+\/(upgrade|renew)$/.test(p)) { if (p.endsWith('/upgrade') && body.planKey === 'pro' && subscription.planKey === 'studio') return {}; return { paymentId: 'sp1', reference: 'SUB-MOCK1', amountKobo: p.endsWith('/renew') ? subscription.priceMinor : 1300000, currency: 'NGN', authorizationUrl: `${window.location.origin}/workspace/billing/complete?reference=SUB-MOCK1` }; }
  if (p === '/payments/verify') { subscription = { ...subscription, planKey: 'studio', planName: 'Studio', priceMinor: 2000000, adsEnabled: false }; org = { ...org, plan: 'studio' }; return { payment: { reference: params.reference, status: 'paid', amountKobo: 1300000, currency: 'NGN' }, subscription }; }
  if (p === '/payments') return { items: [{ id: 'i1', reference: 'SUB-20481', planName: 'Pro', kind: 'renewal', amountKobo: 700000, currency: 'NGN', status: 'paid', paidAt: '2026-10-12' }] };
  if (p === '/domains/check-subdomain') return /^(www|admin|api)$/.test(params.name) ? { available: false, reason: 'That name is reserved.' } : { available: params.name !== 'grace' && params.name !== 'jamb', reason: 'That name is taken.' };
  const sm = p.match(/^\/organizations\/[^/]+\/students\/([^/]+)$/);
  if (sm) return { student: students.find((x) => x.id === sm[1]), attempts: [['Mathematics mock', 55, 4, 31], ['Use of English', 52, 4, 28], ['Physics mock', 64, 5, 35], ['Mathematics mock', 71, 6, 30], ['Use of English', 68, 5, 27], ['Physics mock', 78, 6, 33]].map(([examTitle, scorePercent, correct, timeMinutes], k) => ({ id: `a${k}`, examTitle, scorePercent, correct, total: 8, timeMinutes, submittedAt: ago(30 - k * 5) })) };
  const m = p.match(/^\/organizations\/[^/]+\/(.+)$/);
  if (!m) return undefined;
  const r = m[1];
  if (r === 'site' && method === 'GET') return { site };
  if (r === 'site' && method === 'PATCH') { site = { ...site, ...body, hasUnpublished: true }; return { site }; }
  if (r === 'site/publish') { site = { ...site, publishedAt: 'just now', version: site.version + 1, hasUnpublished: false }; return { ok: true }; }
  if (r === 'site/assets' || r === 'questions/assets') return { asset: { url: 'https://placehold.co/800x450/png' } };
  if (r === 'exams' && method === 'GET') return { items: exams };
  if (r === 'exams') { const e = { id: `e${exams.length + 1}`, status: 'draft', questionCount: 0, ...body }; exams = [...exams, e]; return { exam: e }; }
  const eq = r.match(/^exams\/([^/]+)\/questions$/);
  if (eq) { if (method === 'PUT') { examQs[eq[1]] = body.questionIds; exams = exams.map((e) => (e.id === eq[1] ? { ...e, questionCount: body.questionIds.length } : e)); return { ok: true }; } return { items: (examQs[eq[1]] ?? []).map((id) => questions.find((q) => q.id === id)).filter(Boolean) }; }
  const er = r.match(/^exams\/([^/]+)\/results$/);
  if (er) { const items = students.slice(0, 7).map((s, i) => ({ id: `r${i}`, studentName: s.fullName, email: s.email, scorePercent: 40 + ((i * 13) % 55), correct: 3 + (i % 5), total: 8, timeMinutes: 20 + i * 2, submittedAt: ago(i) })); const sc = items.map((x) => x.scorePercent); return { items, summary: { attempts: items.length, average: Math.round(sc.reduce((a, b) => a + b, 0) / sc.length), highest: Math.max(...sc), lowest: Math.min(...sc) } }; }
  const ex = r.match(/^exams\/([^/]+)(?:\/(publish|unpublish))?$/);
  if (ex) {
    exams = exams.map((e) => (e.id === ex[1] ? (ex[2] ? { ...e, status: ex[2] === 'publish' ? 'published' : 'draft' } : { ...e, ...body }) : e));
    if (ex[2] === 'publish' && exams.find((e) => e.id === ex[1])?.priceMinor && org.payout.status !== 'active') { exams = exams.map((e) => (e.id === ex[1] ? { ...e, status: 'draft' } : e)); throw Object.assign(new Error('Add a payout account first.'), { status: 422, code: 'PAYOUT_REQUIRED' }); }
    return { exam: exams.find((e) => e.id === ex[1]) };
  }
  if (r === 'question-flags' && method === 'GET') return { items: flags, counts: { open: flags.filter((f) => f.status === 'open').length, resolved: flags.filter((f) => f.status === 'resolved').length, dismissed: 0 } };
  const fm = r.match(/^question-flags\/([^/]+)$/);
  if (fm) { flags = flags.map((f) => (f.id === fm[1] ? { ...f, ...body } : f)); return { flag: flags.find((f) => f.id === fm[1]) }; }
  if (r === 'community/posts' && method === 'GET') return { items: posts };
  if (r === 'community/posts' && method === 'POST') { const np = { id: `n${posts.length + 1}`, createdAt: new Date().toISOString(), commentCount: 0, ...body }; posts = [np, ...posts]; return { post: np }; }
  const pm = r.match(/^community\/posts\/([^/]+)$/);
  if (pm) { if (method === 'DELETE') posts = posts.filter((x) => x.id !== pm[1]); else posts = posts.map((x) => (x.id === pm[1] ? { ...x, ...body } : x)); return { post: posts.find((x) => x.id === pm[1]) ?? {} }; }
  if (r === 'question-banks' && method === 'GET') return { items: qbanks.map((b) => ({ ...b, questionCount: questions.filter((q, i) => bankOf(q, i) === b.id).length })) };
  if (r === 'question-banks') { const b = { id: `b${qbanks.length + 1}`, ...body }; qbanks = [...qbanks, b]; return { bank: b }; }
  const qb = r.match(/^question-banks\/([^/]+)(?:\/questions)?$/);
  if (qb) {
    if (r.endsWith('/questions')) { const qq = String(params.search ?? '').toLowerCase(); return page(questions.filter((q, i) => bankOf(q, i) === qb[1] && (!qq || q.stem.toLowerCase().includes(qq))), params); }
    if (method === 'DELETE') qbanks = qbanks.filter((b) => b.id !== qb[1]); else qbanks = qbanks.map((b) => (b.id === qb[1] ? { ...b, ...body } : b));
    return { bank: qbanks.find((b) => b.id === qb[1]) ?? {} };
  }
  if (r === 'questions' && method === 'GET') { const q = String(params.search ?? '').toLowerCase(); const list = questions.filter((x) => !q || x.stem.toLowerCase().includes(q)); const res = page(list, params); return { ...res }; }
  if (r === 'questions' || r === 'questions/bulk' || /^questions\//.test(r)) return { question: { id: 'new' }, imported: Array.isArray(body) ? body.length : 1 };
  if (r === 'students') return page(students.filter((s) => !params.search || `${s.fullName} ${s.email}`.toLowerCase().includes(String(params.search).toLowerCase())), params);
  if (r === 'invitations') return { ok: true };
  if (r === 'library/books' && method === 'GET') return { items: books };
  if (r === 'library/books') { const b = { id: `k${books.length + 1}`, color: '#e8a735', ...body }; books = [...books, b]; return { book: b }; }
  const bk = r.match(/^library\/books\/([^/]+)$/);
  if (bk) { if (method === 'DELETE') books = books.filter((b) => b.id !== bk[1]); else books = books.map((b) => (b.id === bk[1] ? { ...b, ...body } : b)); return { book: books.find((b) => b.id === bk[1]) ?? {} }; }
  if (r === 'payout/verify') return { accountName: 'GRACE ADEBAYO OLUWASEUN' };
  if (r === 'payout') { org = { ...org, payout: { ...org.payout, ...body, status: 'active', accountName: 'GRACE ADEBAYO OLUWASEUN' } }; return { payout: org.payout }; }
  if (r === 'earnings') return { earnings: { totals: { grossKobo: 920000, orgShareKobo: 828000, platformFeeKobo: 92000, last30d: 828000 }, series } };
  if (r === 'payments') return page(payments, params);
  if (r === 'domains' && method === 'GET') return { items: domains };
  if (r === 'domains' && method === 'POST') { const d = body.type === 'subdomain' ? { id: 'd1', type: 'subdomain', hostname: body.hostname, status: 'active', isPrimary: true } : { id: 'd2', type: 'custom', hostname: body.hostname, status: 'pending', records: [{ type: 'CNAME', host: body.hostname, value: 'cname.testflow.com.ng' }, { type: 'TXT', host: `_testflow-verify.${body.hostname}`, value: 'tf-verify=7c1f93aa02' }], expiresAt: 'in 7 days' }; domains = [...domains.filter((x) => x.type !== d.type), d]; return { domain: d }; }
  const dm = r.match(/^domains\/([^/]+)(?:\/verify)?$/);
  if (dm) { if (method === 'DELETE') { domains = domains.filter((d) => d.id !== dm[1]); return {}; } domains = domains.map((d) => (d.id === dm[1] ? { ...d, status: 'active' } : d)); return { domain: domains.find((d) => d.id === dm[1]) }; }
  return undefined;
}

export const WORKSPACE_PREFIXES = ['/api/v1/everybody', '/api/v1/public'];
