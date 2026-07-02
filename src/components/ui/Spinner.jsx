import { cn } from '../../utils/cn.js';

const sizeMap = { sm: 16, md: 20, lg: 28 };

/**
 * Indeterminate loading spinner. Inherits color from `currentColor`, so it
 * adapts to whatever context it sits in (e.g. on a primary button it renders
 * in the button's foreground color).
 *
 * Pass `label` when the spinner is the only loading indicator on screen; omit
 * it when a parent already conveys busy state (e.g. a button with aria-busy).
 */
function Spinner({ size = 'md', label, className, ...props }) {
  const px = sizeMap[size] ?? sizeMap.md;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('animate-spin text-current motion-reduce:animate-none', className)}
      role={label ? 'status' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Spinner;
