import { useState } from 'react';
import { Plus, Search, Star, X } from 'lucide-react';
import SubjectGrid from './SubjectGrid.jsx';
import CourseSelectionModal from './components/CourseSelectionModal.jsx';
import Screen, { ScreenHeader } from '../../components/layout/Screen.jsx';
import { cn } from '../../utils/cn.js';

const LEVELS = ['all', '100', '200', '300', '400', '500', 'pinned'];

function CoursesPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  return (
    <Screen width="xl">
      <ScreenHeader
        title="Courses"
        subtitle="Browse and practice your subjects"
        action={
          <button
            type="button"
            onClick={() => setIsSelectionModalOpen(true)}
            className="tf-pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-primary/10 px-3.5 text-[13px] font-semibold text-primary active:bg-primary/20"
          >
            <Plus size={16} aria-hidden="true" />
            Manage
          </button>
        }
      />

      <div className="mt-5">
        <div className="relative">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            inputMode="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses"
            aria-label="Search subjects"
            // `type="search"` gets the phone keyboard a Search key, but WebKit also
            // draws its own clear button, which sat right next to ours. Hiding the
            // native one leaves a single, correctly-sized 36px target.
            className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-12 text-base text-foreground-strong outline-none transition-colors placeholder:text-muted focus:border-primary [&::-webkit-search-cancel-button]:appearance-none sm:h-11 sm:text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="tf-pressable absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted active:bg-surface-strong"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {/*
          Filter rail bleeds into the screen gutter so it scrolls edge to edge
          (a chip cut off at the margin is the cue that the row scrolls), while
          the first chip still lines up with the content above it.
        */}
        <div className="tf-rail mt-3 items-center gap-2 pb-1">
          {LEVELS.map((lvl) => {
            const active = filter === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilter(lvl)}
                aria-pressed={active}
                className={cn(
                  'tf-pressable inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-surface text-muted',
                )}
              >
                {lvl === 'pinned' ? (
                  <>
                    <Star
                      size={14}
                      aria-hidden="true"
                      className={cn(active ? 'fill-current' : 'fill-amber-400 text-amber-400')}
                    />
                    My courses
                  </>
                ) : lvl === 'all' ? (
                  'All'
                ) : (
                  `${lvl}L`
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <SubjectGrid
            filter={filter}
            search={search}
            onOpenSelection={() => setIsSelectionModalOpen(true)}
          />
        </div>
      </div>

      <CourseSelectionModal
        open={isSelectionModalOpen}
        onOpenChange={setIsSelectionModalOpen}
      />
    </Screen>
  );
}

export default CoursesPage;
