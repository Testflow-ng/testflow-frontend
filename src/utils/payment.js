// Shared payment-status normalization for student and organisation bank-transfer flows.
//
// The backend contract normalises terminal states as:
//   success / paid          -> successful terminal state
//   failed / expired / abandoned / cancelled / canceled / refunded -> terminal failure
//
// Student responses expose `purchase.status` and/or `purchase.paymentState`.
// Organisation responses expose `status` and/or `payment.status`.
// Response shapes differ between endpoints, so candidates are collected from
// every documented location rather than assuming one structure.

const SUCCESS_STATES = new Set(['paid', 'success']);
const FAILURE_STATES = new Set([
  'failed',
  'expired',
  'abandoned',
  'cancelled',
  'canceled',
  'refunded',
]);

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  PAID: 'paid',
  INITIALIZING: 'initializing',
  AWAITING_TRANSFER: 'awaiting_transfer',
  PROCESSING: 'processing',
  FAILED: 'failed',
  EXPIRED: 'expired',
  ABANDONED: 'abandoned',
  CANCELLED: 'cancelled',
};

/** Collect every candidate status value from the documented response shapes. */
function statusCandidates(input) {
  const c = [];
  const add = (v) => {
    if (v != null && v !== '') c.push(String(v));
  };
  add(input?.paymentState);
  add(input?.status);
  add(input?.purchase?.paymentState);
  add(input?.purchase?.status);
  add(input?.payment?.status);
  add(input?.payment?.paymentState);
  return c;
}

const lower = (v) => String(v).toLowerCase().trim();

export function normalizePaymentStatus(input) {
  const cands = statusCandidates(input);
  const raw = cands[0] ?? null;
  const status = raw ? lower(raw) : null;

  // A terminal failure or success anywhere in the response wins over a pending
  // value, so a payment is never left pending when the backend has settled it.
  const hasFailure = cands.some((v) => FAILURE_STATES.has(lower(v)));
  const hasSuccess = cands.some((v) => SUCCESS_STATES.has(lower(v)));

  let isSuccess = false;
  let isFailure = false;
  let finalStatus = status;
  if (hasFailure) {
    isFailure = true;
    finalStatus = cands.map(lower).find((v) => FAILURE_STATES.has(v)) ?? status;
  } else if (hasSuccess) {
    isSuccess = true;
    finalStatus = cands.map(lower).find((v) => SUCCESS_STATES.has(v)) ?? status;
  }

  return {
    raw,
    status: finalStatus,
    isSuccess,
    isFailure,
    isTerminal: isSuccess || isFailure,
  };
}

/** Derive a UI-friendly status key from a normalized result. */
export function paymentUiStatus(input) {
  const n = normalizePaymentStatus(input);
  if (!n.status) return null;
  if (n.isSuccess) return PAYMENT_STATUS.SUCCESS;
  if (n.isFailure) return n.status;
  return n.status; // initializing | awaiting_transfer | processing | unknown pending
}
