import { useState } from 'react';
import { Clock, ShieldCheck, Copy, Check, Building2, UserCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CopyField, useToast } from '../ui/index.js';
import { ICON } from '../ui/iconProps.js';
import { formatMoney } from '../../utils/money.js';
import { cn } from '../../utils/cn.js';
import { normalizeTransfer } from '../../utils/transfer.js';

function fmtExpiry(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function BankTransferInstructions({ transfer, className, title = 'Transfer instructions', subtitle }) {
  const toast = useToast();
  const t = normalizeTransfer(transfer);
  const amount = t.amountKobo != null ? formatMoney(Number(t.amountKobo), t.currency) : null;
  const rawNumericAmount = t.amountKobo != null ? String(t.amountKobo / 100) : '';

  const [copiedAmount, setCopiedAmount] = useState(false);

  const copyAmount = async () => {
    if (!rawNumericAmount) return;
    try {
      await navigator.clipboard.writeText(rawNumericAmount);
      setCopiedAmount(true);
      toast.success('Amount copied', `₦${rawNumericAmount} copied to clipboard.`);
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch {
      toast.error('Copy failed', 'Please enter the amount manually.');
    }
  };

  const hasAccountDetails = Boolean(t.accountNumber);

  return (
    <Card padding="lg" className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck {...ICON} />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-extrabold tracking-tight text-foreground-strong">{title}</h3>
          <p className="mt-1 text-sm text-muted">
            {subtitle ?? 'Pay by bank transfer using the dedicated details below. Your plan activates automatically once confirmed.'}
          </p>
        </div>
      </div>

      {/* Amount Box */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-strong/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Exact amount to transfer</p>
          <p className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-foreground-strong">
            {amount ?? '—'}
          </p>
          <p className="mt-1 text-xs text-muted">
            Transfer this exact amount. Any other amount may delay or prevent automatic activation.
          </p>
        </div>
        {rawNumericAmount && (
          <button
            type="button"
            onClick={copyAmount}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full border border-border bg-surface px-3.5 text-xs font-semibold text-foreground-strong shadow-sm hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:self-center"
          >
            {copiedAmount ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            {copiedAmount ? 'Copied' : 'Copy Amount'}
          </button>
        )}
      </div>

      {/* Dedicated Bank Details Card */}
      {hasAccountDetails ? (
        <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4.5 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {t.bankName && (
              <div className="rounded-xl border border-border/80 bg-surface p-3.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <Building2 size={14} aria-hidden="true" />
                  <span>Bank name</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground-strong">{t.bankName}</p>
              </div>
            )}
            {t.accountName && (
              <div className="rounded-xl border border-border/80 bg-surface p-3.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <UserCircle2 size={14} aria-hidden="true" />
                  <span>Account name</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground-strong">{t.accountName}</p>
              </div>
            )}
          </div>

          {/* Account Number with prominent CopyField */}
          <div className="rounded-xl border border-border/80 bg-surface p-3.5 shadow-sm">
            <CopyField
              label="Account number"
              value={String(t.accountNumber)}
              onCopy={() => toast.success('Account number copied', 'Paste this into your banking app.')}
            />
          </div>

          {/* Payment Reference */}
          {t.reference && (
            <div className="rounded-xl border border-border/80 bg-surface p-3.5 shadow-sm">
              <CopyField
                label="Payment reference (narration / remarks)"
                value={String(t.reference)}
                onCopy={() => toast.success('Reference copied', 'Use this as your payment narration.')}
              />
              <p className="mt-2 text-xs text-muted">
                Enter this reference as the transfer narration or remarks in your bank app so we can match your payment instantly.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-8 text-center">
          <span className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground-strong">Generating dedicated bank transfer details…</p>
          <p className="text-xs text-muted">Contacting Paystack to create your temporary account. Please wait a moment.</p>
        </div>
      )}

      {/* Expiry & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        {t.expiresAt && (
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground-strong/80">
            <Clock size={14} className="text-primary" aria-hidden="true" />
            Account valid until: {fmtExpiry(t.expiresAt)}
          </span>
        )}
        {t.currency && <span>Currency: {t.currency}</span>}
      </div>

      {/* Helpful step-by-step guidance */}
      <div className="rounded-2xl border border-border bg-surface-strong/30 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">How to complete your transfer</p>
        <ol className="mt-2.5 space-y-2 text-xs leading-relaxed text-muted">
          <li className="flex items-start gap-2">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">1</span>
            <span>Open your banking app, internet banking, or mobile USSD service.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">2</span>
            <span>Transfer the exact amount of <strong>{amount ?? 'the plan price'}</strong> to the account number above.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">3</span>
            <span>Put the <strong>Payment reference</strong> into the transfer narration/remarks field.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">4</span>
            <span>After transferring, return here and click <strong>&quot;I&apos;ve Made Payment&quot;</strong> below.</span>
          </li>
        </ol>
      </div>

      {t.displayText && !t.displayText.toLowerCase().includes('please make a transfer') && (
        <div className="rounded-2xl border border-border bg-surface p-3.5 text-xs text-muted">
          {t.displayText}
        </div>
      )}
    </Card>
  );
}

export default BankTransferInstructions;
