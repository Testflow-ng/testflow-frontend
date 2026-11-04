import { cn } from '../../utils/cn.js';
import './spinner.css';

const sizeMap = { sm: 16, md: 22, lg: 32, xl: 48 };

/**
 * Indeterminate loading spinner (twelve stepping ticks). Inherits colour from
 * `currentColor`, so on a primary button it renders in the button's text colour.
 *
 * Pass `label` when the spinner is the only loading indicator on screen; omit it
 * when a parent already conveys the busy state (e.g. a button with aria-busy).
 */
function Spinner({ size = 'md', label, className, style, ...props }) {
  const px = typeof size === 'number' ? size : (sizeMap[size] ?? sizeMap.md);

  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cn('tf-spinner inline-block shrink-0', className)}
      style={{ '--tf-spinner-size': `${px}px`, ...style }}
      {...props}
    />
  );
}

export default Spinner;
