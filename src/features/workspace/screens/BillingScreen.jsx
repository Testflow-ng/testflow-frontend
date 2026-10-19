import { useState } from 'react';
import { CalendarClock, Check, Crown, MoreHorizontal, Sparkles, X } from 'lucide-react';
import { Badge, Banner, Button, Card, DropdownMenu, IconButton, Reveal, Skeleton, useToast } from '../../../components/ui/index.js';
import FaqAccordion from '../../../components/marketing/FaqAccordion.jsx';
import InvoiceTable from '../../../components/everybody/InvoiceTable.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { cn } from '../../../utils/cn.js';
import { formatMoney } from '../../../utils/money.js';
import { wsApi } from '../api.js';
import { usePlans, useSubscription, useSubscriptionPayments } from '../useWorkspace.js';

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
  const { data: sub, isLoading, error } = useSubscription();
  const { data: plans } = usePlans();
  const payments = useSubscriptionPayments().data ?? [];
  const [busy, setBusy] = useState(null);

  /** Upgrades and renewals go straight to the payment page. A downgrade needs no payment: it starts when the period ends. */
  const go = async (key, run) => {
    setBusy(key);
    try {
      const res = await run();
      if (res?.authorizationUrl) window.location.assign(res.authorizationUrl);
      else { toast.success('Plan change scheduled', 'It starts when your current period ends.'); setBusy(null); }
    } catch (e) {
      toast.error('Could not start the payment', e.message);
      setBusy(null);
    }
  };
  const choose = (p) => go(p.key, () => wsApi.changePlan(sub?.id, p.key));
  const renew = () => go('renew', () => wsApi.renew(sub.id));

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
