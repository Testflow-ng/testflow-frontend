import { useSubscription } from './useWorkspace.js';

/** Fallback when the backend does not send `subscription.entitlements`: what each plan allows. */
const BY_PLAN = {
  free: { maxExams: 3, questionBanks: false, announcements: false, reports: false, paidExams: false, liveCbt: false },
  pro: { maxExams: null, questionBanks: true, announcements: true, reports: true, paidExams: false, liveCbt: false },
  studio: { maxExams: null, questionBanks: true, announcements: true, reports: true, paidExams: true, liveCbt: true },
};
export const FREE_EXAM_LIMIT = 3;

/**
 * What the organisation's plan allows. The backend can say so with `subscription.entitlements`
 * (`maxExams`, `questionBanks`, `announcements`, `reports`, `paidExams`, `liveCbt`); until it does the plan name decides.
 * No subscription means the Free plan. While the plan is loading nothing is blocked, so a button never flashes locked.
 */
export function usePlanFeatures() {
  const { data: sub, isLoading } = useSubscription();
  const planKey = sub?.planKey ?? 'free';
  const base = BY_PLAN[planKey] ?? BY_PLAN.free;
  const ent = { ...base, ...(sub?.entitlements ?? {}) };
  const open = (v) => (isLoading ? true : Boolean(v));
  return {
    planKey,
    planName: sub?.planName ?? 'Free',
    isFree: !isLoading && planKey === 'free',
    maxExams: isLoading ? null : ent.maxExams,
    canBanks: open(ent.questionBanks),
    canAnnounce: open(ent.announcements),
    canReports: open(ent.reports),
    canCharge: open(ent.paidExams),
    canLive: open(ent.liveCbt),
  };
}
