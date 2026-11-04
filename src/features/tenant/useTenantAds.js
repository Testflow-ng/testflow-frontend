import { useTenant } from './TenantContext.js';

/** The organisation's plan decides this: `site.ads.enabled` is false on Studio, so students never see an ad there. */
export function useTenantAds(slot) {
  const { site } = useTenant();
  const ads = site?.ads;
  return { show: Boolean(ads?.enabled && ads.publisherId && ads.slots?.[slot]), publisherId: ads?.publisherId, slotId: ads?.slots?.[slot] };
}

