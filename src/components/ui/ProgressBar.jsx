import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

const tones = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  accent: 'bg-accent',
  ink: 'bg-secondary',
};
const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

/** Horizontal progress. `label` names it for screen readers; `showValue` prints the percentage. */
function ProgressBar({ value = 0, max = 100, tone = 'primary', size = 'md', label, showValue = false, className }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="text-foreground-strong">{label}</span>
          {showValue && <span className="font-semibold text-foreground-strong">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn('w-full overflow-hidden rounded-full bg-surface-strong', heights[size])}
      >
        <motion.div
          className={cn('h-full rounded-full', tones[tone])}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
