import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import GoogleAdUnit from './GoogleAdUnit.jsx';
import SponsoredCard from '../../components/ads/SponsoredCard.jsx';
import { useAdPlacement } from './useAdPlacement.js';

/**
 * A quiet, labelled ad area for a page. Renders nothing when the backend says no ad may show here
 * (ad-free pass, placement off, provider off). Renders GoogleAdUnit if configured, or TestFlow
 * internal House Ads as a high-quality fallback. Never use it inside an exam or a live room.
 */
function AdSlot({ placement, minHeight = 100, className, variant = 'card' }) {
  const ad = useAdPlacement(placement);
  if (!ad.show || ad.adFree) return null;

  if (variant === 'compact') {
    if (!ad.isHouseAd || !ad.houseAd) {
      return (
        <aside aria-label="Advertisement" className={cn('rounded-2xl border border-border bg-surface p-2.5', className)}>
          <GoogleAdUnit publisherId={ad.publisherId} slotId={ad.slotId} minHeight={60} />
        </aside>
      );
    }

    const houseAd = ad.houseAd;
    const isWhatsapp = houseAd.cta?.type === 'whatsapp';
    const ctaHref = houseAd.cta?.href || '/billing';
    const isExternal = isWhatsapp || ctaHref.startsWith('http');

    return (
      <aside aria-label="Sponsored" className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-surface-subtle/80 p-3 shadow-xs hover:border-primary/40 transition', className)}>
        <div className="flex items-center gap-3 min-w-0">
          {houseAd.imageUrl ? (
            <img src={houseAd.imageUrl} alt="" className="size-14 rounded-xl object-cover shrink-0 border border-border/60" />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
              PROMO
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary-foreground">
                Sponsored
              </span>
              <h4 className="text-sm font-bold text-foreground-strong truncate">
                {houseAd.title}
              </h4>
            </div>
            {houseAd.description && (
              <p className="mt-0.5 text-xs text-muted truncate max-w-xl">
                {houseAd.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end shrink-0 gap-2.5">
          <Link to="/billing" className="text-[11px] font-medium text-muted hover:text-primary hover:underline">
            Remove ads
          </Link>
          <a
            href={ctaHref}
            target={isExternal ? '_blank' : '_self'}
            rel="noopener noreferrer sponsored"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {houseAd.cta?.label || (isWhatsapp ? 'WhatsApp' : 'Learn more')}
          </a>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Advertisement" className={cn('rounded-[20px] border border-border bg-surface p-3', className)}>
      <div className="mb-2 flex items-center justify-between px-1 text-[11px]">
        <span className="font-semibold uppercase tracking-[0.14em] text-muted">
          {ad.isHouseAd ? 'Sponsored' : 'Advertisement'}
        </span>
        <Link to="/billing" className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Remove ads
        </Link>
      </div>
      {ad.isHouseAd && ad.houseAd ? (
        <SponsoredCard ad={ad.houseAd} cta={ad.houseAd.cta} className="mx-auto" />
      ) : (
        <GoogleAdUnit publisherId={ad.publisherId} slotId={ad.slotId} minHeight={minHeight} />
      )}
    </aside>
  );
}

export default AdSlot;
