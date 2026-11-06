import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import { render } from '../../../test/customRender.jsx';
import BillingCompleteScreen from './BillingCompleteScreen.jsx';

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
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useSearchParams: vi.fn() };
});

import { wsApi } from '../api.js';
import { useSearchParams } from 'react-router-dom';

const renderWithParams = (reference, orgId = 'o1', subId = 'sub1') => {
  const params = new URLSearchParams();
  if (reference) params.set('reference', reference);
  if (orgId) params.set('orgId', orgId);
  if (subId) params.set('subId', subId);
  vi.mocked(useSearchParams).mockReturnValue([params]);
  render(<BillingCompleteScreen />);
};

const payment = {
  reference: 'SUB-1',
  amountKobo: 2000000,
  currency: 'NGN',
  status: 'initialized',
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
    payment: { ...payment, status: 'paid' },
  });
  vi.mocked(wsApi.verifyPayment).mockResolvedValue({
    payment: { ...payment, status: 'paid' },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('organisation callback page /workspace/billing/complete', () => {
  it('renders failed when no reference is present', () => {
    renderWithParams(null);
    expect(screen.getByText(/Payment did not go through/)).toBeInTheDocument();
  });

  it('verifies backend-confirmed paid payment via organisation verify endpoint', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      payment: { ...payment, status: 'paid' },
    });
    renderWithParams('SUB-1');
    await screen.findByText(/Payment received/);
    expect(wsApi.verifySubscriptionPayment).toHaveBeenCalledWith('o1', 'sub1', 'SUB-1');
    expect(wsApi.verifyPayment).not.toHaveBeenCalled();
  });

  it('verifies backend-confirmed success payment', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      payment: { ...payment, status: 'success' },
    });
    renderWithParams('SUB-1');
    await screen.findByText(/Payment received/);
  });

  it('falls back to flat payments/verify when org context is absent', async () => {
    vi.mocked(wsApi.verifyPayment).mockResolvedValue({
      payment: { ...payment, status: 'paid' },
    });
    renderWithParams('SUB-1', null, null);
    await screen.findByText(/Payment received/);
    expect(wsApi.verifyPayment).toHaveBeenCalledWith('SUB-1');
  });

  it('treats failed payment as terminal failure', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      payment: { ...payment, status: 'failed' },
    });
    renderWithParams('SUB-1');
    await screen.findByText(/Payment did not go through/);
  });

  it('treats expired payment as terminal failure', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      payment: { ...payment, status: 'expired' },
    });
    renderWithParams('SUB-1');
    await screen.findByText(/Payment did not go through/);
  });

  it('treats abandoned payment as terminal failure', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      payment: { ...payment, status: 'abandoned' },
    });
    renderWithParams('SUB-1');
    await screen.findByText(/Payment did not go through/);
  });

  it('treats cancelled and canceled payments as terminal failure', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      payment: { ...payment, status: 'canceled' },
    });
    renderWithParams('SUB-1');
    await screen.findByText(/Payment did not go through/);
  });

  it('does not treat the callback URL alone as proof of payment', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      payment: { ...payment, status: 'initialized' },
    });
    renderWithParams('SUB-1');
    expect(screen.getByText(/Confirming your payment/)).toBeInTheDocument();
  });

  it('remains pending after the retry limit without backend confirmation', async () => {
    const setTimeoutMock = vi
      .spyOn(globalThis, 'setTimeout')
      .mockImplementation((cb) => { cb(); return 0; });
    try {
      vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
        payment: { ...payment, status: 'initialized' },
      });
      renderWithParams('SUB-1');
      expect(screen.getByText(/Confirming your payment/)).toBeInTheDocument();
      await act(async () => {
        for (let i = 0; i < 40; i += 1) await Promise.resolve();
      });
      expect(screen.getByText(/Still confirming/)).toBeInTheDocument();
      expect(wsApi.verifySubscriptionPayment).toHaveBeenCalledTimes(8);
    } finally {
      setTimeoutMock.mockRestore();
    }
  });

  it('treats a backend-confirmed subscription object as success', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      subscription: { id: 'sub1', planKey: 'studio', planName: 'Studio' },
    });
    renderWithParams('SUB-1');
    await screen.findByText(/Payment received/);
  });

  it('shows reference and amount details', async () => {
    vi.mocked(wsApi.verifySubscriptionPayment).mockResolvedValue({
      payment: { ...payment, status: 'paid' },
    });
    renderWithParams('SUB-1');
    await screen.findByText(/Payment received/);
    expect(screen.getByText('SUB-1')).toBeInTheDocument();
    expect(screen.getByText('₦20,000')).toBeInTheDocument();
  });
});
