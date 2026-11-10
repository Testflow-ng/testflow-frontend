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
 * `flushMobile` drops the box on phones and keeps it from sm up (used by full-screen mobile flows like onboarding).
 */
function Card({ as: Component = 'div', padding = 'md', raised = true, hover = false, flushMobile = false, className, ...props }) {
  return (
    <Component
      className={cn(
        'transition-all duration-300 motion-reduce:transition-none',
        // flushMobile: no box on phones (the content sits straight on the page); the normal card from sm up.
        flushMobile ? 'sm:rounded-[20px] sm:border sm:border-border sm:bg-surface' : 'rounded-[20px] border border-border bg-surface',
        raised && (flushMobile ? 'sm:shadow-[0_1px_2px_rgba(27,67,50,0.04),0_8px_24px_-12px_rgba(27,67,50,0.12)]' : 'shadow-[0_1px_2px_rgba(27,67,50,0.04),0_8px_24px_-12px_rgba(27,67,50,0.12)]'),
        hover && 'hover:shadow-md hover:-translate-y-0.5 hover:border-border-strong',
        flushMobile ? 'sm:p-8' : paddings[padding],
        className,
      )}
      {...props}
    />
  );
}

export default Card;
