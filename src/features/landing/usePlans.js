import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client.js';

// Accepts a bare array or { plans: [...] }. Anything malformed falls back to the content defaults.
const normalise = (payload, fallback) => {
  const list = Array.isArray(payload) ? payload : payload?.plans;
  if (!Array.isArray(list)) return fallback;
  const valid = list.filter(
    (p) => p && typeof p.key === 'string' && Number.isInteger(p.priceMinor) && p.priceMinor > 0 && p.available !== false,
  );
  return valid.length ? valid : fallback;
};

/** Display-only plan list. Entitlements are always enforced by the server. */
export function useLandingPlans(plansConfig) {
  const path = plansConfig?.path;
  const fallback = plansConfig?.fallback ?? [];
  const { data } = useQuery({
    queryKey: ['landing', 'plans', path],
    queryFn: () => apiClient.get(path).then((res) => normalise(res.data, fallback)),
    enabled: Boolean(path),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return data ?? fallback;
}
