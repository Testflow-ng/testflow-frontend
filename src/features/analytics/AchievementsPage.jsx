import { Alert, SkeletonCard } from '../../components/ui/index.js';
import { useStats } from './useStats.js';
import Achievements from './Achievements.jsx';

function AchievementsPage() {
  const { data: stats, isLoading, isError, error } = useStats();

  return (
    <section className="mx-auto w-full max-w-xl flex-1 px-5 pb-28 pt-6 lg:pb-8">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
        Achievements
      </h1>
      <p className="mt-1 text-xs text-muted">
        Badges you earn as you practice.
      </p>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <SkeletonCard key={i} className="h-24" />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="danger">
            {error?.message ?? 'Could not load achievements.'}
          </Alert>
        ) : stats ? (
          <Achievements stats={stats} />
        ) : null}
      </div>
    </section>
  );
}

export default AchievementsPage;
