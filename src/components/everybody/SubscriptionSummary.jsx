import { CalendarClock, Megaphone, Users } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import KeyValueList from '../ui/KeyValueList.jsx';
import Banner from '../ui/Banner.jsx';
import { formatMoney } from '../../utils/money.js';

/**
 * Current plan at a glance. `subscription` = { planName, status, priceMinor, currency, interval, currentPeriodEnd,
 * cancelAtPeriodEnd, pendingPlanName, adsEnabled, graceEndsAt }. Statuses: active, past_due, expired, cancelled, pending.
 * Entitlements (like ads on or off) always come from the server; this only displays them.
 */
function SubscriptionSummary({ subscription: s, onChangePlan, onCancel, onRenew }) {
  const ended = s.status === 'expired' || s.status === 'cancelled';
  return (
    <section aria-label="Subscription" className="space-y-4">
      {s.status === 'past_due' && <Banner variant="warning" title="Payment is overdue.">Renew by {s.graceEndsAt} to keep your workspace editable.</Banner>}
      {s.status === 'expired' && <Banner variant="danger" title="Your subscription has expired.">Your data is kept. Your workspace is read-only until you renew.</Banner>}
      {s.cancelAtPeriodEnd && !ended && <Banner variant="info">Your plan ends on {s.currentPeriodEnd}. You will not be charged again.</Banner>}
      <div className="rounded-[24px] border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Current plan</p>
            <h2 className="mt-1 flex flex-wrap items-center gap-3 font-heading text-2xl font-extrabold text-foreground-strong">{s.planName} <StatusBadge status={s.status} /></h2>
            <p className="mt-1 text-muted"><span className="font-heading text-xl font-extrabold text-foreground-strong">{formatMoney(s.priceMinor, s.currency)}</span> / {s.interval}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ended ? <Button onClick={onRenew}>Renew plan</Button> : <><Button variant="outline" onClick={onChangePlan}>Change plan</Button>{!s.cancelAtPeriodEnd && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}</>}
          </div>
        </div>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li className="flex items-center gap-2"><CalendarClock size={16} aria-hidden="true" /> {ended ? 'Ended' : 'Renews'} {s.currentPeriodEnd}</li>
          <li className="flex items-center gap-2"><Megaphone size={16} aria-hidden="true" /> {s.adsEnabled ? 'Sponsored ads may appear to your students' : 'Ad-free for your students'}</li>
          <li className="flex items-center gap-2"><Users size={16} aria-hidden="true" /> Your students' data stays separate</li>
        </ul>
        {s.pendingPlanName && <div className="mt-5"><KeyValueList items={[{ label: 'Scheduled change', value: `Switches to ${s.pendingPlanName} on ${s.currentPeriodEnd}` }]} /></div>}
      </div>
    </section>
  );
}

export default SubscriptionSummary;
