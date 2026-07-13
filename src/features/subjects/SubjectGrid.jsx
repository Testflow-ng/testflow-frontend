import { useState } from 'react';
import { Alert, Spinner } from '../../components/ui/index.js';
import { useStartExam } from '../exam/useStartExam.js';
import ExamStartDialog from '../exam/ExamStartDialog.jsx';
import { useSubjects } from './useSubjects.js';
import SubjectCard from './SubjectCard.jsx';

import { useAuth } from '../auth/useAuth.js';

function SubjectGrid({ filter = 'all' }) {
  const { user } = useAuth();
  const { data: subjects, isLoading, isError, error } = useSubjects();
  const { start, isStarting, error: startError } = useStartExam();
  const [selected, setSelected] = useState(null);

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

  const filteredSubjects = subjects?.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'pinned') return user?.pinnedSubjects?.includes(s.id);
    return s.level === filter;
  }) || [];

  if (!filteredSubjects.length) {
    return (
      <div className="text-center py-16 bg-surface-strong rounded-3xl border-2 border-dashed border-border">
         <p className="text-sm font-bold text-muted uppercase tracking-widest">No subjects found</p>
         <p className="text-xs text-muted mt-1">Try changing the filter or pinning some courses.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {startError ? <Alert variant="danger">{startError}</Alert> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((subject) => (
          <SubjectCard key={subject.code} subject={subject} onSelect={setSelected} />
        ))}
      </div>

      {selected && (
        <ExamStartDialog
          subject={selected}
          isStarting={isStarting}
          onClose={() => setSelected(null)}
          onConfirm={(config) => start(selected.code, config)}
        />
      )}
    </div>
  );
}

export default SubjectGrid;
