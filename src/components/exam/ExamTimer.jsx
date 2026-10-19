import { Timer } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const fmt = (s) => {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.max(0, s) % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/**
 * Time remaining. Turns amber under `warnAt` seconds and red under `urgentAt`. The visible clock is
 * `aria-hidden`; a polite live region announces only at the thresholds, so it never chatters every second.
 */
function ExamTimer({ secondsLeft, totalSeconds, warnAt = 300, urgentAt = 60, className }) {
  const urgent = secondsLeft <= urgentAt;
  const warn = secondsLeft <= warnAt;
  const pct = totalSeconds ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : null;
  const announce = urgent ? 'One minute left' : warn ? `${Math.ceil(secondsLeft / 60)} minutes left` : '';
  return (
    <div className={cn('inline-flex flex-col gap-1.5', className)}>
      <div className={cn('inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[15px] font-bold tabular-nums', urgent ? 'border-danger bg-danger/10 text-score-low' : warn ? 'border-warning bg-warning/15 text-[#8a5a00]' : 'border-border bg-surface text-foreground-strong')}>
        <Timer size={16} aria-hidden="true" />
        <span aria-hidden="true">{fmt(secondsLeft)}</span>
        <span className="sr-only">Time remaining {fmt(secondsLeft)}</span>
      </div>
      {pct != null && (
        <div aria-hidden="true" className="h-1 w-full overflow-hidden rounded-full bg-surface-strong">
          <div className={cn('h-full rounded-full transition-[width] duration-1000 ease-linear motion-reduce:transition-none', urgent ? 'bg-danger' : warn ? 'bg-warning' : 'bg-primary')} style={{ width: `${pct}%` }} />
        </div>
      )}
      <span className="sr-only" role="status" aria-live="polite">{announce}</span>
    </div>
  );
}

export default ExamTimer;
