import apiClient from '../../api/client.js';

const base = '/api/v1/everybody';
const unwrap = (res, key) => res.data?.[key] ?? res.data?.items ?? res.data;
const org = (id) => `${base}/organizations/${id}`;
const form = (file) => {
  const f = new FormData();
  f.append('file', file);
  return f;
};

/** Everything the organisation console calls. Shapes follow backend/docs/everybody and docs/frontend/EVERYONE_REQUIREMENTS.md. */
export const wsApi = {
  organizations: () => apiClient.get(`${base}/organizations`).then((r) => unwrap(r, 'organizations')),
  createOrg: (body) => apiClient.post(`${base}/organizations`, body).then((r) => unwrap(r, 'organization')),
  updateOrg: (id, body) => apiClient.patch(org(id), body).then((r) => unwrap(r, 'organization')),

  site: (id) => apiClient.get(`${org(id)}/site`).then((r) => unwrap(r, 'site')),
  saveSite: (id, body) => apiClient.patch(`${org(id)}/site`, body).then((r) => unwrap(r, 'site')),
  publishSite: (id) => apiClient.post(`${org(id)}/site/publish`).then((r) => r.data),
  uploadSiteImage: (id, file) => apiClient.post(`${org(id)}/site/assets`, form(file), { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => unwrap(r, 'asset').url),

  exam: (id, examId) => apiClient.get(`${org(id)}/exams/${examId}`).then((r) => unwrap(r, 'exam')),
  examQuestions: (id, examId) => apiClient.get(`${org(id)}/exams/${examId}/questions`).then((r) => unwrap(r, 'items')),
  setExamQuestions: (id, examId, questionIds) => apiClient.put(`${org(id)}/exams/${examId}/questions`, { questionIds }).then((r) => r.data),
  examResults: (id, examId) => apiClient.get(`${org(id)}/exams/${examId}/results`).then((r) => r.data),
  posts: (id) => apiClient.get(`${org(id)}/community/posts`).then((r) => unwrap(r, 'items')),
  savePost: (id, post) => (post.id ? apiClient.patch(`${org(id)}/community/posts/${post.id}`, post) : apiClient.post(`${org(id)}/community/posts`, post)).then((r) => unwrap(r, 'post')),
  deletePost: (id, postId) => apiClient.delete(`${org(id)}/community/posts/${postId}`).then((r) => r.data),
  flags: (id) => apiClient.get(`${org(id)}/question-flags`).then((r) => r.data),
  updateFlag: (id, flagId, body) => apiClient.patch(`${org(id)}/question-flags/${flagId}`, body).then((r) => unwrap(r, 'flag')),
  exams: (id, params) => apiClient.get(`${org(id)}/exams`, { params }).then((r) => unwrap(r, 'items')),
  saveExam: (id, exam) => (exam.id ? apiClient.patch(`${org(id)}/exams/${exam.id}`, exam) : apiClient.post(`${org(id)}/exams`, exam)).then((r) => unwrap(r, 'exam')),
  setExamPublished: (id, examId, publish) => apiClient.post(`${org(id)}/exams/${examId}/${publish ? 'publish' : 'unpublish'}`).then((r) => r.data),

  questions: (id, params) => apiClient.get(`${org(id)}/questions`, { params }).then((r) => r.data),
  saveQuestion: (id, q) => (q.id ? apiClient.patch(`${org(id)}/questions/${q.id}`, q) : apiClient.post(`${org(id)}/questions`, q)).then((r) => unwrap(r, 'question')),
  deleteQuestion: (id, qid) => apiClient.delete(`${org(id)}/questions/${qid}`).then((r) => r.data),
  bulkQuestions: (id, rows, target = {}) => apiClient.post(`${org(id)}/questions/bulk`, rows, { params: target.examId || target.bankId ? target : undefined }).then((r) => r.data),
  questionBanks: (id) => apiClient.get(`${org(id)}/question-banks`).then((r) => unwrap(r, 'items')),
  saveBank: (id, bank) => (bank.id ? apiClient.patch(`${org(id)}/question-banks/${bank.id}`, bank) : apiClient.post(`${org(id)}/question-banks`, bank)).then((r) => unwrap(r, 'bank')),
  deleteBank: (id, bankId) => apiClient.delete(`${org(id)}/question-banks/${bankId}`).then((r) => r.data),
  bankQuestions: (id, bankId, params) => apiClient.get(`${org(id)}/question-banks/${bankId}/questions`, { params }).then((r) => r.data),
  uploadQuestionImage: (id, file) => apiClient.post(`${org(id)}/questions/assets`, form(file), { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => unwrap(r, 'asset').url),

  students: (id, params) => apiClient.get(`${org(id)}/students`, { params }).then((r) => r.data),
  student: (id, studentId) => apiClient.get(`${org(id)}/students/${studentId}`).then((r) => r.data),
  invite: (id, body) => apiClient.post(`${org(id)}/invitations`, body).then((r) => r.data),

  books: (id) => apiClient.get(`${org(id)}/library/books`).then((r) => unwrap(r, 'items')),
  saveBook: (id, book) => (book.id ? apiClient.patch(`${org(id)}/library/books/${book.id}`, book) : apiClient.post(`${org(id)}/library/books`, book)).then((r) => unwrap(r, 'book')),
  deleteBook: (id, bookId) => apiClient.delete(`${org(id)}/library/books/${bookId}`).then((r) => r.data),

  banks: () => apiClient.get(`${base}/banks`).then((r) => unwrap(r, 'banks')),
  verifyAccount: (id, body) => apiClient.post(`${org(id)}/payout/verify`, body).then((r) => r.data),
  savePayout: (id, body) => apiClient.put(`${org(id)}/payout`, body).then((r) => unwrap(r, 'payout')),
  earnings: (id) => apiClient.get(`${org(id)}/earnings`).then((r) => unwrap(r, 'earnings')),
  payments: (id, params) => apiClient.get(`${org(id)}/payments`, { params }).then((r) => r.data),

  domains: (id) => apiClient.get(`${org(id)}/domains`).then((r) => unwrap(r, 'items')),
  checkSubdomain: (name) => apiClient.get(`${base}/domains/check-subdomain`, { params: { name } }).then((r) => r.data),
  addDomain: (id, body) => apiClient.post(`${org(id)}/domains`, body).then((r) => unwrap(r, 'domain')),
  verifyDomain: (id, domainId) => apiClient.post(`${org(id)}/domains/${domainId}/verify`).then((r) => unwrap(r, 'domain')),
  removeDomain: (id, domainId) => apiClient.delete(`${org(id)}/domains/${domainId}`).then((r) => r.data),

  subscription: (id) => apiClient.get(`${base}/subscription`, { params: { organizationId: id } }).then((r) => unwrap(r, 'subscription')),
  plans: () => apiClient.get(`${base}/plans`).then((r) => unwrap(r, 'plans')),
  /** Upgrade (a checkout for the prorated difference) or a scheduled downgrade (no payment, no url). */
  changePlan: (subId, planKey) => apiClient.post(`${base}/subscriptions/${subId}/upgrade`, { planKey }, { headers: { 'Idempotency-Key': crypto.randomUUID() } }).then((r) => r.data),
  renew: (subId) => apiClient.post(`${base}/subscriptions/${subId}/renew`, {}, { headers: { 'Idempotency-Key': crypto.randomUUID() } }).then((r) => r.data),
  verifyPayment: (reference) => apiClient.get(`${base}/payments/verify`, { params: { reference } }).then((r) => r.data),
  subscriptionPayments: (id) => apiClient.get(`${base}/payments`, { params: { organizationId: id } }).then((r) => unwrap(r, 'items')),
};
