import { useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { Alert, SkeletonCard, Button } from '../../components/ui/index.js';
import { useStartExam } from '../exam/useStartExam.js';
import ExamStartDialog from '../exam/ExamStartDialog.jsx';
import ExamCountdown from '../exam/ExamCountdown.jsx';
import { useSubjects } from './useSubjects.js';
import SubjectCard from './SubjectCard.jsx';
import Mascot from '../../components/brand/Mascot.jsx';
import { MOMENTS } from '../../components/brand/mascotMood.js';
import { Plus } from 'lucide-react';

function SubjectGrid({ filter = 'all', search = '', onOpenSelection }) {
  const { user } = useAuth();
  const { data: subjects, isLoading, isError, error } = useSubjects();
  const { start, isStarting, error: startError, pending, enter } = useStartExam();
  const [selected, setSelected] = useState(null);

  if (isLoading) {
    // Skeletons match the real card's height so the layout doesn't jump when
    // data lands.
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="h-44" />
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
        <EmptyState
          title={`No subjects match "${search.trim()}"`}
          body="Try a different course code or title."
        />
      );
    }
    if (filter === 'pinned') {
      return (
        <EmptyState
          icon={<Plus size={30} className="text-primary" aria-hidden="true" />}
          title="Your course list is empty"
          body="Select the courses you are currently offering to keep them easily accessible on your dashboard."
          action={
            <Button size="lg" className="mt-6 px-8" onClick={onOpenSelection}>
              Add my courses
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        title="No subjects found"
        body="Try changing the filter or pinning some courses."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {startError ? <Alert variant="danger">{startError}</Alert> : null}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((subject) => (
          <SubjectCard key={subject.code} subject={subject} onSelect={setSelected} />
        ))}
      </div>

      {/* The dialog closes the moment a session exists, so the countdown is
          not layered over a sheet that is still on screen behind it. */}
      {selected && !pending && (
        <ExamStartDialog
          subject={selected}
          isStarting={isStarting}
          onClose={() => setSelected(null)}
          onConfirm={(config) => start(selected.code, config)}
        />
      )}

      {pending && (
        <ExamCountdown
          subjectCode={pending.subjectCode}
          questionCount={pending.questionCount ?? pending.totalQuestions}
          durationMinutes={pending.durationMinutes}
          onDone={enter}
        />
      )}
    </div>
  );
}

/**
 * One empty-state shape for all three cases. Previously each branch invented
 * its own radius, border weight, padding and type treatment (`rounded-3xl` vs
 * `rounded-[2.5rem]`, uppercase-black vs sentence case), which read as three
 * different products inside one screen.
 */
function EmptyState({ icon, title, body, action, moment = 'emptyCourses' }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-strong px-6 py-12 text-center">
      {/* Flo stands in for the missing content. Rare screen, nothing to read,
          so the character is the most useful thing that can be here. */}
      <Mascot {...MOMENTS[moment]} size={88} className="mx-auto mb-4 text-muted" />
      {icon ? (
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[15px] font-semibold text-foreground-strong">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-[24rem] text-[13px] leading-relaxed text-muted">{body}</p>
      {action}
    </div>
  );
}

export default SubjectGrid;
