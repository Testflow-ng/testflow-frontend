import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const variants = {
  info: { className: 'border-info/30 bg-info/10 text-info', Icon: Info, role: 'status' },
  success: {
    className: 'border-success/30 bg-success/10 text-success',
    Icon: CheckCircle2,
    role: 'status',
  },
  warning: {
    className: 'border-warning/30 bg-warning/10 text-warning',
    Icon: AlertTriangle,
    role: 'status',
  },
  danger: {
    className: 'border-danger/30 bg-danger/10 text-danger',
    Icon: AlertCircle,
    role: 'alert',
  },
};

/** Inline status message for form-level feedback. Pairs an icon with text. */
function Alert({ variant = 'info', className, children }) {
  const { className: variantClass, Icon, role } = variants[variant] ?? variants.info;

  return (
    <div
      role={role}
      className={cn('flex items-start gap-2 rounded-md border p-3 text-sm', variantClass, className)}
    >
      <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export default Alert;
