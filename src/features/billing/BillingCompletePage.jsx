import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PaymentReturnStatus from '../../components/everybody/PaymentReturnStatus.jsx';
import Screen from '../../components/layout/Screen.jsx';
import { formatMoney } from '../../utils/money.js';
import { billingApi } from './api.js';

const TRIES = 8;
const DELAY = 2500;

/** Where Paystack sends the student back. Asks the backend to verify the payment, then says what happened. */
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
      for (let i = 0; i < TRIES; i += 1) {
        try {
          const res = await billingApi.status(reference);
          if (!live) return;
          setPurchase(res.purchase);
          const status = res.purchase?.status;
          if (status === 'paid') {
            qc.invalidateQueries({ queryKey: ['billing'] });
            qc.invalidateQueries({ queryKey: ['advertising'] });
            setState('paid');
            return;
          }
          if (['failed', 'cancelled', 'refunded'].includes(status)) {
            setState('failed');
            return;
          }
        } catch {
          /* a blip while polling: try again */
        }
        await new Promise((r) => setTimeout(r, DELAY));
        if (!live) return;
      }
      setState('pending');
    })();
    return () => {
      live = false;
    };
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
