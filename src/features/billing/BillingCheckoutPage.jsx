import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge, Banner, Button, Card, KeyValueList, Reveal } from '../../components/ui/index.js';
import Confetti from '../../components/brand/Confetti.jsx';
import CopyField from '../../components/ui/CopyField.jsx';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { formatMoney } from '../../utils/money.js';
import { billingApi } from './api.js';

const POLL_MS = 8000;
const PENDING_KEY = 'testflow:pendingPurchase';

function expiryText(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function BillingCheckoutPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [reference] = useState(() => params.get('reference') ?? params.get('trxref') ?? localStorage.getItem(PENDING_KEY));
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const clearPending = useCallback(() => {
    localStorage.removeItem(PENDING_KEY);
  }, []);

  const refresh = useCallback(async (manual = false) => {
    if (!reference) return;
    if (manual) setRefreshing(true);
    try {
      const res = await billingApi.status(reference);
      if (!res?.purchase) throw new Error('Purchase not found');
      setPurchase(res.purchase);
      setError(null);
      if (res.purchase.status === 'paid') {
        clearPending();
        qc.invalidateQueries({ queryKey: ['billing'] });
      }
      if (['expired', 'abandoned', 'failed', 'refunded'].includes(res.purchase.status)) {
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
    const startPolling = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        refresh();
      }, POLL_MS);
    };
    startPolling();
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
    if (!reference) navigate('/billing', { replace: true });
  }, [reference, navigate]);

  const status = purchase?.status ?? 'initialized';
  const paid = status === 'paid';
  const expired = status === 'expired' || status === 'abandoned';
  const failed = status === 'failed' || status === 'refunded';

  const accountNumber = purchase?.accountNumber ?? purchase?.bankTransfer?.accountNumber;
  const accountName = purchase?.accountName ?? purchase?.bankTransfer?.accountName;
  const bankName = purchase?.bankName ?? purchase?.bankTransfer?.bankName;
  const amount = purchase?.amountKobo ?? purchase?.bankTransfer?.amountKobo;
  const currency = purchase?.currency ?? purchase?.bankTransfer?.currency ?? 'NGN';
  const expiresAt = purchase?.accountExpiresAt ?? purchase?.bankTransfer?.expiresAt;

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
            <p className="text-[15px] leading-relaxed text-muted">Your plan is active. Welcome aboard.</p>
            <KeyValueList className="mt-2 w-full text-left" items={[
              ...(reference ? [{ label: 'Reference', value: reference }] : []),
              ...(purchase?.planName ? [{ label: 'Plan', value: purchase.planName }] : []),
              ...(amount ? [{ label: 'Amount', value: formatMoney(amount, currency) }] : []),
            ]} />
            <Button size="lg" className="mt-4 w-full" onClick={() => navigate('/dashboard')}>
              Continue to dashboard
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
          <Button size="lg" className="mt-4 w-full" onClick={() => navigate('/billing')}>
            Start a new payment
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
          <Button size="lg" className="mt-4 w-full" onClick={() => navigate('/billing')}>
            Try again
          </Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen width="sm">
      <PageHeader back="/billing" eyebrow="Checkout" title="Complete your payment" subtitle="Transfer the exact amount to the account below. We will confirm automatically." />
      {error && <Banner variant="danger" className="mt-4">{error}</Banner>}
      <div className="mt-6 space-y-5">
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">Payment summary</p>
            <Badge variant="outline">{status === 'initialized' ? 'Awaiting payment' : status}</Badge>
          </div>
          <KeyValueList items={[
            ...(purchase?.planName ? [{ label: 'Plan', value: purchase.planName }] : []),
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

        <Card padding="lg" className="space-y-3">
          <p className="text-sm font-semibold text-foreground-strong">How to pay</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted">
            <li>Open your banking app.</li>
            <li>Transfer the exact amount shown above.</li>
            <li>Use the reference as narration if your bank asks.</li>
            <li>Return here and tap “I’ve made payment”.</li>
          </ol>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="w-full" loading={refreshing} onClick={() => refresh(true)} leadingIcon={<RefreshCw size={16} />}>
            I’ve made payment
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('/billing')}>
            Back to plans
          </Button>
        </div>

        <p className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck size={14} /> Payment is confirmed by Paystack and verified by Testflow. We never see your card details.
        </p>
      </div>
      <Reveal />
    </Screen>
  );
}

export default BillingCheckoutPage;
