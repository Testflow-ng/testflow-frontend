import { useState } from 'react';
import { Flame, Plus, Search, Star, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import SubjectGrid from '../subjects/SubjectGrid.jsx';
import { useStats } from '../analytics/useStats.js';
import Avatar from '../../components/ui/Avatar.jsx';
import UsernameSetupModal from '../auth/components/UsernameSetupModal.jsx';
import CourseSelectionModal from '../subjects/components/CourseSelectionModal.jsx';
import { cn } from '../../utils/cn.js';

const LEVELS = ['all', '100', '200', '300', '400', '500', 'pinned'];

function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useStats();
  const [setupDismissed, setSetupDismissed] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const showSetup = Boolean(user && !user.username) && !setupDismissed;

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
      <UsernameSetupModal open={showSetup} onComplete={() => setSetupDismissed(true)} />
      <CourseSelectionModal
        open={isSelectionModalOpen}
        onOpenChange={setIsSelectionModalOpen}
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} size="lg" />
          <div>
            <p className="text-sm text-muted">
              {user.username ? `@${user.username}` : 'Welcome back'}
            </p>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl">
              Hello, {user.fullName.split(' ')[0]}
            </h1>
          </div>
        </div>

        {user.streakCount > 0 && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-warning/12 px-3 py-1.5 text-sm font-semibold text-foreground-strong">
            <Flame size={16} className="text-warning" />
            {user.streakCount} day streak
          </span>
        )}
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-surface py-4">
          <StatCell label="Average" value={`${stats.averageScore}%`} />
          <StatCell label="Exams" value={stats.totalExams} />
          <StatCell label="Best" value={`${stats.bestScore}%`} />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a course by code or title"
            aria-label="Search subjects"
            className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-11 text-sm text-foreground-strong outline-none transition-colors placeholder:text-muted focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {LEVELS.map((lvl) => {
            const active = filter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-surface text-muted hover:text-foreground-strong',
                )}
              >
                {lvl === 'pinned' ? (
                  <>
                    <Star
                      size={14}
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

          <button
            onClick={() => setIsSelectionModalOpen(true)}
            title="Add or manage courses"
            aria-label="Add or manage courses"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-primary/40 text-primary transition-colors hover:bg-primary/5"
          >
            <Plus size={18} />
          </button>
        </div>

        <SubjectGrid
          filter={filter}
          search={search}
          onOpenSelection={() => setIsSelectionModalOpen(true)}
        />
      </div>
    </section>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-heading text-2xl font-extrabold text-foreground-strong">
        {value}
      </span>
      <span className="mt-0.5 text-xs text-muted">{label}</span>
    </div>
  );
}

export default DashboardPage;
