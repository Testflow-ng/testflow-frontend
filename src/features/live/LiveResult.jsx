import { Banner, SkeletonCard } from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import ResultSummary from '../../components/exam/ResultSummary.jsx';
import Corrections from './Corrections.jsx';
import LiveLeaderboard from './LiveLeaderboard.jsx';
import { useMyResult } from './useLive.js';

const mmss = (s) => (s == null ? null : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`);

/** A participant's result once the host publishes: the score, the standings, and the corrections. */
function LiveResult({ code, title }) {
  const { data: r, isLoading, error } = useMyResult(code, true);

  if (isLoading) return <Screen width="xl"><SkeletonCard className="h-48" /></Screen>;
  if (error) return <Screen width="md"><Banner variant="danger">{error.message ?? 'Could not load your result.'}</Banner></Screen>;

  const percent = r.totalPossible ? Math.max(0, Math.round((r.score / r.totalPossible) * 100)) : 0;
  const total = r.correctCount + r.incorrectCount + r.unansweredCount;
  const board = r.leaderboard ?? [];

  return (
    <Screen width="xl">
      <PageHeader back="/live" title={title ?? r.title} subtitle="Your result" />
      <div className="mt-6 space-y-8">
        <ResultSummary score={percent} correct={r.correctCount} total={total} timeTaken={mmss(r.timeTakenSeconds)} />

        <section aria-labelledby="standings" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="standings" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Standings</h2>
            {r.rank != null && (
              <p className="text-sm font-semibold text-foreground-strong">
                You placed <em className="tf-accent font-normal">#{r.rank}</em> of {board.length}
              </p>
            )}
          </div>
          <LiveLeaderboard rows={board} />
        </section>

        <Corrections corrections={r.corrections} />
      </div>
    </Screen>
  );
}

export default LiveResult;
