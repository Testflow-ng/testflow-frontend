import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge, Banner, Button, Card, KeyValueList } from '../../../components/ui/index.js';
import Confetti from '../../../components/brand/Confetti.jsx';
import CopyField from '../../../components/ui/CopyField.jsx';
import Mascot from '../../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { wsApi } from '../api.js';

const POLL_MS = 8000;
const PENDING_KEY = 'testflow:pendingWorkspacePurchase';

function expiryText(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function WorkspaceBillingCheckout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [reference] = useState(() => params.get('reference') ?? params.get('trxref') ?? localStorage.getItem(PENDING_KEY));
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const clearPending = useCallback(() => localStorage.removeItem(PENDING_KEY), []);

  const refresh = useCallback(async (manual = false) => {
    if (!reference) return;
    if (manual) setRefreshing(true);
    try {
      const res = await wsApi.verifyPayment(reference);
      setPayment(res.payment ?? null);
      setError(null);
      if (res.payment?.status === 'paid') {
        clearPending();
        qc.invalidateQueries({ queryKey: ['ws'] });
      }
      if (['expired', 'abandoned', 'failed', 'refunded'].includes(res.payment?.status)) {
        clearPending();
      }
    } catch (e) {
      setError(e?.message ?? 'Could not load the payment');
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  }, [reference, qc, clearPending]);

  useEffect(() => {
    if (params.get('reference') || params.get('trxref')) {
      const ref = params.get('reference') ?? params.get('trxref');
      if (ref) localStorage.setItem(PENDING_KEY, ref);
    }
  }, [params]);

  useEffect(() => {
    if (!reference) return undefined;
    (async () => { await refresh(); })();
    timerRef.current = setInterval(() => refresh(), POLL_MS);
    const onVisibility = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reference, refresh]);

  useEffect(() => {
    if (!reference) navigate('/workspace/billing', { replace: true });
  }, [reference, navigate]);

  const status = payment?.status ?? 'initialized';
  const paid = status === 'paid';
  const expired = status === 'expired' || status === 'abandoned';
  const failed = status === 'failed' || status === 'refunded';

  const accountNumber = payment?.accountNumber ?? payment?.bankTransfer?.accountNumber;
  const accountName = payment?.accountName ?? payment?.bankTransfer?.accountName;
  const bankName = payment?.bankName ?? payment?.bankTransfer?.bankName;
  const amount = payment?.amountKobo ?? payment?.bankTransfer?.amountKobo;
  const currency = payment?.currency ?? payment?.bankTransfer?.currency ?? 'NGN';
  const expiresAt = payment?.accountExpiresAt ?? payment?.bankTransfer?.expiresAt;

  if (loading) {
    return (
      <Screen width="sm">
        <div className="flex flex-col items-center gap-3 py-16">
          <Mascot mood="thinking" animation="float" size={88} />
          <p className="text-sm text-muted">Preparing your payment…</p>
        </div>
      </Screen>
    );
  }

  if (paid) {
    return (
      <Screen width="sm">
        <div className="relative overflow-hidden">
          <Confetti active />
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Mascot mood="excited" animation="bounce" size={112} />
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">Payment received</h1>
            <p className="text-[15px] leading-relaxed text-muted">Your plan is active.</p>
            <KeyValueList className="mt-2 w-full text-left" items={[
              ...(reference ? [{ label: 'Reference', value: reference }] : []),
              ...(amount ? [{ label: 'Amount', value: formatMoney(amount, currency) }] : []),
            ]} />
            <Button size="lg" className="mt-4 w-full" onClick={() => navigate('/workspace/billing')}>
              Continue
            </Button>
          </div>
        </div>
      </Screen>
    );
  }

  if (expired) {
    return (
      <Screen width="sm">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Mascot mood="sad" size={96} />
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">Payment session expired</h1>
          <p className="text-[15px] leading-relaxed text-muted">This temporary account is no longer valid. Start a new payment to continue.</p>
          <Button size="lg" className="mt-4 w-full" onClick={() => navigate('/workspace/billing')}>
            Back to plan
          </Button>
        </div>
      </Screen>
    );
  }

  if (failed) {
    return (
      <Screen width="sm">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Mascot mood="sad" size={96} />
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">Payment did not go through</h1>
          <p className="text-[15px] leading-relaxed text-muted">You were not charged. You can try again.</p>
          <Button size="lg" className="mt-4 w-full" onClick={() => navigate('/workspace/billing')}>
            Back to plan
          </Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen width="sm">
      <PageHeader back="/workspace/billing" eyebrow="Checkout" title="Complete your payment" subtitle="Transfer the exact amount to the account below. We will confirm automatically." />
      {error && <Banner variant="danger" className="mt-4">{error}</Banner>}
      <div className="mt-6 space-y-5">
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">Payment summary</p>
            <Badge variant="outline">{status === 'initialized' ? 'Awaiting payment' : status}</Badge>
          </div>
          <KeyValueList items={[
            { label: 'Amount to transfer', value: formatMoney(amount ?? 0, currency) },
            { label: 'Reference', value: reference },
            ...(expiresAt ? [{ label: 'Account expires', value: expiryText(expiresAt) }] : []),
          ]} />
        </Card>

        <Card padding="lg" className="space-y-4">
          <p className="text-sm font-semibold text-muted">Bank transfer details</p>
          {bankName && <p className="text-base font-bold text-foreground-strong">{bankName}</p>}
          <CopyField label="Account number" value={accountNumber ?? '—'} />
          {accountName && <CopyField label="Account name" value={accountName} />}
          <CopyField label="Amount" value={formatMoney(amount ?? 0, currency)} mono={false} />
          {expiresAt && (
            <p className="flex items-center gap-2 text-xs text-muted">
              <Clock size={14} /> This account expires on {expiryText(expiresAt)}.
            </p>
          )}
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="w-full" loading={refreshing} onClick={() => refresh(true)} leadingIcon={<RefreshCw size={16} />}>
            I’ve made payment
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('/workspace/billing')}>
            Back to plan
          </Button>
        </div>

        <p className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck size={14} /> Payment is confirmed by Paystack and verified by Testflow.
        </p>
      </div>
    </Screen>
  );
}

export default WorkspaceBillingCheckout;
