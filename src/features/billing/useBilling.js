import { useQuery } from '@tanstack/react-query';
import { billingApi } from './api.js';

/** What the signed-in student holds: `adFree`, `liveCbtHost`, `status` (free | active | expired), `expiresAt`. */
export function useEntitlement() {
  return useQuery({ queryKey: ['billing', 'entitlement'], queryFn: billingApi.entitlement, staleTime: 60 * 1000, retry: false });
}

export function useProducts() {
  return useQuery({ queryKey: ['billing', 'products'], queryFn: billingApi.products, staleTime: 10 * 60 * 1000 });
}

export function usePurchases() {
  return useQuery({ queryKey: ['billing', 'purchases'], queryFn: billingApi.purchases, staleTime: 30 * 1000 });
}

/**
 * Can this student read and download in the Library? The backend's `library` entitlement when it exists,
 * otherwise any live Student Pass. `undefined` (still loading) counts as allowed so nothing flashes locked.
 */
export function hasLibraryAccess(held) {
  if (!held) return true;
  return Boolean(held.library ?? held.entitlements?.library ?? held.adFree);
}

export function hasAiEarlyAccess(held) {
  if (!held) return false;
  return Boolean(held.aiEarlyAccess ?? held.entitlements?.ai_early_access ?? held.adFree);
}

export function hasCustomCbtAccess(held) {
  if (!held) return false;
  return Boolean(held.customCbt ?? held.entitlements?.custom_cbt ?? held.adFree);
}
