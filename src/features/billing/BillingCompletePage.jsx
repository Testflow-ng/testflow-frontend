import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PaymentReturnStatus from '../../components/everybody/PaymentReturnStatus.jsx';
import Screen from '../../components/layout/Screen.jsx';
import { formatMoney } from '../../utils/money.js';
import { billingApi } from './api.js';

/** Where Paystack sends the student back. Recover checkout, fetch authoritative status. */
function BillingCompletePage() {
  const [params] = useSearchParams();
  const reference = params.get('reference') ?? params.get('trxref');
  const qc = useQueryClient();
  const [state, setState] = useState(reference ? 'verifying' : 'failed');
  const [purchase, setPurchase] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!reference) return undefined;
    let live = true;
    (async () => {
      for (let i = 0; i < 8; i += 1) {
        try {
          let cs = null;
          try { cs = await billingApi.checkoutStatus(reference); } catch { /* ignore */ }
          const res = await billingApi.refreshStatus(reference);
          if (!live) return;
          const p = res?.purchase ?? cs ?? res;
          setPurchase(p);
          const status = p?.status;
          if (status === 'paid') {
            qc.invalidateQueries({ queryKey: ['billing'] });
            qc.invalidateQueries({ queryKey: ['advertising'] });
            setState('paid');
            return;
          }
          if (['failed', 'cancelled', 'canceled', 'refunded'].includes(status)) {
            setState('failed');
            return;
          }
          if (status === 'expired') {
            setState('failed');
            return;
          }
        } catch {
          /* blip */
        }
        await new Promise((r) => setTimeout(r, 2500));
        if (!live) return;
      }
      setState('pending');
    })();
    return () => { live = false; };
  }, [reference, attempt, qc]);

  const details = [
    ...(reference ? [{ label: 'Reference', value: reference }] : []),
    ...(purchase ? [{ label: 'Amount', value: formatMoney(purchase.amountKobo, purchase.currency) }, { label: 'Pass', value: purchase.planName }] : []),
  ];

  return (
    <Screen width="sm">
      <PaymentReturnStatus state={state} details={details} continueTo="/dashboard" onRetry={() => window.location.assign('/billing')} onCheckAgain={() => { setState('verifying'); setAttempt((n) => n + 1); }} />
    </Screen>
  );
}

export default BillingCompletePage;
