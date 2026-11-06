import { describe, it, expect } from 'vitest';
import { normalizeTransfer } from './transfer.js';

describe('normalizeTransfer', () => {
  it('prioritizes transferInstructions', () => {
    const t = normalizeTransfer({
      transferInstructions: {
        bankName: 'Wema Bank',
        accountName: 'TestFlow Ltd',
        accountNumber: '0123456789',
        amountKobo: 50000,
        currency: 'NGN',
        transferReference: 'TFS-123',
        expiresAt: '2026-11-07T10:00:00Z',
        displayText: 'Transfer exact amount.',
        channel: 'bank_transfer',
      },
    });
    expect(t).toMatchObject({
      bankName: 'Wema Bank',
      accountName: 'TestFlow Ltd',
      accountNumber: '0123456789',
      amountKobo: 50000,
      currency: 'NGN',
      reference: 'TFS-123',
      displayText: 'Transfer exact amount.',
      channel: 'bank_transfer',
    });
  });

  it('formats amount from amountKobo via caller', () => {
    const t = normalizeTransfer({ transferInstructions: { amountKobo: 700000, currency: 'NGN' } });
    expect(t.amountKobo).toBe(700000);
    expect(t.currency).toBe('NGN');
  });

  it('falls back to legacy transfer shape', () => {
    const t = normalizeTransfer({
      transfer: { bankName: 'GTBank', accountNumber: '1234567890', amountKobo: 50000, reference: 'REF-1' },
    });
    expect(t.bankName).toBe('GTBank');
    expect(t.accountNumber).toBe('1234567890');
    expect(t.reference).toBe('REF-1');
  });

  it('handles missing/null fields without inventing details', () => {
    const t = normalizeTransfer({});
    expect(t.bankName).toBeNull();
    expect(t.accountName).toBeNull();
    expect(t.accountNumber).toBeNull();
    expect(t.amountKobo).toBeNull();
    expect(t.currency).toBe('NGN');
    expect(t.reference).toBeNull();
    expect(t.expiresAt).toBeNull();
    expect(t.displayText).toBeNull();
  });

  it('handles null input', () => {
    expect(() => normalizeTransfer(null)).not.toThrow();
    expect(normalizeTransfer(null).bankName).toBeNull();
  });

  it('does not fall back to top-level transferReference when nested absent', () => {
    const t = normalizeTransfer({ transferReference: 'TOP', bankName: 'Bank' });
    expect(t.bankName).toBe('Bank');
    expect(t.reference).toBe('TOP');
  });
});
