import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test/customRender.jsx';
import BillingPage from './BillingPage.jsx';

vi.mock('./api.js', () => ({
  billingApi: {
    products: vi.fn(),
    entitlement: vi.fn(),
    checkout: vi.fn(),
    checkoutStatus: vi.fn(),
    status: vi.fn(),
    refreshStatus: vi.fn(),
    cancel: vi.fn(),
    purchases: vi.fn(),
  },
}));
vi.mock('./useBilling.js', () => ({
  useProducts: vi.fn(),
  useEntitlement: vi.fn(),
  usePurchases: vi.fn(),
  hasLibraryAccess: vi.fn(() => true),
  hasAiEarlyAccess: vi.fn(() => false),
  hasCustomCbtAccess: vi.fn(() => false),
}));

import { billingApi } from './api.js';
import { useProducts, useEntitlement } from './useBilling.js';

const transferInstructions = {
  bankName: 'Wema Bank',
  accountName: 'TestFlow Ltd',
  accountNumber: '0123456789',
  amountKobo: 50000,
  currency: 'NGN',
  transferReference: 'TFS-MOCK123',
  expiresAt: '2026-11-07T10:00:00Z',
  displayText: 'Transfer the exact amount.',
};

const plans = [
  {
    key: 'pass_30d',
    name: 'Plus',
    description: '30 days of ad-free study.',
    priceMinor: 50000,
    currency: 'NGN',
    durationDays: 30,
    available: true,
    comingSoon: false,
    removesAds: true,
    entitlements: { adFree: true, liveCbtHost: true, library: true, aiEarlyAccess: true, customCbt: true },
  },
  {
    key: 'pass_90d',
    name: 'Pro',
    description: 'Coming soon.',
    priceMinor: 150000,
    currency: 'NGN',
    durationDays: 90,
    available: false,
    comingSoon: true,
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  if (!globalThis.crypto) globalThis.crypto = {};
  globalThis.crypto.randomUUID = vi.fn(() => 'test-idem-key');
  useProducts.mockReturnValue({ data: plans, isLoading: false, error: null });
  useEntitlement.mockReturnValue({ data: { status: 'free', adFree: false }, isLoading: false });
  billingApi.checkout.mockResolvedValue({
    reference: 'TFS-1',
    planKey: 'pass_30d',
    planName: 'Plus',
    amountKobo: 50000,
    currency: 'NGN',
    status: 'initialized',
    transferInstructions,
  });
  billingApi.refreshStatus.mockResolvedValue({ purchase: { status: 'initialized', transferInstructions } });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('student checkout', () => {
  it('initializes checkout with paystack_bank_transfer and an idempotency key', async () => {
    render(<BillingPage />);
    await screen.findByText('Get Plus');
    fireEvent.click(screen.getByText('Get Plus'));
    await screen.findByText('Wema Bank');
    const [planKey, idemKey] = billingApi.checkout.mock.calls[0];
    expect(planKey).toBe('pass_30d');
    expect(typeof idemKey).toBe('string');
    expect(idemKey.length).toBeGreaterThan(0);
    expect(screen.getByText('0123456789')).toBeInTheDocument();
    expect(screen.getByText('TFS-MOCK123')).toBeInTheDocument();
    expect(screen.getByText('Transfer the exact amount.')).toBeInTheDocument();
  });

  it('does not create duplicate checkouts on rapid clicks', async () => {
    render(<BillingPage />);
    await screen.findByText('Get Plus');
    const btn = screen.getByText('Get Plus');
    fireEvent.click(btn);
    fireEvent.click(btn);
    await screen.findByText('Wema Bank');
    expect(billingApi.checkout).toHaveBeenCalledTimes(1);
  });

  it('treats status paid as success and stops polling', async () => {
    billingApi.checkout.mockResolvedValue({
      ...transferInstructions,
      reference: 'TFS-1',
      planName: 'Plus',
      status: 'paid',
    });
    render(<BillingPage />);
    fireEvent.click(screen.getByText('Get Plus'));
    await screen.findByText('Payment received');
    expect(billingApi.refreshStatus).not.toHaveBeenCalled();
  });

  it('treats status success as success', async () => {
    billingApi.checkout.mockResolvedValue({
      ...transferInstructions,
      reference: 'TFS-1',
      planName: 'Plus',
      status: 'success',
    });
    render(<BillingPage />);
    fireEvent.click(screen.getByText('Get Plus'));
    await screen.findByText('Payment received');
  });

  it('treats abandoned as terminal failure, not pending', async () => {
    billingApi.checkout.mockResolvedValue({
      ...transferInstructions,
      reference: 'TFS-1',
      planName: 'Plus',
      status: 'abandoned',
    });
    render(<BillingPage />);
    fireEvent.click(screen.getByText('Get Plus'));
    await screen.findByText('abandoned');
    expect(screen.queryByText('Awaiting transfer')).not.toBeInTheDocument();
  });

  it('treats paymentState paid as success even when status differs', async () => {
    billingApi.checkout.mockResolvedValue({
      ...transferInstructions,
      reference: 'TFS-1',
      planName: 'Plus',
      status: 'initialized',
      paymentState: 'paid',
    });
    render(<BillingPage />);
    fireEvent.click(screen.getByText('Get Plus'));
    await screen.findByText('Payment received');
  });
});
