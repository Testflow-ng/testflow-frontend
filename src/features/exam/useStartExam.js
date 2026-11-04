import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from './api.js';

/**
 * Start (or resume) a practice exam with a chosen config.
 *
 * The hook creates the session but no longer navigates immediately. It parks
 * the created session in `pending` and hands the caller an `enter()` to make
 * the jump, so a countdown can sit between the two without this hook needing
 * to know anything about it.
 *
 * The session exists on the server the moment `start` resolves, so the pause
 * costs nothing: the timer is driven by the server's `expiresAt`, not by when
 * the first question paints.
 */
export function useStartExam() {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);

  const start = async (subjectCode, config = {}) => {
    setIsStarting(true);
    setError(null);
    try {
      const session = await examApi.start({ subject: subjectCode, ...config });
      setPending({ ...session, subjectCode, ...config });
    } catch (caught) {
      setError(caught.message ?? 'Could not start the exam. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  /* Replaces the history entry so Back from inside the exam does not land on
     the countdown and start it over. */
  const enter = useCallback(() => {
    if (!pending) return;
    navigate(`/exam/${pending.id}`, { replace: true });
  }, [pending, navigate]);

  return { start, isStarting, error, pending, enter };
}
