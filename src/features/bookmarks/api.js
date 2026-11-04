import apiClient from '../../api/client.js';

/**
 * Saved questions.
 *
 * A question bookmark is not the exam's own "mark for review": that one is a private note to
 * come back to during the sitting and is cleared with the paper. This is a question the
 * student wants to keep .it outlives the attempt and is read back from the profile.
 */
export const bookmarksApi = {
  list: () => apiClient.get('/api/question-bookmarks').then((res) => res.data.bookmarks),
  /* Toggling by question id means the button does not need to know whether it is adding or
     removing: the server is the one place that knows, and it answers with the new state. */
  toggle: (questionId) =>
    apiClient.post('/api/question-bookmarks', { questionId }).then((res) => res.data),
};
