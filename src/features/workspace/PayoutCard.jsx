import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge, Banner, Button, Card, Field, Input, KeyValueList, Select, useToast } from '../../components/ui/index.js';
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
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); if (k !== 'businessName') setResolved(''); };

  const save = useWsMutation((id, body) => wsApi.savePayout(id, body), { onSuccess: () => toast.success('Payout account saved'), onError: (e) => toast.error('Could not save', e.message) });
  const check = async () => {
    setChecking(true);
    setError('');
    try {
      const r = await wsApi.verifyAccount(org.id, { bankCode: form.bankCode, accountNumber: form.accountNumber });
      setResolved(r.accountName);
    } catch (e) {
      setError(e.message || 'We could not find that account.');
    } finally {
      setChecking(false);
    }
  };
  const ready = form.bankCode && /^\d{10}$/.test(form.accountNumber);
  const pct = p.platformPercent ?? 10;

  const Wrap = bare ? 'div' : Card;
  return (
    <Wrap {...(bare ? { className: 'space-y-5' } : { padding: 'lg', className: 'space-y-5' })}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="font-heading text-base font-bold text-foreground-strong">Payout account</h2><p className="text-sm text-muted">Where your share is sent.</p></div>
        <Badge variant={p.status === 'active' ? 'success' : 'outline'}>{p.status === 'active' ? 'Active' : 'Not set up'}</Badge>
      </div>
      {error && <Banner variant="danger">{error}</Banner>}
      <Field label="Bank"><Select value={form.bankCode} onValueChange={set('bankCode')} options={(banks ?? []).map((b) => ({ value: b.code, label: b.name }))} placeholder="Choose your bank" /></Field>
      <Field label="Account number"><Input inputMode="numeric" maxLength={10} value={form.accountNumber} onChange={(e) => set('accountNumber')(e.target.value.replace(/\D/g, ''))} /></Field>
      {resolved ? <p className="flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm font-semibold text-score-good"><CheckCircle2 size={16} aria-hidden="true" />{resolved}</p> : <Button variant="outline" loading={checking} disabled={!ready} onClick={check}>Check account name</Button>}
      <Field label="Business name"><Input value={form.businessName} onChange={(e) => set('businessName')(e.target.value)} /></Field>
      <Button className="w-full" loading={save.isPending} disabled={!resolved} onClick={() => save.mutate(form)}>Save payout account</Button>
      <KeyValueList items={[{ label: 'Testflow keeps', value: `${pct}% of each payment` }, { label: 'On a ₦1,000 payment', value: `You receive ${formatMoney(100000 * (100 - pct) / 100)}` }]} />
      <p className="text-xs leading-relaxed text-muted">Students pay on Paystack. The split happens there, so your share goes straight to this account. The percentage is set by Testflow.</p>
    </Wrap>
  );
}

export default PayoutCard;
