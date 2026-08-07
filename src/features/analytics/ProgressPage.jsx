import { Link } from 'react-router-dom';
import { Award, ChevronRight, TrendingUp } from 'lucide-react';
import { Alert, SkeletonCard, buttonClasses } from '../../components/ui/index.js';
import { cardClasses, listRowClasses } from '../../components/ui/surfaces.js';
import Screen, { ScreenHeader } from '../../components/layout/Screen.jsx';
import { useStats } from './useStats.js';
import StatCards from './StatCards.jsx';
import SubjectChart from './SubjectChart.jsx';

function ProgressPage() {
  const { data: stats, isLoading, isError, error } = useStats();

  return (
    <Screen width="full">
      <ScreenHeader title="Your progress" subtitle="Performance overview and trends." />

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonCard key={i} className="h-[84px]" />
              ))}
            </div>
            <SkeletonCard className="h-56" />
          </div>
        ) : isError ? (
          <Alert variant="danger">
            {error?.message ?? 'Could not load your progress.'}
          </Alert>
        ) : !stats || stats.totalExams === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-strong px-6 py-14 text-center">
            <TrendingUp size={32} className="mx-auto text-muted/30" aria-hidden="true" />
            <h3 className="mt-4 text-[15px] font-semibold text-foreground-strong">No stats yet</h3>
            <p className="mx-auto mt-1.5 max-w-[22rem] text-[13px] leading-relaxed text-muted">
              Complete at least one exam to see your progress analytics.
            </p>
            <Link to="/dashboard" className={buttonClasses({ size: 'md', className: 'mt-6' })}>
              Go to dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <div className="space-y-3 lg:col-span-1">
              <StatCards stats={stats} />
              <Link
                to="/achievements"
                className={listRowClasses({ className: 'justify-between p-4' })}
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Award size={18} aria-hidden="true" />
                  </span>
                  <span className="text-[15px] font-semibold text-foreground-strong">
                    My achievements
                  </span>
                </span>
                <ChevronRight size={17} className="shrink-0 text-muted" aria-hidden="true" />
              </Link>
            </div>
            <div className="lg:col-span-2">
              <div className={cardClasses({ padding: 'lg' })}>
                <h3 className="mb-4 text-[15px] font-bold text-foreground-strong">
                  Subject performance
                </h3>
                <SubjectChart perSubject={stats.perSubject} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}

export default ProgressPage;
