import { Check, X } from 'lucide-react';
import MathText from '../MathText.jsx';
import { cn } from '../../utils/cn.js';

const states = {
  idle: 'border-border bg-surface hover:border-border-strong hover:bg-surface-strong/50',
  selected: 'border-primary bg-[var(--brand-lavender)]/60 ring-2 ring-primary/20',
  correct: 'border-success bg-success/10',
  wrong: 'border-danger bg-danger/10',
  missed: 'border-success border-dashed bg-transparent', // the right answer, when you picked another
};
const letter = {
  idle: 'bg-surface-strong text-muted',
  selected: 'bg-primary text-primary-foreground',
  correct: 'bg-success text-white',
  wrong: 'bg-danger text-white',
  missed: 'bg-success/15 text-score-good',
};

/**
 * One answer choice. States: idle, selected (during the paper), correct / wrong / missed (review).
 * Review states never rely on colour alone: they add an icon and screen-reader text.
 */
function OptionRow({ label, children, state = 'idle', onSelect, disabled = false, name = 'option' }) {
  const review = state === 'correct' || state === 'wrong' || state === 'missed';
  return (
    <label
      className={cn(
        'flex min-h-14 cursor-pointer items-center gap-3.5 rounded-2xl border px-3.5 py-3 text-left transition-colors motion-reduce:transition-none',
        'focus-within:ring-2 focus-within:ring-primary',
        states[state],
        (disabled || review) && 'cursor-default',
      )}
    >
      <input type="radio" name={name} className="sr-only" checked={state === 'selected'} disabled={disabled || review} onChange={onSelect ?? (() => {})} />
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold', letter[state])}>
        {state === 'correct' ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : state === 'wrong' ? <X size={16} strokeWidth={3} aria-hidden="true" /> : label}
      </span>
      <span className="min-w-0 flex-1 text-[15.5px] leading-snug text-foreground-strong">
        <MathText>{children}</MathText>
      </span>
      {review && (
        <span className="sr-only">
          {state === 'correct' ? 'Correct answer, you chose this' : state === 'wrong' ? 'Your answer, incorrect' : 'Correct answer'}
        </span>
      )}
    </label>
  );
}

export default OptionRow;
