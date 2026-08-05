import { Link } from 'react-router-dom';
import { Award, ChevronRight, TrendingUp } from 'lucide-react';
import { Alert, SkeletonCard, buttonClasses } from '../../components/ui/index.js';
import { useStats } from './useStats.js';
import StatCards from './StatCards.jsx';
import SubjectChart from './SubjectChart.jsx';

function ProgressPage() {
  const { data: stats, isLoading, isError, error } = useStats();

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-6 lg:pb-8">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
        Your progress
      </h1>
      <p className="mt-1 text-xs text-muted">
        Performance overview and trends.
      </p>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <SkeletonCard key={i} className="h-24" />
              ))}
            </div>
            <SkeletonCard className="h-56" />
          </div>
        ) : isError ? (
          <Alert variant="danger">
            {error?.message ?? 'Could not load your progress.'}
          </Alert>
        ) : !stats || stats.totalExams === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-strong py-16 text-center">
            <TrendingUp size={32} className="mx-auto text-muted/30" />
            <h3 className="mt-4 text-sm font-bold text-foreground-strong">
              No stats yet
            </h3>
            <p className="mt-1 text-xs text-muted">
              Complete at least one exam to see your progress analytics.
            </p>
            <Link
              to="/dashboard"
              className={buttonClasses({ size: 'md', className: 'mt-6' })}
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-1">
              <StatCards stats={stats} />
              <Link
                to="/achievements"
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-strong"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Award size={18} />
                  </div>
                  <span className="text-sm font-bold text-foreground-strong">
                    My Achievements
                  </span>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </Link>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="text-sm font-bold text-foreground-strong mb-4">
                  Subject Performance
                </h3>
                <SubjectChart perSubject={stats.perSubject} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProgressPage;
