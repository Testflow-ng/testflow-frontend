import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Alert, Spinner } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from '../subjects/subjectMeta.js';
import { useHistory } from './useHistory.js';
import HistoryChart from './HistoryChart.jsx';

const scorePill = (score) => {
  if (score >= 70) return 'bg-success/10 text-success';
  if (score >= 50) return 'bg-warning/10 text-warning';
  return 'bg-danger/10 text-danger';
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

function HistoryPage() {
  const { data: sessions, isLoading, isError, error } = useHistory();

  return (
    <section className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
      <h1 className="text-2xl text-foreground-strong">Exam history</h1>
      <p className="mt-1 text-sm text-muted">Your past attempts and scores.</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="md" label="Loading history" className="text-primary" />
          </div>
        ) : isError ? (
          <Alert variant="danger">{error?.message ?? 'Could not load your history.'}</Alert>
        ) : !sessions?.length ? (
          <Alert variant="info">You have not taken any exams yet.</Alert>
        ) : (
          <div className="flex flex-col gap-6">
            <HistoryChart sessions={sessions} />

            <ul className="flex flex-col gap-2">
              {sessions.map((item) => {
                const { Icon, accent } = subjectMeta(item.subjectCode);
                const submitted = item.status === 'submitted';
                return (
                  <li key={item.id}>
                    <Link
                      to={submitted ? `/exam/${item.id}/result` : `/exam/${item.id}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-border-strong hover:bg-surface-strong"
                    >
                      <span
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-lg',
                          accent,
                        )}
                      >
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-medium text-foreground-strong">
                          {item.subjectCode}
                        </p>
                        <p className="text-xs text-muted">
                          {submitted
                            ? `${formatDate(item.submittedAt)} · ${item.correctCount}/${item.totalQuestions}`
                            : 'In progress'}
                        </p>
                      </div>
                      {submitted ? (
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums',
                            scorePill(item.score),
                          )}
                        >
                          {item.score}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                          Resume
                        </span>
                      )}
                      <ChevronRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default HistoryPage;
