const pick = (o, ...keys) => {
  for (const k of keys) {
    if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
  }
  return null;
};

export function normalizeTransfer(input) {
  const o = input?.transferInstructions ?? input?.transfer ?? input?.bankTransfer ?? input?.bank_transfer ?? input ?? {};
  const parent = input && typeof input === 'object' && input !== o ? input : {};

  let bankName = pick(o, 'bankName', 'bank_name', 'bank');
  if (bankName && typeof bankName === 'object') {
    bankName = bankName.name || bankName.slug || null;
  }
  if (!bankName && parent) {
    const parentBank = pick(parent, 'bankName', 'bank_name', 'bank');
    bankName = parentBank && typeof parentBank === 'object' ? (parentBank.name || parentBank.slug) : parentBank;
  }

  const amount = pick(o, 'amountKobo', 'amount_kobo', 'amountMinor', 'amount_minor', 'amount')
    ?? pick(parent, 'amountKobo', 'amount_kobo', 'amountMinor', 'amount_minor', 'amount');

  const currency = pick(o, 'currency') ?? pick(parent, 'currency') ?? 'NGN';

  const reference = pick(o, 'transferReference', 'transfer_reference', 'reference', 'paymentReference')
    ?? pick(parent, 'reference', 'transferReference', 'transfer_reference');

  const accountNumber = pick(o, 'accountNumber', 'account_number', 'account')
    ?? pick(parent, 'accountNumber', 'account_number', 'account');

  const rawAccountName = pick(o, 'accountName', 'account_name', 'accountHolder', 'account_holder')
    ?? pick(parent, 'accountName', 'account_name', 'accountHolder', 'account_holder');
  // Paystack's placeholder holder name is shown as Testflow; a missing name stays empty rather than invented.
  const accountName = !rawAccountName
    ? null
    : String(rawAccountName).trim().toUpperCase() === 'PAYSTACK CHECKOUT'
      ? 'Testflow'
      : String(rawAccountName).trim();

  const expiresAt = pick(o, 'expiresAt', 'expiry', 'expiryAt', 'expires_at', 'expiryDate', 'expiry_date')
    ?? pick(parent, 'expiresAt', 'expiry', 'expiryAt', 'expires_at');

  const displayText = pick(o, 'displayText', 'display_text', 'instructions', 'message', 'note', 'notes')
    ?? pick(parent, 'displayText', 'display_text', 'instructions');

  const channel = pick(o, 'channel') ?? pick(parent, 'providerChannel', 'channel') ?? 'bank_transfer';

  return {
    bankName: bankName ? String(bankName) : null,
    accountName: accountName ? String(accountName) : null,
    accountNumber: accountNumber ? String(accountNumber) : null,
    amountKobo: amount != null ? Number(amount) : null,
    currency: String(currency).toUpperCase(),
    reference: reference ? String(reference) : null,
    expiresAt,
    displayText: displayText ? String(displayText) : null,
    channel,
  };
}
