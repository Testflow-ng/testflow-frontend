import { Clock, ShieldCheck } from 'lucide-react';
import { Card, CopyField } from '../ui/index.js';
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
  const t = normalizeTransfer(transfer);
  const amount = t.amountKobo != null ? formatMoney(Number(t.amountKobo), t.currency) : null;

  return (
    <Card padding="lg" className={cn('space-y-5', className)}>
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck {...ICON} />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-extrabold tracking-tight text-foreground-strong">{title}</h3>
          <p className="mt-1 text-sm text-muted">{subtitle ?? 'Pay by bank transfer using the details below. Your plan activates only after the payment is confirmed.'}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-strong/40 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Exact amount to transfer</p>
        <p className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-foreground-strong">{amount ?? '—'}</p>
        <p className="mt-1 text-xs text-muted">Transfer this exact amount. A different amount may delay or prevent activation.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {t.bankName && (
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-xs font-semibold text-muted">Bank name</p>
            <p className="mt-1 font-semibold text-foreground-strong">{t.bankName}</p>
          </div>
        )}
        {t.accountName && (
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-xs font-semibold text-muted">Account name</p>
            <p className="mt-1 font-semibold text-foreground-strong">{t.accountName}</p>
          </div>
        )}
      </div>

      {t.accountNumber && <CopyField label="Account number" value={String(t.accountNumber)} />}
      {t.reference && <CopyField label="Transfer reference (use this, not the account number)" value={String(t.reference)} />}

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        {t.expiresAt && (
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" />
            Pay before {fmtExpiry(t.expiresAt)}
          </span>
        )}
        {t.currency && <span>Currency: {t.currency}</span>}
      </div>

      {t.instructions && (
        <div className="rounded-2xl border border-border bg-surface p-3.5 text-sm text-muted">
          {t.instructions}
        </div>
      )}

      <p className="text-xs text-muted">
        Use the transfer reference as the payment narration. Do not reuse it for a different payment. Your subscription becomes active only after TestFlow confirms the transfer.
      </p>
    </Card>
  );
}

export default BankTransferInstructions;
