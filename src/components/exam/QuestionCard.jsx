import { Flag } from 'lucide-react';
import MathText from '../MathText.jsx';
import { cn } from '../../utils/cn.js';

/**
 * The question itself: number, optional flag toggle, the stem (LaTeX supported) and the options as `children`.
 * Presentational only; the exam runtime owns answers, timing and scoring.
 */
function QuestionCard({ number, total, stem, flagged = false, onFlag, topic, children, className }) {
  return (
    <section aria-label={`Question ${number}${total ? ` of ${total}` : ''}`} className={cn('rounded-[24px] border border-border bg-surface p-5 sm:p-7', className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted">
          Question <span className="text-foreground-strong">{number}</span>
          {total ? ` of ${total}` : ''}
          {topic ? <span className="ml-2 rounded-full bg-[var(--brand-lavender)] px-2 py-0.5 text-xs font-bold text-primary">{topic}</span> : null}
        </p>
        {onFlag && (
          <button
            type="button"
            onClick={onFlag}
            aria-pressed={flagged}
            className={cn('inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', flagged ? 'border-warning bg-warning/15 text-[#8a5a00]' : 'border-border text-muted hover:text-foreground-strong')}
          >
            <Flag size={15} aria-hidden="true" className={flagged ? 'fill-current' : ''} />
            {flagged ? 'Flagged' : 'Flag'}
          </button>
        )}
      </header>
      <div className="text-[1.0625rem] leading-relaxed text-foreground-strong sm:text-lg">
        <MathText>{stem}</MathText>
      </div>
      {children && <div className="mt-6 space-y-2.5">{children}</div>}
    </section>
  );
}

export default QuestionCard;
