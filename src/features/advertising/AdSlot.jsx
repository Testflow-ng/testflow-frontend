import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import GoogleAdUnit from './GoogleAdUnit.jsx';
import { useAdPlacement } from './useAdPlacement.js';

/**
 * A quiet, labelled ad area for a page. Renders nothing when the backend says no ad may show here
 * (ad-free pass, placement off, provider off). Never use it inside an exam or a live room.
 */
function AdSlot({ placement, minHeight = 100, className }) {
  const ad = useAdPlacement(placement);
  if (!ad.show) return null;

  return (
    <aside aria-label="Advertisement" className={cn('rounded-[20px] border border-border bg-surface p-3', className)}>
      <div className="mb-2 flex items-center justify-between px-1 text-[11px]">
        <span className="font-semibold uppercase tracking-[0.14em] text-muted">Advertisement</span>
        <Link to="/billing" className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Remove ads</Link>
      </div>
      <GoogleAdUnit publisherId={ad.publisherId} slotId={ad.slotId} minHeight={minHeight} />
    </aside>
  );
}

export default AdSlot;
