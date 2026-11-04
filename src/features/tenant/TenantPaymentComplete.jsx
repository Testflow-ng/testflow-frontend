import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Banner, Button, Spinner } from '../../components/ui/index.js';
import TenantShell from './TenantShell.jsx';
import { tenantApi } from './tenantApi.js';

/** Where the payment provider sends the student back to: confirm the payment, then open the exam. */
function TenantPaymentComplete() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reference = params.get('reference') || params.get('trxref');
  const [error, setError] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !reference) return;
    ran.current = true;
    tenantApi.verifyPayment(reference)
      .then((r) => (r.access ? navigate(`/exam/${r.payment.itemRef}`, { replace: true }) : setError('The payment did not go through. You have not been charged for this exam.')))
      .catch((e) => setError(e.message || 'Could not confirm the payment.'));
  }, [reference, navigate]);

  return (
    <TenantShell>
      {!reference || error ? (
        <div className="space-y-4"><Banner variant="danger">{error || 'This payment link is incomplete.'}</Banner><Button onClick={() => navigate('/')}>Back to exams</Button></div>
      ) : (
        <div className="flex items-center justify-center gap-3 py-20 text-sm text-muted" role="status"><Spinner className="text-primary" />Confirming your payment…</div>
      )}
    </TenantShell>
  );
}

export default TenantPaymentComplete;
