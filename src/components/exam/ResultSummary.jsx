import ProgressRing from '../ui/ProgressRing.jsx';
import { scoreLabel } from '../../utils/score.js';
import { cn } from '../../utils/cn.js';

const toneFor = (score) => (score >= 70 ? 'success' : score >= 50 ? 'warning' : 'danger');
const bandCopy = { 'on track': 'On track', borderline: 'Borderline', 'needs work': 'Needs work' };

/** Score ring plus the numbers behind it. Bands match the app: 70+ on track, 50-69 borderline, below 50 needs work. */
function ResultSummary({ score, correct, total, timeTaken, className }) {
  const label = scoreLabel(score);
  return (
    <section aria-label="Result" className={cn('flex flex-col items-center gap-5 rounded-[24px] border border-border bg-surface p-6 text-center sm:flex-row sm:text-left', className)}>
      <ProgressRing value={score} size={132} stroke={12} tone={toneFor(score)} label={`Score ${score} percent`}>
        {score}%
      </ProgressRing>
      <div>
        <p className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">{bandCopy[label]}</p>
        <p className="mt-1 text-[15px] text-muted">
          {correct} of {total} correct{timeTaken ? ` in ${timeTaken}` : ''}
        </p>
        <div aria-hidden="true" className="mt-3 flex h-2 w-56 max-w-full overflow-hidden rounded-full">
          <span className="w-1/2 bg-danger/60" />
          <span className="w-[20%] bg-warning/70" />
          <span className="w-[30%] bg-success/70" />
        </div>
        <p aria-hidden="true" className="mt-1 flex w-56 max-w-full justify-between text-[11px] text-muted"><span>0</span><span>50</span><span>70</span><span>100</span></p>
      </div>
    </section>
  );
}

export default ResultSummary;
