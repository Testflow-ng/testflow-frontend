import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

const sizes = {
  sm: 'h-9 text-sm',
  md: 'h-11 text-sm',
  lg: 'h-12 text-base',
};

/**
 * Text input. Invalid styling is driven by `aria-invalid` (set by the Field
 * wrapper), so there's no separate `invalid` prop to keep in sync.
 * Supports leadingAdornment and trailingAdornment.
 */
const Input = forwardRef(function Input(
  { size = 'md', type = 'text', className, leadingAdornment, trailingAdornment, ...props },
  ref,
) {
  const hasAdornment = Boolean(leadingAdornment || trailingAdornment);

  const inputElement = (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-md border border-border bg-surface text-foreground-strong placeholder:text-muted',
        'transition-[border-color,box-shadow] duration-[var(--duration-sm)] ease-[var(--transition-ease)] motion-reduce:transition-none',
        'hover:border-border-strong',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:cursor-not-allowed disabled:bg-surface-strong disabled:opacity-50',
        'aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger/40',
        sizes[size],
        leadingAdornment && 'pl-10',
        trailingAdornment && 'pr-10',
        !hasAdornment && className,
      )}
      {...props}
    />
  );

  if (!hasAdornment) {
    return inputElement;
  }

  return (
    <div className={cn('relative w-full', className)}>
      {leadingAdornment && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-muted">
          {leadingAdornment}
        </div>
      )}
      {inputElement}
      {trailingAdornment && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-muted">
          {trailingAdornment}
        </div>
      )}
    </div>
  );
});

export default Input;
