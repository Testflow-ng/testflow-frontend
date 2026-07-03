import { Alert } from '../../components/ui/index.js';
import PageLoader from '../../components/PageLoader.jsx';
import { useStats } from './useStats.js';
import Achievements from './Achievements.jsx';

function AchievementsPage() {
  const { data: stats, isLoading, isError, error } = useStats();

  return (
    <section className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
      <h1 className="text-2xl text-foreground-strong">Achievements</h1>
      <p className="mt-1 text-sm text-muted">Badges you earn as you practice.</p>

      <div className="mt-6">
        {isLoading ? (
          <PageLoader label="Loading achievements" />
        ) : isError ? (
          <Alert variant="danger">{error?.message ?? 'Could not load achievements.'}</Alert>
        ) : stats ? (
          <Achievements stats={stats} />
        ) : null}
      </div>
    </section>
  );
}

export default AchievementsPage;
