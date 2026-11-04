import { useCallback, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ExamResultPage from './ExamResultPage.jsx';
import PostExamAdGate from '../advertising/PostExamAdGate.jsx';
import { clearAdDue, isAdDue } from '../advertising/adDue.js';

/** /exam/:id/result. Right after a real submission it shows the short ad first; revisiting a result never does. */
function ExamResultRoute() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [gated, setGated] = useState(() => params.get('type') !== 'post-utme' && isAdDue(id));

  const done = useCallback(() => {
    clearAdDue(id);
    setGated(false);
  }, [id]);

  return gated ? <PostExamAdGate onDone={done} /> : <ExamResultPage />;
}

export default ExamResultRoute;
