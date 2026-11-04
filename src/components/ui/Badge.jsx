import { cn } from '../../utils/cn.js';

const badgeVariants = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/15 text-[#8a5a00] border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  lavender: 'bg-[var(--brand-lavender)] text-primary border-transparent',
  lime: 'bg-accent text-accent-foreground border-transparent',
  sage: 'bg-[var(--brand-sage)] text-secondary border-transparent',
  outline: 'bg-transparent text-muted border-border',
};

function Badge({ children, variant = 'primary', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ',
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
