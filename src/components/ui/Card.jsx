import { cn } from '../../utils/cn.js';

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Surface container. Premium by default; has subtle shadows and border.
 */
function Card({ as: Component = 'div', padding = 'md', raised = true, hover = false, className, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-2xl border border-border bg-surface transition-all duration-300',
        raised && 'shadow-sm',
        hover && 'hover:shadow-md hover:-translate-y-0.5 hover:border-border-strong',
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}

export default Card;
