import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from './api.js';

/** Start (or resume) a practice exam for a subject, then navigate into it. */
export function useStartExam() {
  const navigate = useNavigate();
  const [startingCode, setStartingCode] = useState(null);
  const [error, setError] = useState(null);

  const start = async (subjectCode) => {
    setStartingCode(subjectCode);
    setError(null);
    try {
      const session = await examApi.start({ subject: subjectCode });
      navigate(`/exam/${session.id}`);
    } catch (caught) {
      setError(caught.message ?? 'Could not start the exam. Please try again.');
      setStartingCode(null);
    }
  };

  return { start, startingCode, error };
}
