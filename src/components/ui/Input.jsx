import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

/*
  Every size renders at 16px text on phones: iOS Safari zooms the viewport on
  focus for anything smaller and never zooms back out. The designed size takes
  over from `sm` up. Heights are >= 44px on mobile for comfortable tapping and
  relax to the tighter desktop rhythm at `sm`.
*/
const sizes = {
  sm: 'h-11 text-base sm:h-9 sm:text-sm',
  md: 'h-12 text-base sm:h-11 sm:text-sm',
  lg: 'h-12 text-base',
};

/**
 * Text input. Invalid styling is driven by `aria-invalid` (set by the Field
 * wrapper), so there's no separate `invalid` prop to keep in sync.
 * Supports leadingAdornment and trailingAdornment.
 */
const variants = {
  outline:
    'rounded-md border border-border bg-surface px-4 ' +
    '[@media(hover:hover)]:hover:border-border-strong ' +
    'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 ' +
    'aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger/40 ' +
    'disabled:bg-surface-strong',
  /*
    `bare` drops the box entirely, for fields that live as rows on a sheet
    (the auth screens). The row itself supplies the boundary, so an input
    border there would be a second frame around the same content. Focus is
    still visible: the field's own sheet row lights up via focus-within.
  */
  bare: 'border-0 bg-transparent px-0 focus-visible:ring-0',
};

const Input = forwardRef(function Input(
  {
    size = 'md',
    type = 'text',
    variant = 'outline',
    className,
    leadingAdornment,
    trailingAdornment,
    ...props
  },
  ref,
) {
  const hasAdornment = Boolean(leadingAdornment || trailingAdornment);

  const inputElement = (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full text-foreground-strong placeholder:text-muted',
        'transition-[border-color,box-shadow] duration-[var(--duration-sm)] ease-[var(--transition-ease)] motion-reduce:transition-none',
        'focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant] ?? variants.outline,
        // A bare field takes its breathing room from the sheet row around it,
        // so it only needs enough height for the text itself.
        variant === 'bare' ? 'h-9 text-base sm:h-8 sm:text-[15px]' : sizes[size],
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
