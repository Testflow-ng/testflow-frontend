import { cn } from '../../utils/cn.js';

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

/**
 * Surface container. Flat by default; pass `raised` for a subtle shadow. Use
 * `as` to render a different element (e.g. a section or article).
 */
function Card({ as: Component = 'div', padding = 'md', raised = false, className, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-lg border border-border bg-surface',
        raised && 'shadow-sm',
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}

export default Card;
