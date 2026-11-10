import { useNavigate } from 'react-router-dom';
import { Banner, Button } from '../../components/ui/index.js';
import { useSubscription } from './useWorkspace.js';

/** Shown on every workspace page while the free Studio trial runs, and once after it ends. */
function TrialBanner() {
  const navigate = useNavigate();
  const { data: sub } = useSubscription();
  const trial = sub?.trial;
  if (!trial || !trial.active) return null;
  const days = trial.daysLeft;
  return (
    <div className="mx-auto w-full max-w-[72rem] px-4 pt-4 sm:px-6">
      <Banner
        variant={days <= 3 ? 'warning' : 'info'}
        title="Free Studio trial."
        action={<Button onClick={() => navigate('/workspace/billing')} size="sm" variant={days <= 3 ? 'primary' : 'outline'}>Choose a plan</Button>}
      >
        {days <= 1 ? 'Ends today.' : `${days} days left.`} Everything in Studio is open to you until then, after which you move to Free.
      </Banner>
    </div>
  );
}

export default TrialBanner;
