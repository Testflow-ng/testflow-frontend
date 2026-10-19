import { useState } from 'react';
import { BookOpen, Check, Lock, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge, Banner, Button, Card, KeyValueList, Reveal, SkeletonCard, useToast } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import { cn } from '../../utils/cn.js';
import { formatMoney } from '../../utils/money.js';
import { billingApi } from './api.js';
import { useEntitlement, useProducts } from './useBilling.js';

const BENEFITS = [
  { icon: Sparkles, text: 'No ads anywhere in Testflow' },
  { icon: BookOpen, text: 'Read and download every book in the Library' },
  { icon: Radio, text: 'Host Live CBT sessions for your friends' },
  { icon: ShieldCheck, text: 'Renew early and the days add on, nothing is lost' },
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
  const featuredKey = plans?.length ? plans[plans.length - 1].key : null;

  return (
    <Screen width="xl">
      <PageHeader back="/settings" eyebrow="Plan" title="Student Pass" subtitle="Remove ads and host Live CBT. One payment, no auto-renewal." />

      <div className="mt-8 space-y-8">
        <Reveal>
          <Card padding="lg" className={cn('flex flex-col gap-5 sm:flex-row sm:items-center', active ? 'bg-[var(--brand-sage)]' : 'bg-[var(--brand-lavender)]')}>
            <Mascot mood={active ? 'excited' : 'happy'} animation="float" size={88} className="mx-auto shrink-0" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">{active ? 'Your pass is active' : 'You are on the free plan'}</h2>
                <Badge variant={active ? 'success' : 'outline'}>{active ? 'Active' : held?.status === 'expired' ? 'Expired' : 'Free'}</Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                {active
                  ? `Ad-free with the Library and Live CBT hosting until ${fmtDate(held.expiresAt)}.`
                  : 'Ads show on Home and after each exam. Reading and downloading Library books and hosting a Live CBT need a pass. Browsing the shelf and joining a session are always free.'}
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
                const featured = plan.key === featuredKey && plans.length > 1;
                return (
                  <li key={plan.key} className="flex">
                    <Card padding="lg" className={cn('relative flex w-full flex-col gap-5', featured && 'border-secondary ring-1 ring-secondary/20')}>
                      {featured && <Badge variant="lime" className="absolute right-5 top-5">Best value</Badge>}
                      <div>
                        <h3 className="font-heading text-lg font-bold text-foreground-strong">{plan.name}</h3>
                        <p className="mt-1 text-sm text-muted">{plan.description}</p>
                      </div>
                      <div>
                        <p className="font-heading text-4xl font-extrabold tracking-tight text-foreground-strong">{formatMoney(plan.priceMinor, plan.currency)}</p>
                        <p className="mt-1 text-sm text-muted">{plan.durationDays} days · about {perDay(plan)} a day</p>
                      </div>
                      <ul className="space-y-2.5">
                        {BENEFITS.map(({ icon: Icon, text }) => (
                          <li key={text} className="flex items-start gap-2.5 text-sm text-foreground">
                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-lavender)] text-primary"><Check size={12} strokeWidth={2.5} aria-hidden="true" /></span>
                            <span className="flex items-start gap-1.5"><Icon {...ICON} size={15} className="mt-0.5 shrink-0 text-muted" />{text}</span>
                          </li>
                        ))}
                      </ul>
                      <Button size="lg" className="mt-auto w-full" variant={featured ? 'primary' : 'outline'} loading={busy === plan.key} disabled={busy !== null && busy !== plan.key} onClick={() => pay(plan)}>
                        {active ? 'Add these days' : 'Get this pass'}
                      </Button>
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
