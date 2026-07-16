import { useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { Alert, Spinner, Button } from '../../components/ui/index.js';
import { useStartExam } from '../exam/useStartExam.js';
import ExamStartDialog from '../exam/ExamStartDialog.jsx';
import { useSubjects } from './useSubjects.js';
import SubjectCard from './SubjectCard.jsx';
import { Plus } from 'lucide-react';

function SubjectGrid({ filter = 'all', onOpenSelection }) {
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
    if (filter === 'pinned') {
      return (
        <div className="text-center py-16 bg-surface-strong rounded-[2.5rem] border-2 border-dashed border-border p-8">
           <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="text-primary w-8 h-8" />
           </div>
           <h3 className="text-lg font-black text-foreground-strong uppercase tracking-tight">Your Course List is Empty</h3>
           <p className="text-xs text-muted mt-2 max-w-xs mx-auto leading-relaxed">
             Select the courses you are currently offering to keep them easily accessible on your dashboard.
           </p>
           <Button
             variant="primary"
             className="mt-8 rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]"
             onClick={onOpenSelection}
           >
             Add My Courses
           </Button>
        </div>
      );
    }

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
