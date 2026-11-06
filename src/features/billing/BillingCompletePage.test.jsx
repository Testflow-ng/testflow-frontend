import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import { render } from '../../test/customRender.jsx';
import BillingCompletePage from './BillingCompletePage.jsx';

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
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useSearchParams: vi.fn() };
});

import { billingApi } from './api.js';
import { useSearchParams } from 'react-router-dom';

const renderWithRef = (reference) => {
  vi.mocked(useSearchParams).mockReturnValue([
    reference ? new URLSearchParams({ reference }) : new URLSearchParams(),
  ]);
  render(<BillingCompletePage />);
};

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

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(billingApi.refreshStatus).mockResolvedValue({
    purchase: { ...transferInstructions, reference: 'TFS-1', status: 'initialized' },
  });
  vi.mocked(billingApi.checkoutStatus).mockResolvedValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('student callback page /billing/complete', () => {
  it('renders failed when no reference is present', () => {
    renderWithRef(null);
    expect(screen.getByText(/Payment did not go through/)).toBeInTheDocument();
  });

  it('verifies backend-confirmed paid payment', async () => {
    vi.mocked(billingApi.refreshStatus).mockResolvedValue({
      purchase: { ...transferInstructions, reference: 'TFS-1', status: 'paid' },
    });
    renderWithRef('TFS-1');
    await screen.findByText(/Payment received/);
    expect(billingApi.refreshStatus).toHaveBeenCalled();
  });

  it('verifies backend-confirmed success payment', async () => {
    vi.mocked(billingApi.refreshStatus).mockResolvedValue({
      purchase: { ...transferInstructions, reference: 'TFS-1', status: 'success' },
    });
    renderWithRef('TFS-1');
    await screen.findByText(/Payment received/);
  });

  it('treats failed payment as terminal failure', async () => {
    vi.mocked(billingApi.refreshStatus).mockResolvedValue({
      purchase: { ...transferInstructions, reference: 'TFS-1', status: 'failed' },
    });
    renderWithRef('TFS-1');
    await screen.findByText(/Payment did not go through/);
  });

  it('treats expired payment as terminal failure', async () => {
    vi.mocked(billingApi.refreshStatus).mockResolvedValue({
      purchase: { ...transferInstructions, reference: 'TFS-1', status: 'expired' },
    });
    renderWithRef('TFS-1');
    await screen.findByText(/Payment did not go through/);
  });

  it('treats abandoned payment as terminal failure', async () => {
    vi.mocked(billingApi.refreshStatus).mockResolvedValue({
      purchase: { ...transferInstructions, reference: 'TFS-1', status: 'abandoned' },
    });
    renderWithRef('TFS-1');
    await screen.findByText(/Payment did not go through/);
  });

  it('treats cancelled payment as terminal failure', async () => {
    vi.mocked(billingApi.refreshStatus).mockResolvedValue({
      purchase: { ...transferInstructions, reference: 'TFS-1', status: 'cancelled' },
    });
    renderWithRef('TFS-1');
    await screen.findByText(/Payment did not go through/);
  });

  it('does not treat the callback URL alone as proof of payment', async () => {
    vi.mocked(billingApi.refreshStatus).mockResolvedValue({
      purchase: { ...transferInstructions, reference: 'TFS-1', status: 'initialized' },
    });
    vi.mocked(billingApi.checkoutStatus).mockResolvedValue(null);
    renderWithRef('TFS-1');
    // Non-terminal status stays pending after bounded retries, never success.
    expect(screen.getByText(/Confirming your payment/)).toBeInTheDocument();
  });

  it('remains pending after the retry limit without backend confirmation', async () => {
    // Resolve the setTimeout delay immediately so all 8 retries run without real timers.
    const setTimeoutMock = vi
      .spyOn(globalThis, 'setTimeout')
      .mockImplementation((cb) => { cb(); return 0; });
    try {
      vi.mocked(billingApi.refreshStatus).mockResolvedValue({
        purchase: { ...transferInstructions, reference: 'TFS-1', status: 'initialized' },
      });
      vi.mocked(billingApi.checkoutStatus).mockResolvedValue(null);
      renderWithRef('TFS-1');
      expect(screen.getByText(/Confirming your payment/)).toBeInTheDocument();
      // Flush the microtask cascade so the 8-iteration retry loop completes.
      await act(async () => {
        for (let i = 0; i < 40; i += 1) await Promise.resolve();
      });
      expect(screen.getByText(/Still confirming/)).toBeInTheDocument();
      expect(billingApi.refreshStatus).toHaveBeenCalledTimes(8);
    } finally {
      setTimeoutMock.mockRestore();
    }
  });

  it('shows reference and amount details', async () => {
    vi.mocked(billingApi.refreshStatus).mockResolvedValue({
      purchase: { ...transferInstructions, reference: 'TFS-1', status: 'paid' },
    });
    renderWithRef('TFS-1');
    await screen.findByText(/Payment received/);
    expect(screen.getByText('TFS-1')).toBeInTheDocument();
    expect(screen.getByText('₦500')).toBeInTheDocument();
  });
});
