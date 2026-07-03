import { Link } from 'react-router-dom';
import { Alert, buttonClasses } from '../../components/ui/index.js';
import PageLoader from '../../components/PageLoader.jsx';
import { useStats } from './useStats.js';
import StatCards from './StatCards.jsx';
import SubjectChart from './SubjectChart.jsx';

function ProgressPage() {
  const { data: stats, isLoading, isError, error } = useStats();

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground-strong">Your progress</h1>
        <p className="mt-1 text-muted">A detailed overview of your academic performance and trends.</p>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <PageLoader label="Loading your progress" />
        ) : isError ? (
          <Alert variant="danger">{error?.message ?? 'Could not load your progress.'}</Alert>
        ) : !stats || stats.totalExams === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
             <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <StatIcon className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-foreground-strong">No stats yet</h3>
             <p className="text-muted mt-2 mb-8">You need to complete at least one exam to see your progress analytics.</p>
             <Link
                to="/dashboard"
                className={buttonClasses({ size: 'lg' })}
              >
                Go to Dashboard
              </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
               <StatCards stats={stats} />
               <Link
                to="/achievements"
                className="flex items-center justify-between p-5 rounded-xl border border-border bg-surface hover:bg-surface-strong transition-colors"
              >
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                     <AwardIcon className="w-5 h-5" />
                   </div>
                   <span className="font-bold text-foreground-strong">My Achievements</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted" />
              </Link>
            </div>
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="text-lg font-bold text-foreground-strong mb-6">Subject Performance</h3>
                  <SubjectChart perSubject={stats.perSubject} />
               </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  );
}

function AwardIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  );
}

function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  );
}

export default ProgressPage;
