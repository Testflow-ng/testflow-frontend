import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const variants = {
  info: { Icon: Info, cls: 'bg-[var(--brand-lavender)] text-foreground-strong [&>svg]:text-primary' },
  success: { Icon: CheckCircle2, cls: 'bg-success/10 text-foreground-strong [&>svg]:text-success' },
  warning: { Icon: AlertTriangle, cls: 'bg-warning/15 text-foreground-strong [&>svg]:text-warning' },
  danger: { Icon: AlertCircle, cls: 'bg-danger/10 text-foreground-strong [&>svg]:text-danger' },
};

/** Full-width notice at the top of a page or workspace, with an optional action and dismiss. */
function Banner({ variant = 'info', title, children, action, onDismiss, className }) {
  const { Icon, cls } = variants[variant] ?? variants.info;
  return (
    <div role={variant === 'danger' ? 'alert' : 'status'} className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl px-4 py-3 text-sm', cls, className)}>
      <Icon size={18} aria-hidden="true" className="shrink-0" />
      <p className="min-w-0 flex-1 leading-snug">
        {title && <strong className="font-semibold">{title} </strong>}
        {children}
      </p>
      {action}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="flex size-8 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default Banner;
