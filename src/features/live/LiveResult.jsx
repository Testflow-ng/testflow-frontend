import { Award } from 'lucide-react';
import { Banner, Badge, EmptyState, SkeletonCard } from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import ResultSummary from '../../components/exam/ResultSummary.jsx';
import QuestionCard from '../../components/exam/QuestionCard.jsx';
import OptionRow from '../../components/exam/OptionRow.jsx';
import { useMyResult } from './useLive.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const mmss = (s) => (s == null ? null : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`);

/** A participant's result and corrections, shown once the host publishes. */
function LiveResult({ code, title }) {
  const { data: r, isLoading, error } = useMyResult(code, true);

  if (isLoading) return <Screen width="xl"><SkeletonCard className="h-48" /></Screen>;
  if (error) return <Screen width="md"><Banner variant="danger">{error.message ?? 'Could not load your result.'}</Banner></Screen>;

  const percent = r.totalPossible ? Math.max(0, Math.round((r.score / r.totalPossible) * 100)) : 0;
  const total = r.correctCount + r.incorrectCount + r.unansweredCount;

  return (
    <Screen width="xl">
      <PageHeader
        back="/live"
        title={title ?? r.title}
        subtitle="Your result"
        action={r.rank != null ? <Badge variant="lime"><Award size={12} aria-hidden="true" /> Rank {r.rank}</Badge> : null}
      />
      <div className="mt-6 space-y-6">
        <ResultSummary score={percent} correct={r.correctCount} total={total} timeTaken={mmss(r.timeTakenSeconds)} />

        {r.corrections ? (
          <section aria-labelledby="corrections" className="space-y-4">
            <h2 id="corrections" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Corrections</h2>
            {r.corrections.map((c) => (
              <QuestionCard key={c.index} number={c.index + 1} total={r.corrections.length} stem={c.stem}>
                {c.options.map((opt, i) => {
                  const state =
                    i === c.correctOption ? (c.selectedOption === i ? 'correct' : 'missed') : i === c.selectedOption ? 'wrong' : 'idle';
                  return (
                    <OptionRow key={i} name={`c-${c.index}`} label={LETTERS[i]} state={state} disabled>
                      {opt}
                    </OptionRow>
                  );
                })}
                {c.explanation && <p className="rounded-xl bg-surface-strong p-3 text-sm leading-relaxed text-foreground">{c.explanation}</p>}
              </QuestionCard>
            ))}
          </section>
        ) : (
          <EmptyState icon={Award} title="Review is off" description="The host turned corrections off for this session." />
        )}
      </div>
    </Screen>
  );
}

export default LiveResult;
