import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client.js';
import { ADS_FALLBACK_PRICING } from './adsContent.js';

// Accepts a few plausible tier shapes: { minDays, discountPercent } etc.
const normaliseTiers = (tiers) =>
  (Array.isArray(tiers) ? tiers : [])
    .map((t) => ({
      minDays: Number(t.minDays ?? t.days ?? t.fromDays),
      percentOff: Number(t.discountPercent ?? t.percentOff ?? t.discountPct ?? t.discount),
    }))
    .filter((t) => Number.isFinite(t.minDays) && Number.isFinite(t.percentOff) && t.percentOff > 0)
    .sort((a, b) => a.minDays - b.minDays);

export function normalisePricing(payload) {
  const s = payload?.settings ?? payload?.data?.settings ?? payload ?? {};
  const fee = Number(s.dailyFeeKobo);
  const min = Number(s.minDurationDays);
  const max = Number(s.maxDurationDays);
  if (!Number.isInteger(fee) || fee <= 0) return ADS_FALLBACK_PRICING;
  const minDays = Number.isInteger(min) && min > 0 ? min : ADS_FALLBACK_PRICING.minDurationDays;
  const maxDays = Number.isInteger(max) && max >= minDays ? max : Math.max(minDays, ADS_FALLBACK_PRICING.maxDurationDays);
  return {
    dailyFeeKobo: fee,
    minDurationDays: minDays,
    maxDurationDays: maxDays,
    pricingPolicy: s.pricingPolicy === 'tiered' ? 'tiered' : 'flat',
    tiers: s.pricingPolicy === 'tiered' ? normaliseTiers(s.tiers) : [],
  };
}

/** Public, unauthenticated. Display only: the server recalculates prices. */
export function useAdPricing() {
  const { data, isError } = useQuery({
    queryKey: ['ads', 'pricing'],
    queryFn: () => apiClient.get('/api/ads/pricing').then((res) => normalisePricing(res.data)),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  return { pricing: data ?? ADS_FALLBACK_PRICING, isFallback: !data || isError };
}

export const formatNaira = (kobo) =>
  `₦${(kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

export function priceFor(pricing, days) {
  const gross = pricing.dailyFeeKobo * days;
  const tier = [...pricing.tiers].reverse().find((t) => days >= t.minDays);
  const percentOff = tier?.percentOff ?? 0;
  return { gross, percentOff, total: Math.round(gross * (1 - percentOff / 100)) };
}
