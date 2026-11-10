import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../test/customRender.jsx';
import PayoutCard from './PayoutCard.jsx';

vi.mock('./api.js', () => ({ wsApi: { verifyAccount: vi.fn(), savePayout: vi.fn() } }));
vi.mock('./useWorkspace.js', () => ({
  useBanks: vi.fn(() => ({ data: [{ code: '044', name: 'Access Bank' }] })),
  useWsMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import { wsApi } from './api.js';

const org = { id: 'o1', name: 'Grace CBT', payout: { bankCode: '044' } };

describe('PayoutCard account name check', () => {
  beforeEach(() => vi.clearAllMocks());

  it('looks the account name up by itself once the 10th digit is typed, with no button', async () => {
    wsApi.verifyAccount.mockResolvedValue({ accountName: 'GRACE ADEBAYO' });
    render(<PayoutCard org={org} bare />);
    expect(screen.queryByText('Check account name')).not.toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: /account number/i });
    fireEvent.change(input, { target: { value: '012345678' } });
    await new Promise((r) => setTimeout(r, 450));
    expect(wsApi.verifyAccount).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '0123456789' } });
    expect(await screen.findByText('GRACE ADEBAYO')).toBeInTheDocument();
    expect(wsApi.verifyAccount).toHaveBeenCalledWith('o1', { bankCode: '044', accountNumber: '0123456789' });
    expect(wsApi.verifyAccount).toHaveBeenCalledTimes(1);
  });

  it('shows the error when the account is not found', async () => {
    wsApi.verifyAccount.mockRejectedValue(new Error('Could not resolve account name'));
    render(<PayoutCard org={org} bare />);
    fireEvent.change(screen.getByRole('textbox', { name: /account number/i }), { target: { value: '0123456789' } });
    await waitFor(() => expect(screen.getByText('Could not resolve account name')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /save payout account/i })).toBeDisabled();
  });
});
