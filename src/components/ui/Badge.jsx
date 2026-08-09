import { cn } from '../../utils/cn.js';

const badgeVariants = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  outline: 'bg-transparent text-muted border-border',
};

function Badge({ children, variant = 'primary', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
