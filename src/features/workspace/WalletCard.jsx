import { useState } from 'react';
import { ArrowUpRight, Landmark } from 'lucide-react';
import { Banner, Button, Card, Field, Input, Modal, Skeleton, StatusBadge, useToast } from '../../components/ui/index.js';
import { ICON } from '../../components/ui/iconProps.js';
import { formatMoney } from '../../utils/money.js';
import { fmtDate } from '../admin/screens/format.js';
import { wsApi } from './api.js';
import { useWallet, useWithdrawals, useWsMutation } from './useWorkspace.js';

// Paystack's transfer fee, taken out of the withdrawal: N10 up to N5,000, N25 up to N50,000, N50 above.
const feeFor = (kobo) => (kobo <= 500000 ? 1000 : kobo <= 5000000 ? 2500 : 5000);
const toKobo = (naira) => Math.round(Number(naira) * 100);

// The four things a withdrawal can be, in words an organiser uses.
const BADGE = {
  pending: { status: 'pending', label: 'Confirming' },
  processing: { status: 'pending', label: 'On its way' },
  success: { status: 'paid', label: 'Paid' },
  failed: { status: 'failed', label: 'Failed' },
};

function WithdrawModal({ open, onOpenChange, wallet }) {
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const kobo = amount ? toKobo(amount) : 0;
  const fee = kobo ? feeFor(kobo) : 0;
  const tooLow = kobo > 0 && kobo < wallet.minimumKobo;
  const tooHigh = kobo > wallet.availableKobo;
  const valid = kobo >= wallet.minimumKobo && !tooHigh;
  const close = (o) => { if (!o) { setAmount(''); setError(''); } onOpenChange(o); };

  const send = useWsMutation((id, k) => wsApi.withdraw(id, k), {
    onSuccess: () => { toast.success('Withdrawal started', 'We will email you when the money arrives.'); close(false); },
    onError: (e) => setError(e.message || 'Could not start the withdrawal.'),
  });

  return (
    <Modal open={open} onOpenChange={close} size="sm" title="Withdraw money" description={wallet.account ? `To ${wallet.account.accountName} ending ${wallet.account.last4}` : undefined}
      footer={<><Button variant="ghost" onClick={() => close(false)}>Cancel</Button><Button loading={send.isPending} disabled={!valid} onClick={() => { setError(''); send.mutate(kobo); }}>Withdraw {valid ? formatMoney(kobo) : ''}</Button></>}>
      <div className="space-y-4 py-1">
        {error && <Banner variant="danger">{error}</Banner>}
        <Field label="Amount in naira" hint={`Available ${formatMoney(wallet.availableKobo)}. Smallest withdrawal ${formatMoney(wallet.minimumKobo)}.`} error={tooLow ? `The smallest withdrawal is ${formatMoney(wallet.minimumKobo)}.` : tooHigh ? 'That is more than your available balance.' : undefined}>
          <Input inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, '').slice(0, 10))} />
        </Field>
        <Button variant="ghost" size="sm" onClick={() => setAmount(String(wallet.availableKobo / 100))} disabled={wallet.availableKobo < wallet.minimumKobo}>Withdraw everything</Button>
        {valid && (
          <dl className="space-y-1.5 rounded-xl bg-surface-strong p-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Transfer fee</dt><dd className="font-semibold text-foreground-strong">{formatMoney(fee)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">You receive</dt><dd className="font-semibold text-foreground-strong">{formatMoney(kobo - fee)}</dd></div>
          </dl>
        )}
      </div>
    </Modal>
  );
}

/** What the organisation can withdraw now, what is on its way, and the last few withdrawals. */
function WalletCard() {
  const { data: wallet, isLoading } = useWallet();
  const { data: list } = useWithdrawals({ limit: 5 });
  const [open, setOpen] = useState(false);
  const items = list?.items ?? [];

  if (isLoading || !wallet) return <Skeleton className="h-44 w-full rounded-[28px]" />;
  const canWithdraw = wallet.payoutReady && wallet.availableKobo >= wallet.minimumKobo;
  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Available to withdraw</p>
          <p className="mt-1.5 font-heading text-4xl font-extrabold tracking-tight text-foreground-strong">{formatMoney(wallet.availableKobo)}</p>
          {wallet.pendingKobo > 0 && <p className="mt-1 text-sm text-muted">{formatMoney(wallet.pendingKobo)} on its way to your bank</p>}
        </div>
        <Button size="lg" className="w-full sm:w-auto" disabled={!canWithdraw} leadingIcon={<ArrowUpRight {...ICON} size={18} />} onClick={() => setOpen(true)}>Withdraw</Button>
      </div>
      {!wallet.payoutReady
        ? <Banner variant="info">Add your bank account below, then you can withdraw.</Banner>
        : <p className="flex items-center gap-2 text-sm text-muted"><Landmark size={15} aria-hidden="true" />Goes to {wallet.account?.accountName} ending {wallet.account?.last4}</p>}
      {items.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-foreground-strong">Recent withdrawals</h3>
          <ul className="divide-y divide-border">
            {items.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0"><p className="font-semibold text-foreground-strong">{formatMoney(w.amountKobo)}</p><p className="text-xs text-muted">{fmtDate(w.requestedAt)}{w.status === 'failed' && w.failureReason ? ` · ${w.failureReason}` : ''}</p></div>
                <StatusBadge status={BADGE[w.status]?.status ?? 'pending'} label={BADGE[w.status]?.label} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <WithdrawModal open={open} onOpenChange={setOpen} wallet={wallet} />
    </Card>
  );
}

export default WalletCard;
