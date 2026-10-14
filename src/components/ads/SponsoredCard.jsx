import { ArrowRight, MessageCircle, SkipForward } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * The ad students see after a finished session. Always labelled "Sponsored". `ad` is
 * { label?, title, description, imageUrl }, `cta` is { type: 'url' | 'whatsapp', href? }.
 * Never shows advertiser identity or keywords. Omit `onSkip` / `onContinue` for a static preview.
 */
function SponsoredCard({ ad, cta, onCta, onSkip, onContinue, className }) {
  const whatsapp = cta?.type === 'whatsapp';
  const label = ad.label ?? 'Sponsored';
  const ctaClass = cn(
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    whatsapp ? 'bg-[#25d366] text-[#08331a] hover:bg-[#1fbe5a]' : 'bg-primary text-primary-foreground hover:bg-primary-hover',
  );
  const inner = (
    <>
      {whatsapp ? <MessageCircle size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
      {whatsapp ? 'Chat on WhatsApp' : 'Learn more'}
    </>
  );
  return (
    <article aria-label={`${label}: ${ad.title}`} className={cn('w-full max-w-[24rem] overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_12px_40px_-16px_rgba(27,67,50,0.25)]', className)}>
      <div className="relative aspect-[3/2] bg-[var(--brand-sage)]">
        {ad.imageUrl && <img src={ad.imageUrl} alt="" className="size-full object-cover" />}
        <span className="absolute left-3 top-3 rounded-full bg-secondary/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-secondary-foreground">{label}</span>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="font-heading text-lg font-bold leading-snug text-foreground-strong">{ad.title}</h3>
        {ad.description && <p className="text-sm leading-relaxed text-muted">{ad.description}</p>}
        {cta?.href ? (
          <a href={cta.href} target="_blank" rel="noopener noreferrer sponsored" onClick={onCta} className={cn(ctaClass, 'mt-2')}>
            {inner}
          </a>
        ) : (
          <button type="button" onClick={onCta} className={cn(ctaClass, 'mt-2')}>
            {inner}
          </button>
        )}
        {(onSkip || onContinue) && (
          <div className="mt-1 flex gap-2">
            {onSkip && (
              <button type="button" onClick={onSkip} className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-muted hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <SkipForward size={15} aria-hidden="true" /> Skip
              </button>
            )}
            {onContinue && (
              <button type="button" onClick={onContinue} className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border-strong text-sm font-semibold text-foreground-strong hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Continue
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default SponsoredCard;
