import { cn } from '../../utils/cn.js';

/*
  Padding steps down on phones. A 24px inset on a 375px screen (on top of the
  16px screen gutter) leaves under 300px of usable width, which forces text to
  wrap early and makes cards feel cramped rather than generous.
*/
const paddings = {
  none: '',
  sm: 'p-3.5 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-5 sm:p-8',
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
