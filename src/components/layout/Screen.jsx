import { cn } from '../../utils/cn.js';

const widths = {
  sm: 'max-w-lg',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-5xl',
};

/**
 * The single page shell for every in-app screen.
 *
 * Replaces the `mx-auto w-full max-w-* px-5 pb-28 pt-6 lg:pb-8` string that was
 * copy-pasted across ~15 pages. Beyond de-duplication it fixes two things that
 * string got wrong on phones:
 *
 * - Bottom padding is now derived from the real nav height *plus* the home
 *   indicator inset (`.tf-nav-clearance`), instead of a hard-coded 7rem that
 *   left content tucked under the bar on notched iPhones.
 * - Horizontal padding comes from `--screen-gutter` (`.tf-gutter`), so gutters
 *   stay identical across screens and clear landscape notches.
 */
function Screen({
  as: Component = 'section',
  width = 'lg',
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'mx-auto w-full flex-1 pt-5 tf-gutter tf-nav-clearance sm:pt-6',
        widths[width] ?? widths.lg,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Standard screen title block. Every page previously rolled its own heading
 * with a different size and weight (`text-2xl font-extrabold` on one screen,
 * `text-xl font-black` on the next); one component keeps the type hierarchy
 * identical everywhere.
 */
function ScreenHeader({ title, subtitle, action, className }) {
  return (
    <header className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h1 className="font-heading text-[1.625rem] font-extrabold leading-tight tracking-tight text-foreground-strong">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm leading-snug text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  );
}

export { Screen, ScreenHeader };
export default Screen;
