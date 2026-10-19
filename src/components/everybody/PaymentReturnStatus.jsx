import { Link } from 'react-router-dom';
import Spinner from '../ui/Spinner.jsx';
import Mascot from '../brand/Mascot.jsx';
import Button from '../ui/Button.jsx';
import KeyValueList from '../ui/KeyValueList.jsx';

const COPY = {
  verifying: { title: 'Confirming your payment', body: 'This usually takes a few seconds. Please keep this page open.' },
  paid: { title: 'Payment received', body: 'Your plan is active. Welcome aboard.' },
  pending: { title: 'Still confirming', body: 'The bank is taking a little longer. You will be emailed when it is done, and you can check again below.' },
  failed: { title: 'Payment did not go through', body: 'You were not charged. You can try again with the same or another card.' },
};

/**
 * The page people land on after the payment provider. `state`: verifying | paid | pending | failed. Poll the verify
 * endpoint in the parent and pass the result. `details` = [{ label, value }] shows the reference and amount.
 */
function PaymentReturnStatus({ state, details = [], continueTo = '/', onRetry, onCheckAgain }) {
  const c = COPY[state] ?? COPY.verifying;
  return (
    <section aria-live="polite" className="mx-auto flex max-w-[28rem] flex-col items-center gap-3 py-12 text-center">
      {state === 'verifying' ? <Spinner size="xl" className="text-primary" label="Confirming payment" /> : <Mascot mood={state === 'paid' ? 'excited' : state === 'failed' ? 'sad' : 'thinking'} size={96} />}
      <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">{c.title}</h1>
      <p className="text-[15px] leading-relaxed text-muted">{c.body}</p>
      {details.length > 0 && <KeyValueList className="mt-3 w-full text-left" items={details} />}
      <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        {state === 'paid' && <Link to={continueTo} className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary-hover">Go to your dashboard</Link>}
        {state === 'pending' && <Button onClick={onCheckAgain}>Check again</Button>}
        {state === 'failed' && <Button onClick={onRetry}>Try again</Button>}
        {(state === 'pending' || state === 'failed') && <Link to={continueTo} className="inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold text-muted hover:bg-surface-strong">Back to billing</Link>}
      </div>
    </section>
  );
}

export default PaymentReturnStatus;
