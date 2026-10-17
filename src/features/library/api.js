import apiClient from '../../api/client.js';

/**
 * Library endpoints. The contracts are written up in `docs/library-api.md`;
 * the dev mock serves the same shapes from `src/dev/mockApi.js`.
 */
export const libraryApi = {
  /** Paged shelf. `{ q, page, limit, filter }`; returns `{ books, page, pageCount, total }`. */
  listBooks: (params) => apiClient.get('/api/library/books', { params }).then((r) => r.data),
  getBook: (id) => apiClient.get(`/api/library/books/${id}`).then((r) => r.data.book),
  /** Every book the student has opened, newest first, with its progress. */
  reading: () => apiClient.get('/api/library/reading').then((r) => r.data.reading ?? []),
  /** One page of readable content, for the reader. */
  pages: (id, page) => apiClient.get(`/api/library/books/${id}/pages`, { params: { page } }).then((r) => r.data),
  setBookmark: (id) => apiClient.post(`/api/library/books/${id}/bookmark`).then((r) => r.data),
  saveProgress: (id, body) => apiClient.put(`/api/library/books/${id}/progress`, body).then((r) => r.data.progress),
  /** Returns the short-lived file URL; the caller saves it. */
  download: (id) => apiClient.get(`/api/library/books/${id}/download`).then((r) => r.data),
};
