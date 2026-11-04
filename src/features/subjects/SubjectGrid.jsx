import { useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { Banner, Button, EmptyState, SkeletonCard } from '../../components/ui/index.js';
import { useStartExam } from '../exam/useStartExam.js';
import ExamStartDialog from '../exam/ExamStartDialog.jsx';
import ExamCountdown from '../exam/ExamCountdown.jsx';
import { useSubjects } from './useSubjects.js';
import SubjectCard from './SubjectCard.jsx';

function SubjectGrid({ filter = 'all', search = '', onOpenSelection }) {
  const { user } = useAuth();
  const { data: subjects, isLoading, isError, error } = useSubjects();
  const { start, isStarting, error: startError, pending, enter } = useStartExam();
  const [selected, setSelected] = useState(null);

  if (isLoading) {
    // Skeletons match the real card's height so the layout doesn't jump when
    // data lands.
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="h-44" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <Banner variant="danger">{error?.message ?? 'Could not load subjects.'}</Banner>;
  }

  const query = search.trim().toLowerCase();
  const filteredSubjects =
    subjects
      ?.filter((s) => {
        if (filter === 'pinned') return user?.pinnedSubjects?.includes(s.id);
        if (filter !== 'all') return String(s.level) === filter;
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
          mood="thinking"
          title={`No subjects match "${search.trim()}"`}
          description="Try a different course code or title."
        />
      );
    }
    if (filter === 'pinned') {
      return (
        <EmptyState
          mood="encouraging"
          title="Your course list is empty"
          description="Pick the courses you are offering this semester and they appear here and in your sidebar."
          action={<Button onClick={onOpenSelection}>Add my courses</Button>}
        />
      );
    }

    return (
      <EmptyState
        mood="thinking"
        title="No subjects found"
        description="Try changing the filter or pinning some courses."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {startError ? <Banner variant="danger">{startError}</Banner> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

export default SubjectGrid;
