import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, Crown, MoreHorizontal, Sparkles, X } from 'lucide-react';
import { Badge, Banner, Button, Card, DropdownMenu, IconButton, Reveal, Skeleton, useToast } from '../../../components/ui/index.js';
import FaqAccordion from '../../../components/marketing/FaqAccordion.jsx';
import InvoiceTable from '../../../components/everybody/InvoiceTable.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { cn } from '../../../utils/cn.js';
import { formatMoney } from '../../../utils/money.js';
import { normalizeTransfer } from '../../../utils/transfer.js';
import { normalizePaymentStatus, paymentUiStatus } from '../../../utils/payment.js';
import { wsApi } from '../api.js';
import BankTransferInstructions from '../../../components/billing/BankTransferInstructions.jsx';
import { useOrg } from '../OrgContext.js';
import { useQueryClient } from '@tanstack/react-query';
import { usePlans, useSubscription, useSubscriptionPayments } from '../useWorkspace.js';

const REF_KEY = (orgId, subId) => (orgId && subId ? `tf_org_checkout_${orgId}_${subId}` : null);

/** What each plan includes, in plain words. `[feature, free, pro, studio]`: true is included, false is not, text is a limit. */
const MATRIX = [
  ['Your own CBT site on testflow.com.ng', true, true, true],
  ['Your name, logo and colours', true, true, true],
  ['Exams students take anytime', 'Up to 3', 'Unlimited', 'Unlimited'],
  ['Question banks to reuse in exams', false, true, true],
  ['Announcements to your students', false, true, true],
  ['Questions your students report', false, true, true],
  ['Charge for exams, paid to your account', false, false, true],
  ['Live CBT: everyone starts together at a set time', false, false, true],
  ['No ads for your students', false, false, true],
];
const TAGLINE = { free: 'Try it out with up to 3 exams.', pro: 'Simple and fast for running your exams.', studio: 'Charge for exams, go live, no ads.' };
const RANK = { free: 0, pro: 1, studio: 2 };
const FREE_PLAN = { key: 'free', name: 'Free', priceMinor: 0, currency: 'NGN', interval: 'month', adsEnabled: true };

const FAQ = [
  ['Do I pay every month automatically?', 'No. Plans do not renew by themselves. We remind you before it ends, and you renew when you are ready. Renewing early adds the days on, nothing is lost.'],
  ['What happens if my plan ends?', 'Your workspace becomes read-only for a while. You can still see your students and results, but students cannot start new exams until you renew. Nothing is deleted.'],
  ['Can students remove the ads?', 'No. Only you decide. Studio removes ads for all your students. Students only ever pay for an exam you choose to charge for, and charging is part of Studio.'],
  ['Is the money students pay me part of my plan?', 'No, it is separate. Your plan is what you pay Testflow. Earnings from your exams go to your payout account, with Testflow keeping a small share.'],
];

const daysLeft = (end) => {
  const d = new Date(end).getTime();
  return Number.isNaN(d) ? null : Math.max(0, Math.ceil((d - Date.now()) / 86400000));
};

