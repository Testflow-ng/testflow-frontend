import { Check, X } from 'lucide-react';
import MathText from '../MathText.jsx';
import { cn } from '../../utils/cn.js';

const states = {
  idle: 'border-border bg-surface hover:border-border-strong hover:bg-surface-strong/50',
  selected: 'border-primary bg-[var(--brand-lavender)]/60 ring-2 ring-primary/20',
  correct: 'border-success bg-success/10',
  // `answer` and `correct` look the same on purpose: both mean "this is the right one". They
  // are separate states because of what they say out loud .see SR below.
  answer: 'border-success bg-success/10',
  wrong: 'border-danger bg-danger/10',
  missed: 'border-success border-dashed bg-transparent', // the right answer, when you picked another
};
const letter = {
  idle: 'bg-surface-strong text-muted',
  selected: 'bg-primary text-primary-foreground',
  correct: 'bg-success text-white',
  answer: 'bg-success text-white',
  wrong: 'bg-danger text-white',
  missed: 'bg-success/15 text-score-good',
};

/*
  What a screen reader hears for each review state.

  The distinction that matters is `correct` versus `answer`. In the corrections review the
  student picked the right option, so "you chose this" is true. When a question is shown with
  no attempt attached .a saved question, an admin reviewing a report .nothing was chosen,
  and announcing "you chose this" is simply false.
*/
const SR = {
  correct: 'Correct answer, you chose this',
  answer: 'Correct answer',
  wrong: 'Your answer, incorrect',
  missed: 'Correct answer',
};

/**
 * One answer choice. States: idle, selected (during the paper), and the review states
 * correct / answer / wrong / missed. Review states never rely on colour alone: they add an
 * icon and screen-reader text.
 */
function OptionRow({ label, children, state = 'idle', onSelect, disabled = false, name = 'option' }) {
  const review = Boolean(SR[state]);
  const showsCheck = state === 'correct' || state === 'answer';
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
        {showsCheck ? (
          <Check size={16} strokeWidth={3} aria-hidden="true" />
        ) : state === 'wrong' ? (
          <X size={16} strokeWidth={3} aria-hidden="true" />
        ) : (
          label
        )}
      </span>
      <span className="min-w-0 flex-1 text-[15.5px] leading-snug text-foreground-strong">
        <MathText>{children}</MathText>
      </span>
      {review && <span className="sr-only">{SR[state]}</span>}
    </label>
  );
}

export default OptionRow;
