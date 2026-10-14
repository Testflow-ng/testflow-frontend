import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import CountUp from '../ui/CountUp.jsx';

const tones = {
  primary: 'bg-[var(--brand-lavender)] text-primary',
  success: 'bg-success/10 text-success',
  accent: 'bg-accent text-accent-foreground',
  sage: 'bg-[var(--brand-sage)] text-secondary',
  warning: 'bg-warning/15 text-[#8a5a00]',
};

/** A number with a small label, an optional icon and a trend (`trend` = signed percentage points). */
function StatCard({ label, value, icon: Icon, tone = 'primary', trend, trendLabel, className }) {
  const up = trend > 0;
  const flat = trend === 0 || trend == null;
  const TrendIcon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={cn('rounded-[20px] border border-border bg-surface p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <span className={cn('flex size-10 items-center justify-center rounded-xl', tones[tone])}>
            <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
          </span>
        ) : (
          <span />
        )}
        {trend != null && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              flat ? 'bg-surface-strong text-muted' : up ? 'bg-success/10 text-score-good' : 'bg-danger/10 text-score-low',
            )}
          >
            <TrendIcon size={13} aria-hidden="true" />
            {Math.abs(trend)}%
            <span className="sr-only">{flat ? 'no change' : up ? 'up' : 'down'}</span>
          </span>
        )}
      </div>
      <p className="mt-4 font-heading text-[1.75rem] font-extrabold leading-none tracking-tight tabular-nums text-foreground-strong">
        {typeof value === 'number' ? (
          <CountUp value={value} />
        ) : /^\d+%$/.test(String(value)) ? (
          <CountUp value={parseInt(value, 10)} suffix="%" />
        ) : (
          value
        )}
      </p>
      <p className="mt-1.5 text-sm text-muted">{label}</p>
      {trendLabel && <p className="mt-0.5 text-xs text-muted">{trendLabel}</p>}
    </div>
  );
}

export default StatCard;
