import { forwardRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/** Checkbox with an optional label and hint. Supports `indeterminate` via the prop. */
const Checkbox = forwardRef(function Checkbox({ label, hint, indeterminate = false, className, id, ...props }, ref) {
  const gen = useId();
  const inputId = id ?? gen;
  return (
    <label htmlFor={inputId} className={cn('group flex cursor-pointer items-start gap-3', props.disabled && 'cursor-not-allowed opacity-50', className)}>
      <span className="relative mt-0.5 flex size-5 shrink-0">
        <input
          ref={(node) => {
            if (node) node.indeterminate = indeterminate;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          id={inputId}
          type="checkbox"
          className="peer absolute inset-0 size-5 cursor-[inherit] appearance-none rounded-md p-0 border border-border-strong bg-surface transition-colors checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 aria-invalid:border-danger motion-reduce:transition-none"
          {...props}
        />
        <Check size={14} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute inset-0 m-auto text-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:hidden" />
        <Minus size={14} strokeWidth={3} aria-hidden="true" className="pointer-events-none absolute inset-0 m-auto hidden text-primary-foreground peer-indeterminate:block" />
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

export default Checkbox;
