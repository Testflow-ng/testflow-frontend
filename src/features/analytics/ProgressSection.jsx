import { Link } from 'react-router-dom';
import { Alert, Spinner } from '../../components/ui/index.js';
import { useStats } from './useStats.js';
import StatCards from './StatCards.jsx';
import SubjectChart from './SubjectChart.jsx';
import Achievements from './Achievements.jsx';

function ProgressSection() {
  const { data: stats, isLoading, isError } = useStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" label="Loading your progress" className="text-primary" />
      </div>
    );
  }

  // Non-blocking: a failed load shows a small notice, not a disguised empty state.
  if (isError) {
    return <Alert variant="warning">Couldn&apos;t load your progress right now.</Alert>;
  }
  if (!stats) {
    return null;
  }

  if (stats.totalExams === 0) {
    return <Alert variant="info">Take your first exam to start tracking your progress.</Alert>;
  }

  return (
    <div className="flex flex-col gap-5">
      <StatCards stats={stats} />
      <SubjectChart perSubject={stats.perSubject} />
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground-strong">Achievements</h3>
          <Link to="/history" className="text-sm font-medium text-primary hover:underline">
            View history
          </Link>
        </div>
        <Achievements stats={stats} />
      </div>
    </div>
  );
}

export default ProgressSection;
