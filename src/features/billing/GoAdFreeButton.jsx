import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ICON } from '../../components/ui/iconProps.js';
import { cn } from '../../utils/cn.js';
import { useEntitlement } from './useBilling.js';

/** A small pill that opens the pass page. Hidden once the student already has a live pass. */
function GoAdFreeButton({ className }) {
  const { data } = useEntitlement();
  if (data?.adFree) return null;
  return (
    <Link
      to="/billing"
      className={cn('inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5 text-[13px] font-semibold text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background', className)}
    >
      <Sparkles {...ICON} size={15} /> Go ad-free
    </Link>
  );
}

export default GoAdFreeButton;
