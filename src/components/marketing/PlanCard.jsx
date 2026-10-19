import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Pricing card. `featured` flips it to the dark ink style (use it for the one plan you want chosen).
 * `price` is the formatted string (e.g. "₦7,000"); `badge` is a small pill; `note` is a short honest caveat
 * (e.g. "Shows sponsored ads to your students"). Pass `to` for a link CTA or `onSelect` for a button.
 */
function PlanCard({ name, price, interval = 'month', blurb, points = [], badge, note, featured = false, ctaLabel = 'Choose plan', to, onSelect, className }) {
  const cta = (
    <>
      {ctaLabel} <ArrowUpRight size={15} aria-hidden="true" />
    </>
  );
  const ctaClass = cn(
    'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    featured ? 'bg-accent text-accent-foreground hover:bg-accent-hover' : 'bg-primary text-primary-foreground hover:bg-primary-hover',
  );
  return (
    <article className={cn('relative flex flex-col gap-3 rounded-[24px] border p-7', featured ? 'border-secondary bg-secondary text-secondary-foreground' : 'border-border bg-surface', className)}>
      {badge && <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-accent-foreground">{badge}</span>}
      <h3 className={cn('font-heading text-xl font-bold', featured ? 'text-white' : 'text-foreground-strong')}>{name}</h3>
      <p className="flex items-baseline gap-1.5">
        <span className={cn('font-heading text-[clamp(2.2rem,5vw,3rem)] font-extrabold leading-none tracking-tight', featured ? 'text-white' : 'text-foreground-strong')}>{price}</span>
        <span className={cn('text-sm', featured ? 'text-white/70' : 'text-muted')}>/ {interval}</span>
      </p>
      {blurb && <p className={cn('text-sm leading-relaxed', featured ? 'text-white/80' : 'text-muted')}>{blurb}</p>}
      {note && <p className={cn('w-fit rounded-full px-3 py-1 text-xs font-bold', featured ? 'bg-accent/20 text-accent' : 'bg-warning/15 text-[#8a5a00]')}>{note}</p>}
      <ul className="my-2 flex flex-col gap-2.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm">
            <Check size={16} strokeWidth={3} aria-hidden="true" className={cn('mt-0.5 shrink-0 rounded-full p-0.5', featured ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground')} />
            <span className={featured ? 'text-white/90' : 'text-foreground-strong'}>{p}</span>
          </li>
        ))}
      </ul>
      {to ? (
        <Link to={to} className={cn(ctaClass, 'mt-auto')}>
          {cta}
        </Link>
      ) : (
        <button type="button" onClick={onSelect} className={cn(ctaClass, 'mt-auto')}>
          {cta}
        </button>
      )}
    </article>
  );
}

export default PlanCard;
