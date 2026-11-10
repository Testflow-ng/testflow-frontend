import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge, Banner, Button, Card, Field, Input, KeyValueList, Select, Spinner, useToast } from '../../components/ui/index.js';
import { formatMoney } from '../../utils/money.js';
import { wsApi } from './api.js';
import { useBanks, useWsMutation } from './useWorkspace.js';

/** Where the organisation's money is sent: the Paystack sub-account. `bare` drops the outer card (used inside onboarding). */
function PayoutCard({ org, bare = false }) {
  const toast = useToast();
  const { data: banks } = useBanks();
  const p = org.payout ?? {};
  const [form, setForm] = useState({ bankCode: p.bankCode ?? '', accountNumber: p.accountNumber ?? '', businessName: p.businessName ?? org.name });
  const [resolved, setResolved] = useState(p.accountName ?? '');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); if (k !== 'businessName') { setResolved(''); setError(''); } };

  const save = useWsMutation((id, body) => wsApi.savePayout(id, body), { onSuccess: () => toast.success('Payout account saved'), onError: (e) => toast.error('Could not save', e.message) });
  const ready = Boolean(form.bankCode) && /^\d{10}$/.test(form.accountNumber);
  // The account name is looked up by itself once a bank and a full 10-digit number are in; there is no button to press.
  useEffect(() => {
    if (!ready || resolved) return undefined;
    let live = true;
    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const r = await wsApi.verifyAccount(org.id, { bankCode: form.bankCode, accountNumber: form.accountNumber });
        if (live) { setResolved(r.accountName); setError(''); }
      } catch (e) {
        if (live) setError(e.message || 'We could not find that account. Check the bank and number.');
      } finally {
        if (live) setChecking(false);
      }
    }, 300);
    return () => { live = false; clearTimeout(timer); setChecking(false); };
  }, [ready, resolved, form.bankCode, form.accountNumber, org.id]);
  const pct = p.platformPercent ?? 5;

  const Wrap = bare ? 'div' : Card;
  return (
    <Wrap {...(bare ? { className: 'space-y-5' } : { padding: 'lg', className: 'space-y-5' })}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="font-heading text-base font-bold text-foreground-strong">Payout account</h2><p className="text-sm text-muted">Where your share is sent.</p></div>
        {(p.status === 'active' || !bare) && <Badge variant={p.status === 'active' ? 'success' : 'outline'}>{p.status === 'active' ? 'Active' : 'Not set up'}</Badge>}
      </div>
      {error && <Banner variant="danger">{error}</Banner>}
      <Field label="Bank">
        <Select
          searchable
          searchPlaceholder="Search bank (e.g. OPay, GTBank, Kuda, Zenith)..."
          value={form.bankCode}
          onValueChange={set('bankCode')}
          options={(Array.isArray(banks) ? banks : []).map((b) => ({ value: b.code, label: b.name }))}
          placeholder="Choose your bank"
        />
      </Field>
      <Field label="Account number"><Input inputMode="numeric" maxLength={10} value={form.accountNumber} onChange={(e) => set('accountNumber')(e.target.value.replace(/\D/g, ''))} /></Field>
      <div aria-live="polite">
        {resolved && <p className="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm font-semibold text-score-good"><CheckCircle2 size={16} aria-hidden="true" />{resolved}</p>}
        {checking && !resolved && <p className="flex items-center gap-2 text-sm text-muted"><Spinner size="sm" /> Checking account name…</p>}
      </div>
      <Field label="Business name"><Input value={form.businessName} onChange={(e) => set('businessName')(e.target.value)} /></Field>
      <Button className="w-full" loading={save.isPending} disabled={!resolved} onClick={() => save.mutate(form)}>Save payout account</Button>
      {/* The fee split is shown on the Earnings page; the set-up flow stays short. */}
      {!bare && <KeyValueList items={[{ label: 'Testflow keeps', value: `${pct}% of each payment` }, { label: 'On a ₦1,000 payment', value: `You receive ${formatMoney(100000 * (100 - pct) / 100)}` }]} />}
      <p className="text-xs leading-relaxed text-muted">{p.mode === 'wallet' ? 'Students pay on Paystack. Your share is added to your Testflow balance, and you withdraw it to this account whenever you like.' : 'Students pay on Paystack. The split happens there, so your share is sent straight to this account by Paystack, usually within 1 to 2 working days.'} The percentage is set by Testflow.</p>
    </Wrap>
  );
}

export default PayoutCard;
