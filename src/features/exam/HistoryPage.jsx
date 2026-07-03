import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Alert, Spinner } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';
import { useHistory } from './useHistory.js';

const scoreTone = (score) => {
  if (score >= 70) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;

function HistoryPage() {
  const { data: sessions, isLoading, isError, error } = useHistory();

  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
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
          <ul className="flex flex-col gap-2">
            {sessions.map((item) => {
              const submitted = item.status === 'submitted';
              return (
                <li key={item.id}>
                  <Link
                    to={submitted ? `/exam/${item.id}/result` : `/exam/${item.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-strong"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-medium text-muted">{item.subjectCode}</p>
                      <p className="text-[11px] text-muted">
                        {submitted ? formatDate(item.submittedAt) : 'In progress'}
                      </p>
                    </div>
                    {submitted ? (
                      <span className={cn('text-sm font-semibold tabular-nums', scoreTone(item.score))}>
                        {item.score}%
                      </span>
                    ) : (
                      <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                        Resume
                      </span>
                    )}
                    <ChevronRight size={16} className="text-muted" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default HistoryPage;
