import { useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { Alert, SkeletonCard, Button } from '../../components/ui/index.js';
import { useStartExam } from '../exam/useStartExam.js';
import ExamStartDialog from '../exam/ExamStartDialog.jsx';
import { useSubjects } from './useSubjects.js';
import SubjectCard from './SubjectCard.jsx';
import { Plus } from 'lucide-react';

function SubjectGrid({ filter = 'all', search = '', onOpenSelection }) {
  const { user } = useAuth();
  const { data: subjects, isLoading, isError, error } = useSubjects();
  const { start, isStarting, error: startError } = useStartExam();
  const [selected, setSelected] = useState(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <Alert variant="danger">{error?.message ?? 'Could not load subjects.'}</Alert>;
  }

  const query = search.trim().toLowerCase();
  const filteredSubjects =
    subjects
      ?.filter((s) => {
        if (filter === 'pinned') return user?.pinnedSubjects?.includes(s.id);
        if (filter !== 'all') return s.level === filter;
        return true;
      })
      .filter((s) => {
        if (!query) return true;
        return (
          s.code?.toLowerCase().includes(query) ||
          s.title?.toLowerCase().includes(query)
        );
      }) || [];

  if (!filteredSubjects.length) {
    if (query) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-surface-strong py-16 text-center">
          <p className="text-sm font-semibold text-foreground-strong">
            No subjects match "{search.trim()}"
          </p>
          <p className="mt-1 text-xs text-muted">
            Try a different course code or title.
          </p>
        </div>
      );
    }
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
