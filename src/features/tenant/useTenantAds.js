import { useQuery } from '@tanstack/react-query';
import { advertisingApi } from '../advertising/api.js';
import { useTenant } from './TenantContext.js';

/**
 * Serves ads on tenant/organization sites.
 * Paid exams and ad-free organizations never see ads.
 * Google AdSense is preferred if configured, otherwise falls back to TestFlow House Ads.
 */
export function useTenantAds(slot) {
  const { site, isPaidExam } = useTenant();
  const ads = site?.ads;
  const isAdFree = isPaidExam || ads?.enabled === false;

  const houseAdQuery = useQuery({
    queryKey: ['advertising', 'house-ad', 'tenant_portal'],
    queryFn: () => advertisingApi.houseAd('tenant_portal'),
    enabled: !isAdFree,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const hasGoogle = Boolean(ads?.enabled && ads?.publisherId && ads?.slots?.[slot]);
  const houseAd = houseAdQuery.data;
  const hasHouse = Boolean(houseAd) && !isAdFree;

  return {
    show: !isAdFree && (hasGoogle || hasHouse),
    isHouseAd: !hasGoogle && hasHouse,
    houseAd,
    publisherId: ads?.publisherId,
    slotId: ads?.slots?.[slot],
  };
}

