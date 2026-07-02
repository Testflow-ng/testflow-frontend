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
 */
const Input = forwardRef(function Input({ size = 'md', type = 'text', className, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-md border border-border bg-surface px-3 text-foreground-strong placeholder:text-muted',
        'transition-[border-color,box-shadow] duration-[var(--duration-sm)] ease-[var(--transition-ease)] motion-reduce:transition-none',
        'hover:border-border-strong',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:cursor-not-allowed disabled:bg-surface-strong disabled:opacity-50',
        'aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger/40',
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

export default Input;
