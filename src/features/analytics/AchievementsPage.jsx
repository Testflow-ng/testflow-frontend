import { Alert, SkeletonCard } from '../../components/ui/index.js';
import Screen, { ScreenHeader } from '../../components/layout/Screen.jsx';
import { useStats } from './useStats.js';
import Achievements from './Achievements.jsx';

function AchievementsPage() {
  const { data: stats, isLoading, isError, error } = useStats();

  return (
    <Screen width="md">
      <ScreenHeader title="Achievements" subtitle="Badges you earn as you practice." />

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {Array.from({ length: 9 }, (_, i) => (
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
    </Screen>
  );
}

export default AchievementsPage;
