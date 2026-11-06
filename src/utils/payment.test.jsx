import { describe, it, expect } from 'vitest';
import {
  normalizePaymentStatus,
  paymentUiStatus,
  PAYMENT_STATUS,
} from './payment.js';

describe('normalizePaymentStatus', () => {
  it('treats "paid" as success', () => {
    expect(normalizePaymentStatus({ status: 'paid' })).toMatchObject({
      status: 'paid',
      isSuccess: true,
      isTerminal: true,
      isFailure: false,
    });
  });

  it('treats "success" as success (contract terminal state)', () => {
    expect(normalizePaymentStatus({ status: 'success' })).toMatchObject({
      status: 'success',
      isSuccess: true,
      isTerminal: true,
    });
  });

  it('treats failure states as terminal non-success', () => {
    for (const state of ['failed', 'expired', 'abandoned', 'cancelled', 'canceled', 'refunded']) {
      const n = normalizePaymentStatus({ status: state });
      expect(n.isFailure).toBe(true);
      expect(n.isTerminal).toBe(true);
      expect(n.isSuccess).toBe(false);
    }
  });

  it('treats pending states as non-terminal', () => {
    for (const state of ['initializing', 'awaiting_transfer', 'processing', 'verifying']) {
      const n = normalizePaymentStatus({ status: state });
      expect(n.isTerminal).toBe(false);
      expect(n.isSuccess).toBe(false);
      expect(n.isFailure).toBe(false);
    }
  });

  it('reads student purchase.paymentState', () => {
    const n = normalizePaymentStatus({ purchase: { paymentState: 'paid', status: 'initialized' } });
    expect(n.status).toBe('paid');
    expect(n.isSuccess).toBe(true);
  });

  it('reads student purchase.status', () => {
    const n = normalizePaymentStatus({ purchase: { status: 'failed', paymentState: 'initialized' } });
    expect(n.status).toBe('failed');
    expect(n.isFailure).toBe(true);
  });

  it('reads organisation payment.status', () => {
    const n = normalizePaymentStatus({ status: 'initialized', payment: { status: 'paid' } });
    expect(n.status).toBe('paid');
    expect(n.isSuccess).toBe(true);
  });

  it('reads organisation top-level status', () => {
    const n = normalizePaymentStatus({ status: 'expired' });
    expect(n.isFailure).toBe(true);
    expect(n.status).toBe('expired');
  });

  it('treats a conflicting failure as terminal failure (fail-safe)', () => {
    expect(normalizePaymentStatus({ status: 'paid', paymentState: 'failed' }).isFailure).toBe(true);
    expect(normalizePaymentStatus({ status: 'paid', paymentState: 'failed' }).isSuccess).toBe(false);
    expect(normalizePaymentStatus({ status: 'failed', paymentState: 'paid' }).isFailure).toBe(true);
    expect(normalizePaymentStatus({ status: 'failed', paymentState: 'paid' }).isSuccess).toBe(false);
  });

  it('treats conflicting organisation payment.status as terminal failure (fail-safe)', () => {
    const n = normalizePaymentStatus({ status: 'paid', payment: { status: 'failed' } });
    expect(n.isFailure).toBe(true);
    expect(n.isSuccess).toBe(false);
  });

  it('still treats success as success when paired with a pending state', () => {
    const n = normalizePaymentStatus({ status: 'success', paymentState: 'pending' });
    expect(n.isSuccess).toBe(true);
    expect(n.isTerminal).toBe(true);
  });

  it('returns non-terminal for null/empty input', () => {
    const n = normalizePaymentStatus(null);
    expect(n.isTerminal).toBe(false);
    expect(n.status).toBeNull();
  });
});

describe('paymentUiStatus', () => {
  it('maps success to success', () => {
    expect(paymentUiStatus({ status: 'paid', isSuccess: true })).toBe(PAYMENT_STATUS.SUCCESS);
    expect(paymentUiStatus({ status: 'success', isSuccess: true })).toBe(PAYMENT_STATUS.SUCCESS);
  });

  it('maps failure states to their status', () => {
    expect(paymentUiStatus({ status: 'expired', isFailure: true })).toBe('expired');
    expect(paymentUiStatus({ status: 'abandoned', isFailure: true })).toBe('abandoned');
  });

  it('maps pending states through', () => {
    expect(paymentUiStatus({ status: 'awaiting_transfer', isTerminal: false })).toBe('awaiting_transfer');
    expect(paymentUiStatus({ status: 'processing', isTerminal: false })).toBe('processing');
  });

  it('returns null for empty input', () => {
    expect(paymentUiStatus({ status: null, isTerminal: false })).toBeNull();
  });
});
