import { Award } from 'lucide-react';
import { EmptyState } from '../../components/ui/index.js';
import QuestionCard from '../../components/exam/QuestionCard.jsx';
import OptionRow from '../../components/exam/OptionRow.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * The corrected paper: each question, the option the student chose, the right one, and the
 * explanation. Shared by the participant result and the host's per-participant review, so both
 * sides read the same corrections. `corrections` is null when the host set `allowReview: false`.
 */
function Corrections({ corrections, className }) {
  if (!corrections) {
    return <EmptyState icon={Award} title="Review is off" description="The host turned corrections off for this session." />;
  }
  return (
    <section aria-labelledby="corrections" className={className}>
      <h2 id="corrections" className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Corrections</h2>
      <div className="space-y-4">
        {corrections.map((c) => (
          <QuestionCard key={c.index} number={c.index + 1} total={corrections.length} stem={c.stem}>
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
      </div>
    </section>
  );
}

export default Corrections;
