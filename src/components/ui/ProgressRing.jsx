import { cn } from '../../utils/cn.js';

const tones = {
  primary: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  accent: 'stroke-accent',
  ink: 'stroke-secondary',
};

/** Circular progress (scores, readiness, streak goals). Children render in the centre. */
function ProgressRing({ value = 0, max = 100, size = 96, stroke = 9, tone = 'primary', label, children, className }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-strong" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className={cn('transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none', tones[tone])}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-center font-heading font-extrabold text-foreground-strong" style={{ fontSize: size * 0.24 }}>
        {children ?? `${Math.round(pct)}%`}
      </span>
    </div>
  );
}

export default ProgressRing;
