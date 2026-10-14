import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';

/** Radio with label and hint. Group several with the same `name`; wrap them in a `fieldset`/`legend`. */
const Radio = forwardRef(function Radio({ label, hint, className, id, ...props }, ref) {
  const gen = useId();
  const inputId = id ?? gen;
  return (
    <label htmlFor={inputId} className={cn('flex cursor-pointer items-start gap-3', props.disabled && 'cursor-not-allowed opacity-50', className)}>
      <span className="relative mt-0.5 flex size-5 shrink-0">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="peer absolute inset-0 size-5 cursor-[inherit] appearance-none rounded-full p-0 border border-border-strong bg-surface transition-colors checked:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 motion-reduce:transition-none"
          {...props}
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 m-auto size-2.5 scale-0 rounded-full bg-primary transition-transform peer-checked:scale-100 motion-reduce:transition-none" />
      </span>
      {(label || hint) && (
        <span className="min-w-0">
          {label && <span className="block text-[15px] leading-6 text-foreground-strong">{label}</span>}
          {hint && <span className="block text-sm text-muted">{hint}</span>}
        </span>
      )}
    </label>
  );
});

export default Radio;
