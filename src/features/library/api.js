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
  download: (id) => apiClient.get(`/api/library/books/${id}/download`).then((r) => r.data),
  /** Mint (or fetch) the public link for a book — the token is the credential, anyone with it can open the page and file. */
  shareBook: (id) => apiClient.get(`/api/library/books/${id}/share`).then((r) => r.data),
  /** Same for a note; the public page shows every image in reading order. */
  shareNote: (id) => apiClient.get(`/api/library/notes/${id}/share`).then((r) => r.data),
  /** Notes half of the shelf; paged like the books list. */
  listNotes: (params) => apiClient.get('/api/library/notes', { params }).then((r) => r.data),
  /** Note detail; the only place image URLs are handed out, short-lived and signed. */
  getNote: (id) => apiClient.get(`/api/library/notes/${id}`).then((r) => r.data),
};
