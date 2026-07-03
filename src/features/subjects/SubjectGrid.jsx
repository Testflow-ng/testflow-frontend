import { Alert, Spinner } from '../../components/ui/index.js';
import { useStartExam } from '../exam/useStartExam.js';
import { useSubjects } from './useSubjects.js';
import SubjectCard from './SubjectCard.jsx';

function SubjectGrid() {
  const { data: subjects, isLoading, isError, error } = useSubjects();
  const { start, startingCode, error: startError } = useStartExam();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="md" label="Loading subjects" className="text-primary" />
      </div>
    );
  }

  if (isError) {
    return <Alert variant="danger">{error?.message ?? 'Could not load subjects.'}</Alert>;
  }

  if (!subjects?.length) {
    return <Alert variant="info">No subjects are available yet.</Alert>;
  }

  return (
    <div className="flex flex-col gap-3">
      {startError ? <Alert variant="danger">{startError}</Alert> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.code}
            subject={subject}
            onStart={start}
            isStarting={startingCode === subject.code}
          />
        ))}
      </div>
    </div>
  );
}

export default SubjectGrid;
