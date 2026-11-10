import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act, fireEvent } from '@testing-library/react';
import { render } from '../../../test/customRender.jsx';
import BillingScreen from './BillingScreen.jsx';

vi.mock('../api.js', () => ({
  wsApi: {
    subscription: vi.fn(),
    plans: vi.fn(),
    subscriptionCheckout: vi.fn(),
    changePlan: vi.fn(),
    renew: vi.fn(),
    subscriptionCheckoutStatus: vi.fn(),
    subscriptionPaymentStatus: vi.fn(),
    verifySubscriptionPayment: vi.fn(),
    verifyPayment: vi.fn(),
  },
}));
vi.mock('../OrgContext.js', () => ({ useOrg: vi.fn(() => ({ orgId: 'o1' })) }));
vi.mock('../useWorkspace.js', () => ({
  useSubscription: vi.fn(),
  usePlans: vi.fn(),
  useSubscriptionPayments: vi.fn(),
}));

import { wsApi } from '../api.js';
import { useSubscription, usePlans, useSubscriptionPayments } from '../useWorkspace.js';

const transferInstructions = {
  bankName: 'Wema Bank',
  accountName: 'TestFlow Ltd',
  accountNumber: '0123456789',
  amountKobo: 700000,
  currency: 'NGN',
  transferReference: 'SUB-1',
  expiresAt: '2026-11-07T10:00:00Z',
  displayText: 'Transfer exact amount.',
};

const freeSub = {
  id: 'sub1',
  planKey: 'free',
  planName: 'Free',
  priceMinor: 0,
  currency: 'NGN',
  interval: 'month',
  adsEnabled: true,
  status: 'active',
};
const studioSub = { ...freeSub, planKey: 'studio', planName: 'Studio', priceMinor: 2000000, adsEnabled: false };
const proSub = { ...freeSub, planKey: 'pro', planName: 'Pro', priceMinor: 700000, adsEnabled: true };
const plans = [
  { key: 'pro', name: 'Pro', priceMinor: 700000, currency: 'NGN', interval: 'month', adsEnabled: true },
  { key: 'studio', name: 'Studio', priceMinor: 2000000, currency: 'NGN', interval: 'month', adsEnabled: false },
];

