import { Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Progress through a multi-step flow. `steps` is [{ label, description? }]; `current` is a 0-based index.
 * Steps before `current` show a tick. Pass `onStepClick` to let people go back to finished steps.
 * On phones it collapses to a thin segmented bar with a "Step 2 of 4 · Logo" line; from sm up it shows every label.
 */
function Stepper({ steps, current, onStepClick, className }) {
  const total = steps.length;
  const now = steps[Math.min(Math.max(current, 0), total - 1)];
  return (
    <div className={className}>
    <div className="sm:hidden" role="progressbar" aria-label="Progress" aria-valuemin={1} aria-valuemax={total} aria-valuenow={Math.min(current + 1, total)} aria-valuetext={`Step ${Math.min(current + 1, total)} of ${total}${now ? `: ${now.label}` : ''}`}>
      <p className="mb-2 text-[13px] font-semibold text-foreground-strong">
        Step {Math.min(current + 1, total)} of {total}{now ? <span className="font-medium text-muted"> · {now.label}</span> : null}
      </p>
      <div className="flex gap-1.5" aria-hidden="true">
        {steps.map((s, i) => (
          <span key={s.label} className={cn('h-1.5 flex-1 rounded-full', i <= current ? 'bg-primary' : 'bg-border')} />
        ))}
      </div>
    </div>
    <ol className="hidden flex-row items-center sm:flex sm:gap-0" aria-label="Progress">
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
          <li key={s.label} aria-current={active ? 'step' : undefined} className="flex flex-1 items-center gap-3 last:flex-none">
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
            {i < steps.length - 1 && <span aria-hidden="true" className={cn('mx-3 h-0.5 flex-1 rounded', done ? 'bg-primary' : 'bg-border')} />}
          </li>
        );
      })}
    </ol>
    </div>
  );
}

export default Stepper;
