import { cn } from '../../utils/cn.js';

export const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium select-none ' +
  'transition-colors duration-[var(--duration-sm)] ease-[var(--transition-ease)] motion-reduce:transition-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50';

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

const sizes = {
  sm: 'h-9 gap-1.5 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
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
