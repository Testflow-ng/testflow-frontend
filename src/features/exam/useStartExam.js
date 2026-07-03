import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from './api.js';

/** Start (or resume) a practice exam with a chosen config, then navigate into it. */
export function useStartExam() {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);

  const start = async (subjectCode, config = {}) => {
    setIsStarting(true);
    setError(null);
    try {
      const session = await examApi.start({ subject: subjectCode, ...config });
      navigate(`/exam/${session.id}`);
    } catch (caught) {
      setError(caught.message ?? 'Could not start the exam. Please try again.');
      setIsStarting(false);
    }
  };

  return { start, isStarting, error };
}
