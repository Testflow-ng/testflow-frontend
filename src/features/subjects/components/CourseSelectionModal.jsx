import { useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { useSubjects, useTogglePin } from '../useSubjects.js';
import { Modal, Button, Spinner, Input } from '../../../components/ui/index.js';
import { Star, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn.js';

function CourseSelectionModal({ open, onOpenChange }) {
  const { user } = useAuth();
  const { data: subjects, isLoading } = useSubjects();
  const { mutate: togglePin } = useTogglePin();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const filtered = subjects?.filter(s => {
    const matchesSearch = s.code.toLowerCase().includes(search.toLowerCase()) ||
                          s.title.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  }) || [];

  const pinnedCount = user?.pinnedSubjects?.length || 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Organize your courses"
      description="Select the courses you are offering this semester to pin them to your dashboard."
      footer={
        <Button size="lg" onClick={() => onOpenChange(false)}>
          Done selecting ({pinnedCount})
        </Button>
      }
    >
      <div className="space-y-4 py-1">
        {/*
          Search + filters stick to the top of the sheet's scroll region, so the
          list can be scrolled without losing the controls that filter it.
        */}
        <div className="sticky top-0 z-10 -mx-1 flex flex-col gap-2.5 bg-surface px-1 pb-2 pt-1">
          <Input
            placeholder="Search course code or title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leadingAdornment={<Search size={16} className="text-muted" />}
          />
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {['all', '100', '200', '300', '400', '500'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                aria-pressed={levelFilter === lvl}
                className={cn(
                  'tf-pressable inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-[12px] font-semibold',
                  levelFilter === lvl
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface-strong text-muted',
                )}
              >
                {lvl === 'all' ? 'All levels' : `${lvl}L`}
              </button>
            ))}
          </div>
        </div>

        {/* Course list. The sheet owns scrolling; no nested scroll container. */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No courses match your search.</p>
          ) : (
            filtered.map(subject => {
              const isPinned = user?.pinnedSubjects?.includes(subject.id);
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => togglePin(subject.id)}
                  aria-pressed={Boolean(isPinned)}
                  className={cn(
                    'tf-pressable flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left',
                    isPinned ? 'border-primary bg-primary/5' : 'border-border bg-surface',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold',
                        isPinned ? 'bg-primary text-primary-foreground' : 'bg-surface-strong text-muted',
                      )}
                    >
                      {subject.code.substring(0, 3)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-bold text-foreground-strong">
                        {subject.code}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] font-medium text-muted">
                        {subject.title}
                      </span>
                    </span>
                  </span>
                  {isPinned ? (
                    <CheckCircle2 size={22} className="shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <Star size={20} className="shrink-0 text-border" aria-hidden="true" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CourseSelectionModal;
