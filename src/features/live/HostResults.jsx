import { CheckCircle2, Clock, Trophy, Users } from 'lucide-react';
import { Banner, Card, ProgressBar, SkeletonCard } from '../../components/ui/index.js';
import StatCard from '../../components/data/StatCard.jsx';
import LeaderboardRow from '../../components/data/LeaderboardRow.jsx';
import { useDashboard } from './useLive.js';

const fmtTime = (s) => (s == null ? null : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`);

/** Host's view after the exam: totals, ranking and which questions the group found hard. */
function HostResults({ code }) {
  const { data, isLoading, error } = useDashboard(code, true);

  if (isLoading) return <SkeletonCard className="h-64" />;
  if (error) return <Banner variant="danger">{error.message ?? 'Could not load the results.'}</Banner>;

  const { totals, rankings, questionStats } = data;
  const hardest = [...questionStats].sort((a, b) => a.correctRate - b.correctRate).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Approved" value={totals.approved} icon={Users} tone="primary" />
        <StatCard label="Submitted" value={totals.submitted} icon={CheckCircle2} tone="sage" />
        <StatCard label="Timed out" value={totals.timedOut} icon={Clock} tone="warning" />
        <StatCard label="Did not start" value={totals.noShow} icon={Trophy} tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="ranking">
          <h2 id="ranking" className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Ranking</h2>
          <div className="space-y-2">
            {rankings.length === 0 && <p className="text-sm text-muted">No attempts yet.</p>}
            {rankings.map((r, i) => (
              <LeaderboardRow
                key={r.userId}
                rank={r.rank ?? i + 1}
                name={r.displayName}
                score={r.score != null ? r.score : '-'}
                detail={[r.accuracy != null ? `${r.accuracy}% accuracy` : null, fmtTime(r.timeTakenSeconds)].filter(Boolean).join(' · ') || r.attemptStatus}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="hard">
          <h2 id="hard" className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Hardest questions</h2>
          <Card className="space-y-4">
            {hardest.length === 0 && <p className="text-sm text-muted">Question stats show up once people submit.</p>}
            {hardest.map((q) => (
              <div key={q.questionId}>
                <p className="mb-1.5 line-clamp-2 text-sm text-foreground-strong">{q.stem}</p>
                <ProgressBar value={q.correctRate} tone={q.correctRate >= 70 ? 'success' : q.correctRate >= 50 ? 'warning' : 'danger'} size="sm" label={`${q.correct} of ${q.attempts} correct`} showValue />
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}

export default HostResults;
