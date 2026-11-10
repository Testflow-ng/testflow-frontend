import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Badge, Button } from '../ui/index.js';
import { ICON } from '../ui/iconProps.js';
import { cn } from '../../utils/cn.js';

/**
 * Shows a feature that the current plan does not include. People can still look at it, but cannot use it.
 * `locked` false renders the children untouched. `plan` is the plan that unlocks it.
 */
function PlanLock({ locked = true, plan = 'Pro', title, description, to = '/workspace/billing', children, className }) {
  if (!locked) return children;
  return (
    <div className={className}>
      <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-surface-strong/60 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-muted"><Lock {...ICON} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-foreground-strong">{title}<Badge variant="lime">{plan}</Badge></p>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
        </div>
        <Link to={to} className="sm:shrink-0"><Button size="sm" className="w-full sm:w-auto">See {plan}</Button></Link>
      </div>
      <div inert aria-hidden="true" className={cn('mt-6 select-none opacity-60 [&_*]:pointer-events-none')}>{children}</div>
    </div>
  );
}

export default PlanLock;
