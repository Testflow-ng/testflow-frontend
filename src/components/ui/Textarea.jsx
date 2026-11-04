import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

/** Multi-line input. Same invalid/focus rules as `Input` (driven by aria-invalid). */
const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full resize-y rounded-[20px] border border-border-strong bg-surface px-5 py-3 text-base text-foreground-strong placeholder:text-muted sm:text-sm',
        'transition-[border-color,box-shadow] duration-[var(--duration-sm)] motion-reduce:transition-none',
        '[@media(hover:hover)]:hover:border-border-strong',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15',
        'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15',
        'disabled:cursor-not-allowed disabled:bg-surface-strong disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});

export default Textarea;