/** Your plan with Testflow: where you are, what each plan includes, and what you have paid. */
function BillingScreen() {
  const toast = useToast();
  const qc = useQueryClient();
  const { orgId } = useOrg();
  const { data: sub, isLoading, error } = useSubscription();
  const { data: plans } = usePlans();
  const payments = useSubscriptionPayments().data ?? [];
  const [busy, setBusy] = useState(null);
  const [checkout, setCheckout] = useState(null); // { reference, subId, orgId, amountKobo, currency, planName, transferInstructions, status }
  const [pStatus, setPStatus] = useState('idle');
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef(false);

  const refKey = REF_KEY(orgId, sub?.id);

  const getIdemKey = (operation) => {
    const key = `tf_org_idem_${orgId}_${sub?.id}_${operation}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) return stored;
    } catch { /* ignore */ }
    const generated = crypto.randomUUID();
    try { localStorage.setItem(key, generated); } catch { /* ignore */ }
    return generated;
  };

  const clearStoredCheckout = () => {
    if (refKey) try { localStorage.removeItem(refKey); } catch { /* ignore */ }
  };

  // Clear only the idempotency key for a specific operation so that a terminal
  // payment for one operation does not invalidate the retry identity of another
  // operation (e.g. a completed checkout should not clear a pending renewal key).
  const clearStoredIdemKey = (operation) => {
    if (!orgId || !sub?.id || !operation) return;
    try { localStorage.removeItem(`tf_org_idem_${orgId}_${sub.id}_${operation}`); } catch { /* ignore */ }
  };

  const extractCheckout = (res) => {
    // Unwrap the documented envelopes without assuming every response has the
    // identical structure.
    const purchase = res?.checkout ?? res?.payment ?? res?.purchase ?? res ?? {};
    const reference =
      purchase?.reference ?? purchase?.paymentId ?? res?.reference ?? res?.paymentId;
    const instructions = normalizeTransfer(purchase);
    const hasInstructions = Boolean(
      instructions.bankName ||
        instructions.accountName ||
        instructions.accountNumber ||
        instructions.reference ||
        instructions.amountKobo != null ||
        instructions.displayText
    );
    return {
      reference,
      amountKobo: instructions.amountKobo ?? purchase?.amountKobo ?? purchase?.amount_kobo ?? purchase?.amount,
      currency: instructions.currency ?? purchase?.currency ?? 'NGN',
      planName: purchase?.planName,
      status: purchase?.status ?? purchase?.paymentState ?? res?.status,
      transferInstructions: hasInstructions ? instructions : null,
    };
  };

  const applyOrgStatus = (res, operation) => {
    const n = normalizePaymentStatus(res);
    const purchase = res?.checkout ?? res?.payment ?? res?.purchase ?? res ?? {};
    const instructions = purchase?.transferInstructions ?? purchase?.transfer ?? null;

    setCheckout((prev) => {
      const current = prev ?? {};
      if (n.isTerminal) {
        const next = { ...current };
        if (next.transferInstructions) delete next.transferInstructions;
        return next;
      }
      if (instructions) return { ...current, transferInstructions: instructions };
      if (current.transferInstructions) return current;
      return current;
    });

    if (n.isSuccess) {
      setPStatus('success');
      if (refKey) try { localStorage.removeItem(refKey); } catch { /* ignore */ }
      clearStoredIdemKey(operation);
      qc.invalidateQueries({ queryKey: ['ws'] });
      return;
    }
    if (n.isFailure) {
      setPStatus(n.status === 'canceled' ? 'cancelled' : n.status);
      if (refKey) try { localStorage.removeItem(refKey); } catch { /* ignore */ }
      clearStoredIdemKey(operation);
      return;
    }
    setPStatus(paymentUiStatus(res) ?? 'awaiting_transfer');
  };

  // Recover a pending checkout after refresh or navigation. Must not start a
  // new checkout.
  useEffect(() => {
    if (!orgId || !sub?.id || !refKey) return undefined;
    let live = true;
    let reference = null;
    let recoveredOperation = null;
    try {
      const raw = localStorage.getItem(refKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        reference = parsed?.reference;
        recoveredOperation = parsed?.operation;
      }
    } catch { /* ignore */ }
    if (!reference) return undefined;
    (async () => {
      setCheckout({ reference, subId: sub.id, orgId, operation: recoveredOperation });
      setPStatus('verifying');
      try {
        await wsApi.subscriptionCheckoutStatus(orgId, sub.id, reference);
        const res = await wsApi.subscriptionPaymentStatus(orgId, sub.id, reference, true);
        if (!live) return;
        applyOrgStatus(res, recoveredOperation);
      } catch {
        if (live) setPStatus('failed');
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, sub?.id]);

  // Poll while a payment is pending. Stops on unmount and terminal states.
  useEffect(() => {
    if (!checkout?.reference || !orgId || !checkout.subId) return undefined;
    if (['success', 'failed', 'expired', 'cancelled', 'abandoned'].includes(pStatus)) return undefined;
    let live = true;
    const tick = async () => {
      if (refreshRef.current) return;
      refreshRef.current = true;
      try {
        const res = await wsApi.subscriptionPaymentStatus(orgId, checkout.subId, checkout.reference, true);
        if (!live) return;
        applyOrgStatus(res, checkout.operation);
      } catch { /* temporary failure; keep checkout */ }
      finally { refreshRef.current = false; }
    };
    const id = setInterval(tick, 6000);
    return () => { live = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, pStatus, orgId]);

  const startCheckout = async (key, run, operation) => {
    if (busy) return;
    setBusy(key);
    try {
      const res = await run();
      const c = extractCheckout(res);
      if (c.reference) {
        setCheckout({
          reference: c.reference,
          subId: sub.id,
          orgId,
          operation,
          amountKobo: c.amountKobo,
          currency: c.currency,
          planName: c.planName,
          transferInstructions: c.transferInstructions,
          status: c.status,
        });
        try {
          localStorage.setItem(refKey, JSON.stringify({ reference: c.reference, operation }));
        } catch { /* ignore */ }
        const n = normalizePaymentStatus(res);
        if (n.isSuccess) {
          setPStatus('success');
          clearStoredCheckout();
          clearStoredIdemKey(operation);
          qc.invalidateQueries({ queryKey: ['ws'] });
        } else if (n.isFailure) {
          setPStatus(n.status === 'canceled' ? 'cancelled' : n.status);
          clearStoredCheckout();
          clearStoredIdemKey(operation);
        } else {
          setPStatus('awaiting_transfer');
        }
      } else {
        // No payment reference: a scheduled downgrade or a change that does not
        // require immediate payment. Never show bank-transfer UI for these.
        if (operation === 'upgrade') {
          toast.success('Plan change scheduled', 'It starts when your current period ends.');
          qc.invalidateQueries({ queryKey: ['ws'] });
        } else {
          toast.error('Could not start the payment', 'No payment reference was returned.');
        }
        setPStatus('idle');
        setCheckout(null);
        clearStoredCheckout();
      }
    } catch (e) {
      toast.error('Could not start the payment', e?.message ?? 'Try again.');
    } finally {
      setBusy(null);
    }
  };

  const choose = (p) => {
    if (sub && p.key === (sub.planKey ?? 'free')) return;
    const isInitial = !sub || sub.planKey === 'free';
    if (isInitial && p.key !== 'free' && sub?.id) {
      // First paid subscription: use the organisation checkout endpoint.
      startCheckout(
        p.key,
        () => wsApi.subscriptionCheckout(orgId, sub.id, getIdemKey('checkout')),
        'checkout'
      );
    } else {
      // Upgrade or scheduled downgrade on an existing subscription.
      startCheckout(
        p.key,
        () => wsApi.changePlan(sub?.id, p.key, getIdemKey('upgrade')),
        'upgrade'
      );
    }
  };

  const renew = () =>
    startCheckout('renew', () => wsApi.renew(sub.id, getIdemKey('renew')), 'renew');

  const manualRefreshOrg = async () => {
    if (!checkout?.reference || refreshing) return;
    setRefreshing(true);
    try {
        const res = await wsApi.subscriptionPaymentStatus(orgId, checkout.subId, checkout.reference, true);
        applyOrgStatus(res, checkout.operation);
      } catch (e) {
      toast.error('Could not refresh payment status', e?.message ?? 'Try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const resetOrgCheckout = () => {
    setCheckout(null);
    setPStatus('idle');
    clearStoredCheckout();
    clearStoredIdemKey(checkout?.operation);
  };

  const ordered = [...(plans ?? []).filter((p) => p.key !== 'free'), FREE_PLAN].sort((a, b) => (RANK[a.key] ?? 9) - (RANK[b.key] ?? 9));
  const isFree = !sub || sub.planKey === 'free';
  const currentKey = sub?.planKey ?? 'free';
  const left = sub && !isFree ? daysLeft(sub.currentPeriodEnd) : null;
  const periodDays = 30;

  return (
    <Screen width="full">
      <PageHeader title="Plan" subtitle="What you pay Testflow, and what each plan includes." />
      <div className="mt-8 space-y-10">
        {error || isFree && !isLoading ? <Banner variant="info">You are on the Free plan: up to 3 exams. Upgrade below to unlock more.</Banner> : isLoading || !sub ? <Skeleton className="h-52 w-full rounded-[28px]" /> : (
          <Reveal>
            <div className="overflow-hidden rounded-[28px] bg-secondary p-6 text-secondary-foreground shadow-[0_1px_2px_rgba(27,67,50,0.04),0_8px_24px_-12px_rgba(27,67,50,0.12)] sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-accent"><Crown size={26} strokeWidth={1.5} aria-hidden="true" /></span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">Your plan</p>
                    <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white">{sub.planName}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sub.status === 'active' ? 'lime' : 'warning'}>{sub.status === 'active' ? 'Active' : sub.status === 'past_due' ? 'Renew now' : sub.status}</Badge>
                  <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label="Plan actions" variant="ghost" className="text-white hover:bg-white/10" {...p}><MoreHorizontal size={18} /></IconButton>} items={[{ label: 'Renew now', icon: Sparkles, onSelect: renew }, { label: 'Cancel at the end of the period', onSelect: () => toast.info('Your plan simply ends. It does not renew by itself.') }]} />
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div><p className="text-sm text-white/60">Price</p><p className="mt-1 font-heading text-2xl font-extrabold text-white">{formatMoney(sub.priceMinor, sub.currency)}<span className="text-sm font-semibold text-white/60"> / {sub.interval}</span></p></div>
                <div><p className="text-sm text-white/60">Ends on</p><p className="mt-1 flex items-center gap-2 font-heading text-2xl font-extrabold text-white"><CalendarClock size={20} className="text-accent" aria-hidden="true" />{sub.currentPeriodEnd}</p></div>
                <div><p className="text-sm text-white/60">Ads for your students</p><p className="mt-1 font-heading text-2xl font-extrabold text-white">{sub.adsEnabled ? 'Small ads' : 'None'}</p></div>
              </div>

              {left != null && (
                <div className="mt-8">
                  <div className="mb-2 flex justify-between text-sm text-white/70"><span>{left} {left === 1 ? 'day' : 'days'} left</span><span>Renew any time, days add on</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(4, (left / periodDays) * 100))}%` }} /></div>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-2">{sub.adsEnabled && <Button variant="accent" loading={busy === 'studio'} disabled={busy !== null && busy !== 'studio'} onClick={() => choose(ordered.find((p) => !p.adsEnabled) ?? { key: 'studio' })}>Upgrade to remove ads</Button>}<Button variant={sub.adsEnabled ? 'ghost' : 'accent'} className={sub.adsEnabled ? 'text-white hover:bg-white/10' : undefined} loading={busy === 'renew'} disabled={busy !== null && busy !== 'renew'} onClick={renew}>Renew early</Button></div>
            </div>
          </Reveal>
        )}

        {checkout?.reference && (
          <Reveal>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">
                    {pStatus === 'success' ? 'Payment received' : pStatus === 'verifying' ? 'Recovering payment' : 'Awaiting transfer'}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {pStatus === 'success' ? 'Your plan has been updated.' : 'Complete the bank transfer to activate your plan.'}
                  </p>
                </div>
                <Badge variant={pStatus === 'success' ? 'success' : pStatus === 'failed' || pStatus === 'expired' || pStatus === 'cancelled' ? 'outline' : 'warning'}>{pStatus.replace('_', ' ')}</Badge>
              </div>

              {pStatus === 'verifying' && (
                <Card padding="lg" className="flex items-center gap-3">
                  <span className="inline-block size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
                  <span className="text-sm text-muted">Recovering your checkout…</span>
                </Card>
              )}

              {pStatus === 'success' && (
                <Card padding="lg" className="space-y-4">
                  <p className="text-sm text-foreground">Your subscription has been updated. You can continue using your workspace.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" onClick={resetOrgCheckout}>Done</Button>
                  </div>
                </Card>
              )}

              {(pStatus === 'failed' || pStatus === 'expired' || pStatus === 'cancelled') && (
                <Card padding="lg" className="space-y-4">
                  <p className="text-sm text-foreground">The payment did not complete. Start a new plan change when ready.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" onClick={resetOrgCheckout}>Dismiss</Button>
                    <Button variant="outline" onClick={manualRefreshOrg} loading={refreshing}>Check again</Button>
                  </div>
                </Card>
              )}

              {(pStatus === 'awaiting_transfer' || pStatus === 'processing') && (
                <>
                  <BankTransferInstructions transfer={checkout} title="Transfer instructions" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={manualRefreshOrg} loading={refreshing}>Check payment status</Button>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.06}>
          <section aria-labelledby="compare">
            <h2 id="compare" className="mb-1 font-heading text-xl font-extrabold tracking-tight text-foreground-strong">Compare plans</h2>
            <p className="mb-5 text-sm text-muted">Pro is simple and fast. Studio adds paid exams, Live CBT and no ads. Free is limited to 3 exams.</p>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {ordered.map((p, col) => {
                const current = currentKey === p.key;
                const featured = p.key === 'studio';
                const up = (RANK[p.key] ?? 0) > (RANK[currentKey] ?? 0);
                return (
                  <Card key={p.key} padding="lg" className={cn('relative flex flex-col gap-6', featured && 'border-secondary ring-1 ring-secondary/20', current && 'bg-[var(--brand-lavender)]/50')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><h3 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">{p.name}</h3><p className="mt-1 text-sm text-muted">{TAGLINE[p.key]}</p></div>
                      <span className="shrink-0 whitespace-nowrap">{current ? <Badge variant="success">Your plan</Badge> : featured ? <Badge variant="lime">No ads</Badge> : null}</span>
                    </div>
                    <p className="whitespace-nowrap font-heading text-4xl font-extrabold tracking-tight text-foreground-strong">{p.priceMinor ? <>{formatMoney(p.priceMinor, p.currency)}<span className="text-base font-semibold text-muted"> / {p.interval}</span></> : 'Free'}</p>
                    <ul className="space-y-3">
                      {MATRIX.map((row) => {
                        const v = row[col + 1];
                        return (
                          <li key={row[0]} className={cn('flex items-start gap-3 text-sm', v ? 'text-foreground-strong' : 'text-muted')}>
                            <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full', v ? 'bg-success/15 text-score-good' : 'bg-surface-strong text-muted')}>{v ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <X size={12} strokeWidth={3} aria-hidden="true" />}</span>
                            <span>{row[0]}{typeof v === 'string' && <span className="ml-1 font-semibold">({v})</span>}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <Button size="lg" className="mt-auto w-full" variant={current ? 'outline' : up && featured ? 'primary' : 'outline'} disabled={current || (busy !== null && busy !== p.key)} loading={busy === p.key} onClick={() => choose(p)}>{current ? 'Current plan' : up ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}</Button>
                  </Card>
                );
              })}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.12}>
          <section aria-labelledby="inv">
            <h2 id="inv" className="mb-3 font-heading text-xl font-extrabold tracking-tight text-foreground-strong">Payments to Testflow</h2>
            <InvoiceTable payments={payments} />
          </section>
        </Reveal>

        <Reveal delay={0.16}>
          <section aria-labelledby="faq" className="max-w-3xl">
            <h2 id="faq" className="mb-3 font-heading text-xl font-extrabold tracking-tight text-foreground-strong">Questions about your plan</h2>
            <FaqAccordion items={FAQ} />
          </section>
        </Reveal>
      </div>
    </Screen>
  );
}

export default BillingScreen;
