import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const cls =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full pr-3 text-[15px] font-medium text-muted transition-colors hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/** "Back" link. With `to` it is a real link; without, it goes back in history. */
function BackButton({ to, label = 'Back', className }) {
  const navigate = useNavigate();
  const inner = (
    <>
      <span className="flex size-8 items-center justify-center rounded-full border border-border bg-surface">
        <ArrowLeft size={16} aria-hidden="true" />
      </span>
      {label}
    </>
  );
  return to ? (
    <Link to={to} className={cn(cls, className)}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={() => navigate(-1)} className={cn(cls, className)}>
      {inner}
    </button>
  );
}

export default BackButton;
