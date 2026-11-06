import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PaymentReturnStatus from '../../../components/everybody/PaymentReturnStatus.jsx';
import Screen from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { wsApi } from '../api.js';

const TRIES = 8;

/** Where Paystack sends the organiser after paying for a plan. */
function BillingCompleteScreen() {
  const [params] = useSearchParams();
  const reference = params.get('reference') ?? params.get('trxref');
  const orgId = params.get('orgId') ?? params.get('organizationId');
  const subId = params.get('subId') ?? params.get('subscriptionId');
  const qc = useQueryClient();
  const [state, setState] = useState(reference ? 'verifying' : 'failed');
  const [payment, setPayment] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!reference) return undefined;
    let live = true;
    (async () => {
      for (let i = 0; i < TRIES; i += 1) {
        try {
          let res;
          if (orgId && subId) {
            try { res = await wsApi.verifySubscriptionPayment(orgId, subId, reference); } catch { res = await wsApi.verifyPayment(reference); }
          } else {
            res = await wsApi.verifyPayment(reference);
          }
          if (!live) return;
          const p = res?.payment ?? res;
          setPayment(p);
          if (p?.status === 'paid' || res?.subscription) { qc.invalidateQueries({ queryKey: ['ws'] }); setState('paid'); return; }
          if (['failed', 'abandoned', 'cancelled', 'canceled', 'expired'].includes(p?.status)) { setState('failed'); return; }
        } catch {
          /* blip */
        }
        await new Promise((r) => setTimeout(r, 2500));
        if (!live) return;
      }
      setState('pending');
    })();
    return () => { live = false; };
  }, [reference, attempt, qc, orgId, subId]);

  const details = [
    ...(reference ? [{ label: 'Reference', value: reference }] : []),
    ...(payment ? [{ label: 'Amount', value: formatMoney(payment.amountKobo, payment.currency) }] : []),
  ];

  return (
    <Screen width="sm">
      <PaymentReturnStatus state={state} details={details} continueTo="/workspace/billing" onRetry={() => window.location.assign('/workspace/billing')} onCheckAgain={() => { setState('verifying'); setAttempt((n) => n + 1); }} />
    </Screen>
  );
}

export default BillingCompleteScreen;
