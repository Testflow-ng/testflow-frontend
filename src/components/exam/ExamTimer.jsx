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
  const announce = urgent ? 'One minute left' : warn ? `${Math.ceil(secondsLeft / 60)} minutes left` : '';
  return (
    <div
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 font-mono text-xs font-bold tabular-nums sm:h-9 sm:px-3 sm:text-sm shrink-0',
        urgent
          ? 'border-danger bg-danger/10 text-score-low'
          : warn
            ? 'border-warning bg-warning/15 text-[#8a5a00]'
            : 'border-border bg-surface text-foreground-strong',
        className,
      )}
    >
      <Timer size={15} className="shrink-0" aria-hidden="true" />
      <span aria-hidden="true">{fmt(secondsLeft)}</span>
      <span className="sr-only">Time remaining {fmt(secondsLeft)}</span>
      {announce ? <span className="sr-only" role="status" aria-live="polite">{announce}</span> : null}
    </div>
  );
}

export default ExamTimer;
