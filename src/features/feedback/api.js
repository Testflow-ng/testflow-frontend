import apiClient from '../../api/client.js';

/**
 * Feedback and platform problems.
 *
 * One resource with two readers: the student reads back what they sent (its status and any
 * reply), the admin reads everyone's at `/admin/feedback`.
 *
 * Not the same as reporting a *question* .that one is about the question itself and lives in
 * `features/exam` (`POST /api/questions/:id/flag`) with its own queue at `/admin/reports`.
 * This is about TestFlow: a broken screen, a missing thing, a good idea.
 */
export const feedbackApi = {
  list: () => apiClient.get('/api/feedback').then((res) => res.data.feedback),
  create: (payload) => apiClient.post('/api/feedback', payload).then((res) => res.data.feedback),
};
