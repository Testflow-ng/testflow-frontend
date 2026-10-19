import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PaymentReturnStatus from '../../../components/everybody/PaymentReturnStatus.jsx';
import Screen from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { wsApi } from '../api.js';

const TRIES = 8;

/** Where Paystack sends the organiser after paying for a plan. The backend verifies it, then we say what happened. */
function BillingCompleteScreen() {
  const [params] = useSearchParams();
  const reference = params.get('reference') ?? params.get('trxref');
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
          const res = await wsApi.verifyPayment(reference);
          if (!live) return;
          setPayment(res.payment);
          if (res.payment?.status === 'paid') { qc.invalidateQueries({ queryKey: ['ws'] }); setState('paid'); return; }
          if (['failed', 'abandoned'].includes(res.payment?.status)) { setState('failed'); return; }
        } catch {
          /* a blip while polling: try again */
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
    ...(payment ? [{ label: 'Amount', value: formatMoney(payment.amountKobo, payment.currency) }] : []),
  ];

  return (
    <Screen width="sm">
      <PaymentReturnStatus state={state} details={details} continueTo="/workspace/billing" onRetry={() => window.location.assign('/workspace/billing')} onCheckAgain={() => { setState('verifying'); setAttempt((n) => n + 1); }} />
    </Screen>
  );
}

export default BillingCompleteScreen;
