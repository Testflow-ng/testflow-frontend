import { Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Progress through a multi-step flow. `steps` is [{ label, description? }]; `current` is a 0-based index.
 * Steps before `current` show a tick. Pass `onStepClick` to let people go back to finished steps.
 */
function Stepper({ steps, current, onStepClick, className }) {
  return (
    <ol className={cn('flex flex-col gap-4 sm:flex-row sm:gap-0', className)} aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = done && onStepClick;
        const dot = (
          <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold', done ? 'border-primary bg-primary text-primary-foreground' : active ? 'border-primary bg-surface text-primary' : 'border-border-strong bg-surface text-muted')}>
            {done ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : i + 1}
          </span>
        );
        const text = (
          <span className="min-w-0 text-left">
            <span className={cn('block text-sm font-semibold', active || done ? 'text-foreground-strong' : 'text-muted')}>{s.label}</span>
            {s.description && <span className="block text-xs text-muted">{s.description}</span>}
          </span>
        );
        return (
          <li key={s.label} aria-current={active ? 'step' : undefined} className="flex flex-1 items-center gap-3 sm:last:flex-none">
            {clickable ? (
              <button type="button" onClick={() => onStepClick(i)} className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {dot}
                {text}
              </button>
            ) : (
              <>
                {dot}
                {text}
              </>
            )}
            {i < steps.length - 1 && <span aria-hidden="true" className={cn('mx-3 hidden h-0.5 flex-1 rounded sm:block', done ? 'bg-primary' : 'bg-border')} />}
          </li>
        );
      })}
    </ol>
  );
}

export default Stepper;
