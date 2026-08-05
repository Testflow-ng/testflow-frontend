import { useState } from 'react';
import { Plus, Search, Star, X } from 'lucide-react';
import SubjectGrid from './SubjectGrid.jsx';
import CourseSelectionModal from './components/CourseSelectionModal.jsx';
import { cn } from '../../utils/cn.js';

const LEVELS = ['all', '100', '200', '300', '400', '500', 'pinned'];

function CoursesPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  return (
    <section className="mx-auto w-full max-w-4xl flex-1 px-5 pb-28 pt-6 lg:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground-strong">Courses</h1>
          <p className="mt-0.5 text-xs text-muted">Browse and practice your subjects</p>
        </div>
        <button
          onClick={() => setIsSelectionModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
        >
          <Plus size={14} />
          Manage
        </button>
      </div>

      <div className="mt-5">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses"
            aria-label="Search subjects"
            className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-10 text-sm text-foreground-strong outline-none transition-colors placeholder:text-muted focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {LEVELS.map((lvl) => {
            const active = filter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-surface text-muted hover:text-foreground-strong',
                )}
              >
                {lvl === 'pinned' ? (
                  <>
                    <Star
                      size={12}
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

        <div className="mt-3">
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
    </section>
  );
}

export default CoursesPage;
