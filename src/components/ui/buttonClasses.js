import { cn } from '../../utils/cn.js';

export const buttonBase =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold select-none ' +
  'transition-[background-color,border-color,color,transform] duration-[var(--duration-sm)] ease-[var(--transition-ease)] ' +
  // Press feedback. Touch devices have no hover, so :active is the only signal
  // that a tap registered; it snaps down fast and eases back on release.
  'active:scale-[0.97] active:duration-[90ms] motion-reduce:transition-none motion-reduce:active:scale-100 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

export const buttonVariants = {
  primary:
    'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
  outline:
    'border border-border-strong bg-surface text-foreground-strong hover:bg-surface-strong active:bg-surface-strong',
  ghost: 'bg-transparent text-foreground-strong hover:bg-surface-strong active:bg-surface-strong',
  danger: 'bg-danger text-danger-foreground shadow-xs hover:bg-danger-hover active:bg-danger-active',
};

/*
  `sm` stays visually compact (36px) but carries an invisible 44px hit area via
  the ::after pseudo-element, so it meets the touch-target minimum without
  bloating dense toolbars. `md`/`lg` are already >= 44px.
*/
const HIT_AREA =
  "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']";

const sizes = {
  sm: `h-9 gap-1.5 px-3.5 text-sm ${HIT_AREA}`,
  md: 'h-11 px-4 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
};

/**
 * Single source of truth for button styling. Used by the Button component and
 * by any element that must look like a button but render as another tag (e.g.
 * a router Link). Keeps the "no copy-pasted class blocks" rule enforceable.
 */
export function buttonClasses({ variant = 'primary', size = 'md', fullWidth = false, className } = {}) {
  return cn(buttonBase, buttonVariants[variant], sizes[size], fullWidth && 'w-full', className);
}