let orgUuidCounter = 0;

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  orgUuidCounter = 0;
  if (!globalThis.crypto) globalThis.crypto = {};
  globalThis.crypto.randomUUID = vi.fn(() => 'test-idem-key');
  usePlans.mockReturnValue({ data: plans });
  useSubscriptionPayments.mockReturnValue({ data: [] });
  wsApi.subscriptionCheckout.mockResolvedValue({
    reference: 'SUB-1',
    planKey: 'studio',
    planName: 'Studio',
    amountKobo: 2000000,
    currency: 'NGN',
    status: 'initialized',
    transferInstructions,
  });
  wsApi.changePlan.mockResolvedValue({});
  wsApi.renew.mockResolvedValue({
    reference: 'SUB-R',
    amountKobo: 700000,
    currency: 'NGN',
    status: 'initialized',
    transferInstructions,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('organisation subscription lifecycle', () => {
  it('starts a first paid subscription via subscriptionCheckout, not changePlan', async () => {
    useSubscription.mockReturnValue({ data: freeSub });
    render(<BillingScreen />);
    await screen.findByText('Upgrade to Studio');
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Wema Bank');
    expect(wsApi.subscriptionCheckout).toHaveBeenCalledWith('o1', 'sub1', expect.any(String), expect.any(String));
    expect(wsApi.changePlan).not.toHaveBeenCalled();
    expect(screen.getByText('0123456789')).toBeInTheDocument();
    expect(screen.getByText('SUB-1')).toBeInTheDocument();
  });

  it('renders transfer instructions from nested transferInstructions', async () => {
    useSubscription.mockReturnValue({ data: freeSub });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Wema Bank');
    expect(screen.getByText('TestFlow Ltd')).toBeInTheDocument();
    expect(screen.getByText('Transfer exact amount.')).toBeInTheDocument();
    expect(screen.getByText(/Account valid until/)).toBeInTheDocument();
  });

  it('keeps the transfer details on screen when the server answers "pending"', async () => {
    useSubscription.mockReturnValue({ data: freeSub });
    wsApi.subscriptionPaymentStatus.mockResolvedValue({ status: 'pending', payment: { status: 'initialized' } });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Wema Bank');
    await new Promise((r) => setTimeout(r, 6300));
    expect(wsApi.subscriptionPaymentStatus).toHaveBeenCalled();
    expect(screen.getByText('Wema Bank')).toBeInTheDocument();
  }, 12000);

  it('uses changePlan for upgrade on an existing paid subscription', async () => {
    useSubscription.mockReturnValue({ data: proSub });
    render(<BillingScreen />);
    await screen.findByText('Upgrade to Studio');
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    expect(wsApi.changePlan).toHaveBeenCalledWith('sub1', 'studio', expect.any(String));
    expect(wsApi.subscriptionCheckout).not.toHaveBeenCalled();
  });

  it('does not show pending UI for a scheduled downgrade (no reference)', async () => {
    useSubscription.mockReturnValue({ data: studioSub });
    wsApi.changePlan.mockResolvedValue({});
    render(<BillingScreen />);
    await screen.findByText('Switch to Pro');
    fireEvent.click(screen.getByText('Switch to Pro'));
    await new Promise((r) => setTimeout(r, 100));
    expect(wsApi.changePlan).toHaveBeenCalled();
    expect(screen.queryByText('Wema Bank')).not.toBeInTheDocument();
    expect(screen.queryByText('Awaiting transfer')).not.toBeInTheDocument();
  });

  it('uses renew for renewal', async () => {
    useSubscription.mockReturnValue({ data: studioSub });
    render(<BillingScreen />);
    await screen.findByText('Renew early');
    fireEvent.click(screen.getByText('Renew early'));
    await screen.findByText('Wema Bank');
    expect(wsApi.renew).toHaveBeenCalledWith('sub1', expect.any(String));
  });

  it('treats status paid as success and stops polling', async () => {
    useSubscription.mockReturnValue({ data: freeSub });
    wsApi.subscriptionCheckout.mockResolvedValue({
      ...transferInstructions,
      reference: 'SUB-1',
      planName: 'Studio',
      status: 'paid',
    });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Payment received');
    expect(wsApi.subscriptionPaymentStatus).not.toHaveBeenCalled();
  });

  it('treats status success as success', async () => {
    useSubscription.mockReturnValue({ data: freeSub });
    wsApi.subscriptionCheckout.mockResolvedValue({
      ...transferInstructions,
      reference: 'SUB-1',
      planName: 'Studio',
      status: 'success',
    });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Payment received');
  });

  it('treats abandoned as terminal failure, not pending', async () => {
    useSubscription.mockReturnValue({ data: freeSub });
    wsApi.subscriptionCheckout.mockResolvedValue({
      ...transferInstructions,
      reference: 'SUB-1',
      planName: 'Studio',
      status: 'abandoned',
    });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('abandoned');
    // Abandoned is terminal: no polling should be scheduled.
    expect(wsApi.subscriptionPaymentStatus).not.toHaveBeenCalled();
  });

  it('uses a separate idempotency key for initial subscription checkout', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    useSubscription.mockReturnValue({ data: freeSub });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Wema Bank');
    expect(wsApi.subscriptionCheckout).toHaveBeenCalledWith('o1', 'sub1', 'org-key-1', 'studio');
    expect(wsApi.changePlan).not.toHaveBeenCalled();
  });

  it('uses a separate idempotency key for upgrades on an existing subscription', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    useSubscription.mockReturnValue({ data: proSub });
    wsApi.changePlan.mockResolvedValueOnce({
      ...transferInstructions,
      reference: 'SUB-UPGRADE',
      planKey: 'studio',
      planName: 'Studio',
      amountKobo: 2000000,
      currency: 'NGN',
      status: 'initialized',
    });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Wema Bank');
    expect(wsApi.changePlan).toHaveBeenCalledWith('sub1', 'studio', 'org-key-1');
    expect(wsApi.subscriptionCheckout).not.toHaveBeenCalled();
  });

  it('uses a separate idempotency key for renewals', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    useSubscription.mockReturnValue({ data: studioSub });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Renew early'));
    await screen.findByText('Wema Bank');
    expect(wsApi.renew).toHaveBeenCalledWith('sub1', 'org-key-1');
  });

  it('clears idempotency keys after a completed checkout so a new purchase is fresh', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    wsApi.subscriptionCheckout.mockResolvedValueOnce({
      ...transferInstructions,
      reference: 'SUB-1',
      planKey: 'studio',
      planName: 'Studio',
      amountKobo: 2000000,
      currency: 'NGN',
      status: 'paid',
    });
    wsApi.subscriptionCheckout.mockResolvedValueOnce({
      ...transferInstructions,
      reference: 'SUB-2',
      planKey: 'studio',
      planName: 'Studio',
      amountKobo: 2000000,
      currency: 'NGN',
      status: 'paid',
    });
    useSubscription.mockReturnValue({ data: freeSub });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Payment received');
    fireEvent.click(screen.getByText('Done'));
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Payment received');
    expect(wsApi.subscriptionCheckout).toHaveBeenCalledTimes(2);
    const keys = wsApi.subscriptionCheckout.mock.calls.map((c) => c[2]);
    expect(keys[0]).not.toBe(keys[1]);
  });

  it('terminal checkout clears only the checkout idempotency key', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    useSubscription.mockReturnValue({ data: freeSub });
    // Seed all three idempotency keys.
    localStorage.setItem('tf_org_idem_o1_sub1_checkout', 'key-checkout');
    localStorage.setItem('tf_org_idem_o1_sub1_upgrade', 'key-upgrade');
    localStorage.setItem('tf_org_idem_o1_sub1_renew', 'key-renew');

    wsApi.subscriptionCheckout.mockResolvedValue({
      ...transferInstructions,
      reference: 'SUB-1',
      planKey: 'studio',
      planName: 'Studio',
      amountKobo: 2000000,
      currency: 'NGN',
      status: 'paid',
    });
    render(<BillingScreen />);
    await act(async () => {
      fireEvent.click(screen.getByText('Upgrade to Studio'));
    });
    await screen.findByText('Payment received');

    // Checkout key should be cleared; upgrade and renew keys should survive.
    expect(localStorage.getItem('tf_org_idem_o1_sub1_checkout')).toBeNull();
    expect(localStorage.getItem('tf_org_idem_o1_sub1_upgrade')).toBe('key-upgrade');
    expect(localStorage.getItem('tf_org_idem_o1_sub1_renew')).toBe('key-renew');
  });

  it('terminal upgrade clears only the upgrade idempotency key', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    useSubscription.mockReturnValue({ data: proSub });
    wsApi.changePlan.mockResolvedValue({
      ...transferInstructions,
      reference: 'SUB-U',
      planKey: 'studio',
      planName: 'Studio',
      amountKobo: 2000000,
      currency: 'NGN',
      status: 'paid',
    });
    localStorage.setItem('tf_org_idem_o1_sub1_checkout', 'key-checkout');
    localStorage.setItem('tf_org_idem_o1_sub1_upgrade', 'key-upgrade');
    localStorage.setItem('tf_org_idem_o1_sub1_renew', 'key-renew');

    render(<BillingScreen />);
    await act(async () => {
      fireEvent.click(screen.getByText('Upgrade to Studio'));
    });
    await screen.findByText('Payment received');

    expect(localStorage.getItem('tf_org_idem_o1_sub1_checkout')).toBe('key-checkout');
    expect(localStorage.getItem('tf_org_idem_o1_sub1_upgrade')).toBeNull();
    expect(localStorage.getItem('tf_org_idem_o1_sub1_renew')).toBe('key-renew');
  });

  it('terminal renewal clears only the renewal idempotency key', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    useSubscription.mockReturnValue({ data: studioSub });
    wsApi.renew.mockResolvedValue({
      ...transferInstructions,
      reference: 'SUB-R',
      amountKobo: 700000,
      currency: 'NGN',
      status: 'paid',
    });
    localStorage.setItem('tf_org_idem_o1_sub1_checkout', 'key-checkout');
    localStorage.setItem('tf_org_idem_o1_sub1_upgrade', 'key-upgrade');
    localStorage.setItem('tf_org_idem_o1_sub1_renew', 'key-renew');

    render(<BillingScreen />);
    await act(async () => {
      fireEvent.click(screen.getByText('Renew early'));
    });
    await screen.findByText('Payment received');

    expect(localStorage.getItem('tf_org_idem_o1_sub1_checkout')).toBe('key-checkout');
    expect(localStorage.getItem('tf_org_idem_o1_sub1_upgrade')).toBe('key-upgrade');
    expect(localStorage.getItem('tf_org_idem_o1_sub1_renew')).toBeNull();
  });

  it('unrelated operation keys survive terminal-state cleanup', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    useSubscription.mockReturnValue({ data: freeSub });
    localStorage.setItem('tf_org_idem_o1_sub1_checkout', 'key-checkout');
    localStorage.setItem('tf_org_idem_o1_sub1_upgrade', 'key-upgrade');
    localStorage.setItem('tf_org_idem_o1_sub1_renew', 'key-renew');

    wsApi.subscriptionCheckout.mockResolvedValue({
      ...transferInstructions,
      reference: 'SUB-1',
      planKey: 'studio',
      planName: 'Studio',
      amountKobo: 2000000,
      currency: 'NGN',
      status: 'failed',
    });
    render(<BillingScreen />);
    await act(async () => {
      fireEvent.click(screen.getByText('Upgrade to Studio'));
    });
    // Allow the async checkout handler to complete and state to flush.
    await new Promise((r) => setTimeout(r, 100));

    // Checkout key cleared on terminal failure; unrelated keys survive.
    expect(localStorage.getItem('tf_org_idem_o1_sub1_checkout')).toBeNull();
    expect(localStorage.getItem('tf_org_idem_o1_sub1_upgrade')).toBe('key-upgrade');
    expect(localStorage.getItem('tf_org_idem_o1_sub1_renew')).toBe('key-renew');
  });

  it('pending operations retain their keys across retries', async () => {
    globalThis.crypto.randomUUID = vi.fn(() => `org-key-${++orgUuidCounter}`);
    useSubscription.mockReturnValue({ data: freeSub });

    // First attempt: pending (not terminal).
    wsApi.subscriptionCheckout.mockResolvedValue({
      ...transferInstructions,
      reference: 'SUB-1',
      planKey: 'studio',
      planName: 'Studio',
      amountKobo: 2000000,
      currency: 'NGN',
      status: 'initialized',
    });
    render(<BillingScreen />);
    fireEvent.click(screen.getByText('Upgrade to Studio'));
    await screen.findByText('Wema Bank');

    const keyBefore = localStorage.getItem('tf_org_idem_o1_sub1_checkout');
    expect(keyBefore).toBe('org-key-1');

    // Same checkout retried manually: should reuse the same key.
    fireEvent.click(screen.getByText('Check payment status'));
    await new Promise((r) => setTimeout(r, 50));
    expect(localStorage.getItem('tf_org_idem_o1_sub1_checkout')).toBe(keyBefore);
  });

  it('recovers an existing checkout without initializing a new one', async () => {
    useSubscription.mockReturnValue({ data: freeSub });
    localStorage.setItem(
      'tf_org_checkout_o1_sub1',
      JSON.stringify({ reference: 'SUB-EXISTING', operation: 'checkout' }),
    );
    localStorage.setItem('tf_org_idem_o1_sub1_checkout', 'key-checkout');
    wsApi.subscriptionPaymentStatus.mockResolvedValue({
      payment: { ...transferInstructions, reference: 'SUB-EXISTING', status: 'initialized' },
    });
    render(<BillingScreen />);
    // Recovery must not start a new checkout.
    expect(wsApi.subscriptionCheckout).not.toHaveBeenCalled();
    expect(wsApi.changePlan).not.toHaveBeenCalled();
    // Recovery reuses the existing idempotency key.
    expect(localStorage.getItem('tf_org_idem_o1_sub1_checkout')).toBe('key-checkout');
    await screen.findByText('Awaiting transfer');
    expect(wsApi.subscriptionCheckoutStatus).toHaveBeenCalledWith('o1', 'sub1', 'SUB-EXISTING');
  });
});
