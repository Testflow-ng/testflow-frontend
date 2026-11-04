import { cn } from '../../utils/cn.js';

/**
 * Numbered grid for jumping between questions. `answered` and `flagged` are Sets of 1-based numbers.
 * States are shown by fill, a corner dot (flagged) and screen-reader text, never colour alone.
 */
function QuestionNavigator({ total, current, answered = new Set(), flagged = new Set(), onJump, className }) {
  return (
    <nav aria-label="Question navigator" className={className}>
      <ol className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const isCurrent = n === current;
          const isAnswered = answered.has(n);
          const isFlagged = flagged.has(n);
          return (
            <li key={n}>
              <button
                type="button"
                onClick={() => onJump?.(n)}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'relative flex aspect-square w-full items-center justify-center rounded-xl border text-sm font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none',
                  isCurrent ? 'border-primary bg-primary text-primary-foreground' : isAnswered ? 'border-transparent bg-[var(--brand-lavender)] text-primary' : 'border-border bg-surface text-muted hover:text-foreground-strong',
                )}
              >
                {n}
                {isFlagged && <span aria-hidden="true" className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-background bg-warning" />}
                <span className="sr-only">
                  {isAnswered ? ', answered' : ', not answered'}
                  {isFlagged ? ', flagged' : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-hidden="true">
        <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-[var(--brand-lavender)]" />Answered</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded border border-border" />Not answered</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-warning" />Flagged</li>
      </ul>
    </nav>
  );
}

export default QuestionNavigator;
