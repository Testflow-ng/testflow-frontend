import { useState } from 'react';
import { CheckCircle2, Clock, Trophy, Users } from 'lucide-react';
import { Banner, Card, Modal, ProgressBar, SkeletonCard } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import StatCard from '../../components/data/StatCard.jsx';
import Corrections from './Corrections.jsx';
import LiveLeaderboard from './LiveLeaderboard.jsx';
import { useDashboard, useParticipantResult } from './useLive.js';

const mmss = (s) => (s == null ? null : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`);

/** One participant's paper, opened from the board: the same marked paper they see, plus their place. */
function ParticipantPaper({ code, participant, onClose }) {
  const { data, isLoading, error } = useParticipantResult(code, participant?.userId, Boolean(participant));
  const stats = [
    { label: 'Score', value: data ? `${data.score ?? '-'} pts` : null },
    { label: 'Accuracy', value: data?.accuracy != null ? `${data.accuracy}%` : '-' },
    { label: 'Time', value: mmss(data?.timeTakenSeconds) ?? '-' },
    { label: 'Rank', value: data?.rank != null ? `#${data.rank}` : '-' },
  ];

  return (
    <Modal
      open={Boolean(participant)}
      onOpenChange={(o) => !o && onClose()}
      title={participant?.displayName ?? 'Participant'}
      description="Their paper, marked with corrections."
      size="lg"
    >
      {participant &&
        (isLoading ? (
          <SkeletonCard className="h-40" />
        ) : error ? (
          <Banner variant="danger">{error.message ?? 'Could not load this paper.'}</Banner>
        ) : (
          <div className="pb-2">
            <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-surface-strong p-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{s.label}</p>
                  <p className="font-heading text-xl font-extrabold tabular-nums text-foreground-strong">{s.value}</p>
                </div>
              ))}
            </div>
            <Corrections corrections={data.corrections} />
          </div>
        ))}
    </Modal>
  );
}

/** Host's view after the exam: the ranked board, the totals and which questions the group found hard. */
function HostResults({ code }) {
  const [paper, setPaper] = useState(null);
  const { data, isLoading, error } = useDashboard(code, true);

  if (isLoading) return <SkeletonCard className="h-64" />;
  if (error) return <Banner variant="danger">{error.message ?? 'Could not load the results.'}</Banner>;

  const { totals, rankings, questionStats } = data;
  const hardest = [...questionStats].sort((a, b) => a.correctRate - b.correctRate).slice(0, 5);
  const ranked = rankings.filter((r) => ['submitted', 'timed_out'].includes(r.attemptStatus));
  const leader = ranked[0];

  return (
    <div className="space-y-6">
      <Card padding="lg" className="grid items-center gap-5 bg-[var(--brand-lavender)] sm:grid-cols-[auto_1fr]">
        <Mascot mood={leader ? 'excited' : 'thinking'} animation="float" size={96} className="mx-auto" />
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Live CBT results</p>
          <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
            {leader ? <>Top of the <em className="tf-accent font-normal">board</em></> : <>No papers <em className="tf-accent font-normal">yet</em></>}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            {leader
              ? `${leader.displayName} leads with ${leader.score ?? 0} pts. Open any name to read their paper.`
              : 'Scores appear here as papers come in.'}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Approved" value={totals.approved} icon={Users} tone="primary" />
        <StatCard label="Submitted" value={totals.submitted} icon={CheckCircle2} tone="sage" />
        <StatCard label="Timed out" value={totals.timedOut} icon={Clock} tone="warning" />
        <StatCard label="Did not start" value={totals.noShow} icon={Trophy} tone="accent" />
      </div>

      <section aria-labelledby="ranking" className="space-y-4">
        <h2 id="ranking" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Ranking</h2>
        <LiveLeaderboard rows={ranked} onSelect={setPaper} empty="No attempts yet." />
      </section>

      <section aria-labelledby="hard" className="space-y-3">
        <h2 id="hard" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Hardest questions</h2>
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

      <ParticipantPaper code={code} participant={paper} onClose={() => setPaper(null)} />
    </div>
  );
}

export default HostResults;
