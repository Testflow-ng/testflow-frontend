const pick = (o, ...keys) => {
  for (const k of keys) {
    if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
  }
  return null;
};

export function normalizeTransfer(input) {
  const o = input?.transferInstructions ?? input?.transfer ?? input?.bankTransfer ?? input?.bank_transfer ?? input ?? {};
  const amount = pick(o, 'amountKobo', 'amount_kobo', 'amountMinor', 'amount_minor', 'amount');
  return {
    bankName: pick(o, 'bankName', 'bank_name', 'bank'),
    accountName: pick(o, 'accountName', 'account_name', 'accountHolder', 'account_holder'),
    accountNumber: pick(o, 'accountNumber', 'account_number', 'account'),
    amountKobo: amount,
    currency: pick(o, 'currency') ?? 'NGN',
    reference: pick(o, 'transferReference', 'transfer_reference', 'reference', 'paymentReference'),
    expiresAt: pick(o, 'expiresAt', 'expiry', 'expiryAt', 'expires_at', 'expiryDate', 'expiry_date'),
    displayText: pick(o, 'displayText', 'display_text', 'instructions', 'message', 'note', 'notes'),
    channel: pick(o, 'channel'),
  };
}
