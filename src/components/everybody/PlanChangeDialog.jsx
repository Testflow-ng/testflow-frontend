import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Radio from '../ui/Radio.jsx';
import { formatMoney } from '../../utils/money.js';

/**
 * Choose a different plan. `plans` = [{ key, name, priceMinor, currency, interval, adsEnabled }]. Upgrades take effect at
 * once and downgrades at the end of the period; say which in `note`. `onConfirm(planKey)` may be async.
 */
function PlanChangeDialog({ open, onOpenChange, plans, currentKey, onConfirm, note }) {
  const [pick, setPick] = useState(currentKey);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      await onConfirm?.(pick);
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Change plan" description={note ?? 'Upgrades start straight away. Downgrades start when your current period ends.'} dismissible={!busy} footer={
      <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
        <Button onClick={go} disabled={busy || pick === currentKey} aria-busy={busy}>Switch plan</Button>
      </div>
    }>
      <fieldset className="space-y-2.5 pb-2">
        <legend className="sr-only">Plans</legend>
        {plans.map((p) => (
          <div key={p.key} className={`rounded-2xl border p-3.5 ${pick === p.key ? 'border-primary bg-[var(--brand-lavender)]/50' : 'border-border'}`}>
            <Radio name="plan" checked={pick === p.key} onChange={() => setPick(p.key)} label={<span className="flex flex-wrap items-baseline gap-x-2"><b>{p.name}</b><span>{formatMoney(p.priceMinor, p.currency)} / {p.interval}</span>{p.key === currentKey && <span className="text-xs font-bold text-primary">Current</span>}</span>} hint={p.adsEnabled ? 'Shows sponsored ads to your students' : 'Ad-free'} />
          </div>
        ))}
      </fieldset>
    </Modal>
  );
}

export default PlanChangeDialog;
