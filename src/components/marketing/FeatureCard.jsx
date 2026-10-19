import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const tones = {
  lavender: 'bg-[var(--brand-lavender)]',
  sage: 'bg-[var(--brand-sage)]',
  surface: 'border border-border bg-surface',
  ink: 'bg-secondary text-secondary-foreground',
};

/**
 * Icon + title + text card. `tone` picks the brand tint. Pass `to` and `linkLabel` for a "learn more" link.
 * Lay several out with `FeatureGrid`.
 */
export function FeatureCard({ icon: Icon, title, text, tone = 'lavender', to, linkLabel, className }) {
  const ink = tone === 'ink';
  return (
    <article className={cn('flex flex-col gap-2.5 rounded-[20px] p-6', tones[tone], className)}>
      {Icon && (
        <span className={cn('mb-2 flex size-11 items-center justify-center rounded-xl', ink ? 'bg-white/10 text-accent' : 'bg-surface text-primary')}>
          <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
        </span>
      )}
      <h3 className={cn('font-heading text-[1.05rem] font-bold leading-snug', ink ? 'text-white' : 'text-foreground-strong')}>{title}</h3>
      <p className={cn('text-sm leading-relaxed', ink ? 'text-white/75' : 'text-muted')}>{text}</p>
      {to && (
        <Link to={to} className={cn('mt-auto inline-flex items-center gap-1 pt-2 text-sm font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded', ink ? 'text-accent' : 'text-primary')}>
          {linkLabel ?? 'Learn more'} <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}

/** Responsive grid for feature cards: 1 column on phones, 2 on tablets, `cols` (2-4) on desktop. */
export function FeatureGrid({ children, cols = 3, className }) {
  const c = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }[cols] ?? 'lg:grid-cols-3';
  return <div className={cn('grid gap-4 sm:grid-cols-2', c, className)}>{children}</div>;
}
