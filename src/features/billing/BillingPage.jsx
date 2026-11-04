import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Layers, Lock, Radio, Receipt, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge, Banner, Button, Card, KeyValueList, Reveal, SkeletonCard, useToast } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import { cn } from '../../utils/cn.js';
import { formatMoney } from '../../utils/money.js';
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

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : null);
const perDay = (p) => formatMoney(Math.round(p.priceMinor / p.durationDays), p.currency);

/** Choose and pay for a Student Pass. Paystack takes the payment; the backend verifies it and grants the pass. */
function BillingPage() {
  const toast = useToast();
  const { data: plans, isLoading, error } = useProducts();
  const { data: held } = useEntitlement();
  const [busy, setBusy] = useState(null);

  const pay = async (plan) => {
    if (plan.comingSoon || plan.available === false) return;
    setBusy(plan.key);
    try {
      const purchase = await billingApi.checkout(plan.key, crypto.randomUUID());
      if (!purchase.authorizationUrl) {
        toast.error('Payments are not switched on yet', 'Please try again later.');
        setBusy(null);
        return;
      }
      window.location.assign(purchase.authorizationUrl);
    } catch (e) {
      toast.error('Could not start the payment', e?.message ?? 'Try again.');
      setBusy(null);
    }
  };

  const active = held?.status === 'active';

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
                          loading={busy === plan.key}
                          disabled={busy !== null && busy !== plan.key}
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
              { label: 'Payment', value: 'Card, bank transfer or USSD via Paystack' },
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
    </Screen>
  );
}

export default BillingPage;
