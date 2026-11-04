import { cn } from '../../utils/cn.js';

/**
 * Section heading with the italic serif accent: `Built for how you <em>actually study.</em>`
 * Pass the plain part as `title` and the accent words as `accent`. `as` sets the heading level
 * (keep one h1 per page). `side` is an optional paragraph on the right (stacked on phones).
 */
function SectionHeading({ eyebrow, title, accent, side, as: Tag = 'h2', tone = 'default', className }) {
  const onDark = tone === 'inverse';
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-10', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className={cn('mb-3 text-[0.7rem] font-bold uppercase tracking-[0.1em]', onDark ? 'text-accent' : 'text-primary')}>{eyebrow}</p>
        )}
        <Tag className={cn('font-heading text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.02em]', onDark ? 'text-white' : 'text-foreground-strong')}>
          {title}
          {accent && (
            <>
              {' '}
              <em className={cn('tf-accent', onDark && '!text-white')}>{accent}</em>
            </>
          )}
        </Tag>
      </div>
      {side && <p className={cn('max-w-xs text-sm leading-relaxed', onDark ? 'text-white/70' : 'text-muted')}>{side}</p>}
    </div>
  );
}

export default SectionHeading;
