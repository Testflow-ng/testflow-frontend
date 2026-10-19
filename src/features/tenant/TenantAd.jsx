import GoogleAdUnit from '../advertising/GoogleAdUnit.jsx';
import { cn } from '../../utils/cn.js';
import { useTenantAds } from './useTenantAds.js';

/** A small labelled ad on a student page. Renders nothing when the plan has no ads. Never inside an exam. */
function TenantAd({ slot, className, minHeight = 100 }) {
  const ad = useTenantAds(slot);
  if (!ad.show) return null;
  return (
    <aside aria-label="Advertisement" className={cn('rounded-[20px] border border-border bg-surface p-3', className)}>
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Advertisement</p>
      <GoogleAdUnit publisherId={ad.publisherId} slotId={ad.slotId} minHeight={minHeight} />
    </aside>
  );
}

export default TenantAd;
