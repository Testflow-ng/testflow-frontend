import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
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

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
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
    expect(wsApi.subscriptionCheckout).toHaveBeenCalledWith('o1', 'sub1', expect.any(String));
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
    expect(screen.getByText(/Pay before/)).toBeInTheDocument();
  });

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
});
