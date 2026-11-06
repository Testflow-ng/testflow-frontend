import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Clock, Layers, Lock, Radio, Receipt, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge, Banner, Button, Card, ConfirmDialog, KeyValueList, Reveal, SkeletonCard, useToast } from '../../components/ui/index.js';
import BankTransferInstructions from '../../components/billing/BankTransferInstructions.jsx';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import { cn } from '../../utils/cn.js';
import { formatMoney } from '../../utils/money.js';
import { normalizePaymentStatus } from '../../utils/payment.js';
import { billingApi } from './api.js';
import { useEntitlement, useProducts } from './useBilling.js';

const MONTHLY_BENEFITS = [
  { icon: ShieldCheck, text: 'No ads anywhere in Testflow' },
  { icon: Radio, text: 'Live CBT (host and participate in real-time exam sessions)' },
  { icon: Sparkles, text: 'Early access to AI feature once released' },
  { icon: Layers, text: 'Access to create two free CBT sections in Testflow for everyone' },
];

const COMING_SOON_BENEFITS = [
  { text: 'Everything in Plus', isHighlight: true },
  { text: '----', isPlaceholder: true },
  { text: '----', isPlaceholder: true },
  { text: '----', isPlaceholder: true },
  { text: '----', isPlaceholder: true },
];

const REF_KEY = 'tf_student_checkout_ref';
const IDEM_PREFIX = 'tf_student_idem_';
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : null);
const perDay = (p) => formatMoney(Math.round(p.priceMinor / p.durationDays), p.currency);

const STATUS_COPY = {
  verifying: { title: 'Recovering your payment', body: 'Checking with the server. Please wait.' },
  initializing: { title: 'Initializing payment', body: 'Your checkout is being created. Please wait.' },
  awaiting_transfer: { title: 'Awaiting your transfer', body: 'Use the details below to complete the payment.' },
  processing: { title: 'Processing payment', body: 'Your transfer has been received and is being confirmed.' },
  success: { title: 'Payment received', body: 'Your Plus plan is now active.' },
  failed: { title: 'Payment did not go through', body: 'You were not charged. You can try again.' },
  expired: { title: 'Payment expired', body: 'The transfer window has closed. Start a new payment to continue.' },
  cancelled: { title: 'Payment cancelled', body: 'This payment was cancelled. You can start a new one.' },
};

function BillingPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data: plans, isLoading, error } = useProducts();
  const { data: held } = useEntitlement();

  const [reference, setReference] = useState(() => {
    try { return localStorage.getItem(REF_KEY); } catch { return null; }
  });
  const [checkout, setCheckout] = useState(null);
  const [status, setStatus] = useState(reference ? 'verifying' : 'idle');
  const [busyPlan, setBusyPlan] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const refreshingRef = useRef(false);

  const applyStatus = (res) => {
    const n = normalizePaymentStatus(res);
    const purchase = res?.purchase ?? res?.payment ?? res ?? {};

    setCheckout((prev) => {
      const current = prev ?? {};
      const currentPlanKey = current.planKey ?? purchase?.planKey;
      const next = { ...current, ...purchase };
      const incomingInstructions = purchase?.transferInstructions ?? purchase?.transfer ?? null;
      if (n.isTerminal) {
        // Clear the idempotency key for this plan so a legitimate new purchase
        // gets a fresh key instead of an idempotent replay of the completed one.
        if (currentPlanKey) {
          try { localStorage.removeItem(`${IDEM_PREFIX}${currentPlanKey}`); } catch { /* ignore */ }
        }
        // Do not retain stale instructions once the payment is terminal.
        if (next.transferInstructions) delete next.transferInstructions;
      } else if (incomingInstructions) {
        next.transferInstructions = incomingInstructions;
      } else if (current.transferInstructions) {
        // Preserve previously received valid instructions when refresh omits them.
        next.transferInstructions = current.transferInstructions;
      }
      return next;
    });

    if (n.isSuccess) {
      setStatus('success');
      try { localStorage.removeItem(REF_KEY); } catch { /* ignore */ }
      qc.invalidateQueries({ queryKey: ['billing'] });
      qc.invalidateQueries({ queryKey: ['advertising'] });
      return;
    }
    if (n.isFailure) {
      setStatus(n.status === 'canceled' ? 'cancelled' : n.status);
      return;
    }
    const PENDING = new Set(['initializing', 'verifying', 'awaiting_transfer', 'processing', 'pending']);
    setStatus(PENDING.has(n.status) ? n.status : 'awaiting_transfer');
  };

  // Recover an existing checkout on first load.
  useEffect(() => {
    if (!reference) return undefined;
    let live = true;
    (async () => {
      setStatus('verifying');
      try {
        const cs = await billingApi.checkoutStatus(reference);
        if (!live) return;
        if (cs) setCheckout((prev) => ({ ...(prev ?? {}), ...cs }));
        const res = await billingApi.refreshStatus(reference);
        if (!live) return;
        applyStatus(res);
      } catch {
        if (live) setStatus('failed');
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll while pending.
  useEffect(() => {
    if (!reference || !checkout) return undefined;
    if (['success', 'failed', 'expired', 'cancelled'].includes(status)) return undefined;
    let live = true;
    const tick = async () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      try {
        const res = await billingApi.refreshStatus(reference);
        if (!live) return;
        applyStatus(res);
      } catch {
        /* temporary failure; keep checkout */
      } finally {
        refreshingRef.current = false;
      }
    };
    const id = setInterval(tick, 6000);
    return () => { live = false; clearInterval(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, checkout, status]);

  const pay = async (plan) => {
    if (plan.comingSoon || plan.available === false || busyPlan) return;
    setBusyPlan(plan.key);
    // Reuse the idempotency key for the same plan/checkout to avoid duplicate
    // transactions on retry; generate a new key for a genuinely new operation.
    let idempotencyKey;
    try {
      idempotencyKey = localStorage.getItem(`${IDEM_PREFIX}${plan.key}`);
    } catch { /* ignore */ }
    if (!idempotencyKey) idempotencyKey = crypto.randomUUID();
    try {
      const purchase = await billingApi.checkout(plan.key, idempotencyKey);
      const ref = purchase?.reference;
      if (ref) {
        setReference(ref);
        try { localStorage.setItem(REF_KEY, ref); } catch { /* ignore */ }
        try { localStorage.setItem(`${IDEM_PREFIX}${plan.key}`, idempotencyKey); } catch { /* ignore */ }
      }
      applyStatus({ purchase });
    } catch (e) {
      toast.error('Could not start the payment', e?.message ?? 'Try again.');
    } finally {
      setBusyPlan(null);
    }
  };

  const manualRefresh = async () => {
    if (!reference || refreshing) return;
    setRefreshing(true);
    try {
      const res = await billingApi.refreshStatus(reference);
      applyStatus(res);
    } catch (e) {
      toast.error('Could not refresh payment status', e?.message ?? 'Try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const cancel = async () => {
    if (!reference) return;
    try {
      const p = await billingApi.cancel(reference);
      applyStatus({ purchase: p });
      try { localStorage.removeItem(REF_KEY); } catch { /* ignore */ }
      toast.success('Payment cancelled');
    } catch (e) {
      toast.error('Could not cancel payment', e?.message ?? 'Try again.');
    } finally {
      setCancelOpen(false);
    }
  };

  const resetCheckout = () => {
    setReference(null);
    setCheckout(null);
    setStatus('idle');
    try { localStorage.removeItem(REF_KEY); } catch { /* ignore */ }
  };

  const active = held?.status === 'active';
  const copy = STATUS_COPY[status] ?? STATUS_COPY.awaiting_transfer;

  return (
    <Screen width="xl">
      <PageHeader
        back="/settings"
        eyebrow="Plans"
        title="Plans"
        subtitle="Ad-free study, Live CBT, early AI access, and custom CBT creation. One payment, no auto-renewal."
        action={
          <Link to="/billing/invoices">
            <Button size="sm" variant="outline" leadingIcon={<Receipt size={14} />}>
              Invoices
            </Button>
          </Link>
        }
      />

      <div className="mt-8 space-y-8">
        <Reveal>
          <Card padding="lg" className={cn('flex flex-col gap-5 sm:flex-row sm:items-center', active ? 'bg-[var(--brand-sage)]' : 'bg-[var(--brand-lavender)]')}>
            <Mascot mood={active ? 'excited' : 'happy'} animation="float" size={88} className="mx-auto shrink-0" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{active ? 'Your Plus plan is active' : 'You are on the free plan'}</h2>
                <Badge variant={active ? 'success' : 'outline'}>{active ? 'Plus Active' : held?.status === 'expired' ? 'Expired' : 'Free'}</Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                {active
                  ? `Ad-free with Live CBT, early AI access, and CBT creation privileges until ${fmtDate(held.expiresAt)}.`
                  : 'Ads show on Home and after each exam. Upgrade to Plus to remove ads, unlock Live CBT, get early access to AI tools, and create two free CBT sections for everyone.'}
              </p>
            </div>
          </Card>
        </Reveal>

        {reference && checkout && (
          <Reveal>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{copy.title}</h2>
                  <p className="mt-1 text-sm text-muted">{copy.body}</p>
                </div>
                <Badge variant={status === 'success' ? 'success' : status === 'failed' || status === 'expired' || status === 'cancelled' ? 'outline' : 'warning'}>
                  {status.replace('_', ' ')}
                </Badge>
              </div>

              {status === 'verifying' && (
                <Card padding="lg" className="flex items-center gap-3">
                  <span className="inline-block size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
                  <span className="text-sm text-muted">Recovering your checkout…</span>
                </Card>
              )}

              {status === 'success' && (
                <Card padding="lg" className="space-y-4">
                  <p className="text-sm text-foreground">Your subscription has been activated. You can return to your dashboard.</p>
                  <KeyValueList items={[
                    ...(checkout?.reference ? [{ label: 'Reference', value: checkout.reference }] : []),
                    ...(checkout?.planName ? [{ label: 'Plan', value: checkout.planName }] : []),
                    ...(checkout?.amountKobo ? [{ label: 'Amount', value: formatMoney(checkout.amountKobo, checkout.currency) }] : []),
                  ]} />
                  <div className="flex flex-wrap gap-2">
                    <Link to="/dashboard"><Button variant="primary">Go to dashboard</Button></Link>
                    <Button variant="outline" onClick={resetCheckout}>Start another payment</Button>
                  </div>
                </Card>
              )}

              {(status === 'failed' || status === 'expired' || status === 'cancelled') && (
                <Card padding="lg" className="space-y-4">
                  <p className="text-sm text-foreground">{copy.body}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" onClick={resetCheckout}>Start a new payment</Button>
                    <Button variant="outline" onClick={manualRefresh} loading={refreshing}>Check again</Button>
                  </div>
                </Card>
              )}

              {(status === 'awaiting_transfer' || status === 'processing') && (
                <>
                  <BankTransferInstructions transfer={checkout} />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={manualRefresh} loading={refreshing}>Check payment status</Button>
                    <Button variant="ghost" onClick={() => setCancelOpen(true)}>Cancel payment</Button>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        )}

        {error ? (
          <Banner variant="danger">Could not load the passes. Check your connection and try again.</Banner>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2"><SkeletonCard className="h-72" /><SkeletonCard className="h-72" /></div>
        ) : (
          <Reveal delay={0.08}>
            <ul className="grid gap-5 sm:grid-cols-2">
              {plans.map((plan) => {
                const isAvailable = plan.available !== false && !plan.comingSoon;
                return (
                  <li key={plan.key} className="flex">
                    <Card
                      padding="lg"
                      className={cn(
                        'relative flex w-full flex-col gap-5 transition-all',
                        isAvailable && 'border-primary/40 ring-1 ring-primary/20 shadow-md',
                        !isAvailable && 'border-dashed border-border/80 bg-surface/40 opacity-80',
                      )}
                    >
                      {isAvailable ? (
                        <Badge variant="lime" className="absolute right-5 top-5">Popular</Badge>
                      ) : (
                        <Badge variant="outline" className="absolute right-5 top-5 border-border/80 text-muted">Coming soon</Badge>
                      )}
                      <div>
                        <h3 className="font-heading text-lg font-bold text-foreground-strong">{plan.name}</h3>
                        <p className="mt-1 text-sm text-muted">{plan.description}</p>
                      </div>
                      <div>
                        <p className="font-heading text-4xl font-extrabold tracking-tight text-foreground-strong">{formatMoney(plan.priceMinor, plan.currency)}</p>
                        <p className="mt-1 text-sm text-muted">{plan.durationDays} days · about {perDay(plan)} a day</p>
                      </div>
                      <ul className="space-y-2.5">
                        {(isAvailable ? MONTHLY_BENEFITS : COMING_SOON_BENEFITS).map((item, idx) => {
                          if (item.isPlaceholder) {
                            return (
                              <li key={idx} className="flex items-center gap-2.5 text-sm">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-strong/80 text-muted/40">
                                  <Check size={12} strokeWidth={2} aria-hidden="true" />
                                </span>
                                <span className="font-mono text-xs font-semibold tracking-widest text-muted/40 filter blur-[0.5px] select-none">
                                  ----
                                </span>
                              </li>
                            );
                          }
                          const Icon = item.icon;
                          return (
                            <li
                              key={item.text}
                              className={cn('flex items-start gap-2.5 text-sm', item.isHighlight ? 'font-semibold text-foreground-strong' : 'text-foreground')}
                            >
                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-lavender)] text-primary">
                                <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                              </span>
                              <span className="flex items-start gap-1.5">
                                {Icon && <Icon {...ICON} size={15} className="mt-0.5 shrink-0 text-muted" />}
                                {item.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      {isAvailable ? (
                        <Button
                          size="lg"
                          className="mt-auto w-full shadow-sm"
                          variant="primary"
                          loading={busyPlan === plan.key}
                          disabled={busyPlan !== null || (reference && status !== 'success' && status !== 'idle')}
                          onClick={() => pay(plan)}
                        >
                          {active ? 'Extend Plus' : 'Get Plus'}
                        </Button>
                      ) : (
                        <div className="relative mt-auto w-full overflow-hidden rounded-xl">
                          <Button
                            size="lg"
                            className="w-full filter blur-[2px] opacity-40 pointer-events-none select-none cursor-not-allowed"
                            variant="outline"
                            disabled
                            tabIndex={-1}
                          >
                            Get Pro
                          </Button>
                          <div className="absolute inset-0 flex items-center justify-center bg-surface/30 backdrop-blur-[1px]">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/95 px-3.5 py-1 text-xs font-bold text-muted shadow-sm">
                              <Clock size={13} aria-hidden="true" />
                              Coming soon
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.16}>
          <div className="grid gap-5 lg:grid-cols-2">
            <KeyValueList items={[
              { label: 'Payment', value: 'Bank transfer via Paystack' },
              { label: 'Renewal', value: 'None. You choose when to pay again' },
              { label: 'Refunds', value: 'Contact support with your payment reference' },
            ]} />
            <p className="flex items-start gap-2.5 rounded-[20px] border border-border bg-surface p-5 text-sm leading-relaxed text-muted">
              <Lock {...ICON} size={16} className="mt-0.5 shrink-0" />
              Payments are processed by Paystack. Testflow never sees or stores your card details, and your pass is only switched on after the payment is verified.
            </p>
          </div>
        </Reveal>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this payment?"
        description="You can start a new payment at any time."
        confirmLabel="Cancel payment"
        onConfirm={cancel}
        onClose={() => setCancelOpen(false)}
      />
    </Screen>
  );
}

export default BillingPage;
