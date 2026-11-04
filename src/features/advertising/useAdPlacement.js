import { useQuery } from '@tanstack/react-query';
import { advertisingApi } from './api.js';

/**
 * Decides whether a Google ad may be shown in `placement`. The backend owns the rules (placement
 * registry, ad-free pass, consent); this only asks and obeys. Any failure means "no ad", never an error.
 *
 *   show        render the unit
 *   loading     still asking
 *   publisherId / slotId  what the unit needs
 */
export function useAdPlacement(placement) {
  const config = useQuery({ queryKey: ['advertising', 'config'], queryFn: advertisingApi.config, staleTime: 10 * 60 * 1000, retry: false });
  const eligibility = useQuery({
    queryKey: ['advertising', 'eligibility', placement],
    queryFn: () => advertisingApi.eligibility(placement),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isAdFree = Boolean(eligibility.data?.adFree);
  const houseAdQuery = useQuery({
    queryKey: ['advertising', 'house-ad', placement],
    queryFn: () => advertisingApi.houseAd(placement),
    enabled: !isAdFree,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const google = config.data?.providers?.google_adsense;
  const googleAllowed = Boolean(eligibility.data?.providers?.google_adsense?.eligible);
  const publisherId = google?.enabled ? google.publisherId : null;
  const slotId = google?.adUnits?.[placement] ?? null;
  const hasGoogle = googleAllowed && Boolean(publisherId && slotId);

  const houseAd = houseAdQuery.data;
  const hasHouse = Boolean(houseAd) && !isAdFree;

  return {
    loading: config.isLoading || eligibility.isLoading || (!hasGoogle && houseAdQuery.isLoading),
    show: !isAdFree && (hasGoogle || hasHouse),
    isHouseAd: !hasGoogle && hasHouse,
    houseAd,
    adFree: isAdFree,
    publisherId,
    slotId,
  };
}
