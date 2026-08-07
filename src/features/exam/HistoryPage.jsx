import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Alert, SkeletonCard, buttonClasses } from '../../components/ui/index.js';
import { listRowClasses } from '../../components/ui/surfaces.js';
import Screen, { ScreenHeader } from '../../components/layout/Screen.jsx';
import { cn } from '../../utils/cn.js';
import { scorePill } from '../../utils/score.js';
import Mascot from '../../components/brand/Mascot.jsx';
import { MOMENTS } from '../../components/brand/mascotMood.js';
import { subjectMeta } from '../subjects/subjectMeta.js';
import { useHistory } from './useHistory.js';
import HistoryChart from './HistoryChart.jsx';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

function HistoryPage() {
  const { data: sessions, isLoading, isError, error } = useHistory();

  return (
    <Screen width="md">
      <ScreenHeader title="Exam history" subtitle="Your past attempts and scores." />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonCard key={i} className="h-[68px]" />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="danger">
            {error?.message ?? 'Could not load your history.'}
          </Alert>
        ) : !sessions?.length ? (
          <EmptyHistory />
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
                      className={listRowClasses()}
                    >
                      <span
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-xl',
                          accent,
                        )}
                      >
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold leading-snug text-foreground-strong">
                          {item.subjectCode}
                        </p>
                        <p className="mt-0.5 text-[13px] leading-snug text-muted">
                          {submitted
                            ? `${formatDate(item.submittedAt)} · ${item.correctCount}/${item.totalQuestions}`
                            : 'In progress'}
                        </p>
                      </div>
                      {submitted ? (
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-1 text-[15px] font-bold tabular-nums',
                            scorePill(item.score),
                          )}
                        >
                          {item.score}%
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-warning/10 px-2.5 py-1 text-[13px] font-bold text-score-mid">
                          Resume
                        </span>
                      )}
                      <ChevronRight
                        size={16}
                        className="-mr-1 shrink-0 text-muted"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Screen>
  );
}

function EmptyHistory() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-strong px-6 py-12 text-center">
      {/* An empty state is a rare screen with nothing to read, which is exactly
          where a character earns its keep. Flo looks around for the papers that
          are not there yet. */}
      <Mascot {...MOMENTS.emptyHistory} size={92} className="mx-auto mb-4 text-muted" />
      <p className="text-[15px] font-semibold text-foreground-strong">No papers yet</p>
      <p className="mx-auto mt-1.5 max-w-[22rem] text-[13px] leading-relaxed text-muted">
        Sit one and it lands here, with the score and how long you took.
      </p>
      <Link to="/dashboard" className={buttonClasses({ size: 'md', className: 'mt-6' })}>
        Start practicing
      </Link>
    </div>
  );
}

export default HistoryPage;
