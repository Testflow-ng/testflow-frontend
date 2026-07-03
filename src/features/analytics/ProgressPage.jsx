import { Link } from 'react-router-dom';
import { Alert } from '../../components/ui/index.js';
import PageLoader from '../../components/PageLoader.jsx';
import { useStats } from './useStats.js';
import StatCards from './StatCards.jsx';
import SubjectChart from './SubjectChart.jsx';

function ProgressPage() {
  const { data: stats, isLoading, isError, error } = useStats();

  return (
    <section className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
      <h1 className="text-2xl text-foreground-strong">Your progress</h1>
      <p className="mt-1 text-sm text-muted">Scores and trends across your exams.</p>

      <div className="mt-6">
        {isLoading ? (
          <PageLoader label="Loading your progress" />
        ) : isError ? (
          <Alert variant="danger">{error?.message ?? 'Could not load your progress.'}</Alert>
        ) : !stats || stats.totalExams === 0 ? (
          <Alert variant="info">Take your first exam to start tracking your progress.</Alert>
        ) : (
          <div className="flex flex-col gap-5">
            <StatCards stats={stats} />
            <SubjectChart perSubject={stats.perSubject} />
            <Link
              to="/achievements"
              className="text-sm font-medium text-primary hover:underline"
            >
              View achievements
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProgressPage;
