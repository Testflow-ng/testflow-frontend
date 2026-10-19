import { cn } from '../../utils/cn.js';
import Breadcrumb from '../ui/Breadcrumb.jsx';
import BackButton from '../ui/BackButton.jsx';

const widths = {
  sm: 'max-w-[32rem]',
  md: 'max-w-[40rem]',
  lg: 'max-w-[44rem]',
  xl: 'max-w-[56rem]',
  full: 'max-w-[72rem]',
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
function ScreenHeader({ title, subtitle, action, eyebrow, breadcrumbs, back, className }) {
  return (
    <header className={cn('flex flex-col gap-3', className)}>
      {back ? <BackButton to={back === true ? undefined : back} className="-mb-1 self-start" /> : null}
      {breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{eyebrow}</p> : null}
          <h1 className="font-heading text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground-strong">
            {title}
          </h1>
          {subtitle ? <p className="mt-1.5 text-[15px] leading-snug text-muted">{subtitle}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-2 pt-1">{action}</div> : null}
      </div>
    </header>
  );
}

/** Same component under its design-system name: title, subtitle, actions, optional back link or breadcrumbs. */
const PageHeader = ScreenHeader;

export { Screen, ScreenHeader, PageHeader };
export default Screen;
