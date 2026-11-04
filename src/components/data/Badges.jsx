import { Flame, Lock } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import ProgressBar from '../ui/ProgressBar.jsx';

/** Day streak. `active` = practised today. */
export function StreakBadge({ days, active = true, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold', active ? 'bg-accent text-accent-foreground' : 'bg-surface-strong text-muted', className)}>
      <Flame size={16} aria-hidden="true" className={active ? 'fill-current' : ''} />
      {days}-day streak
    </span>
  );
}

/** Achievement tile: `unlocked` shows the colour icon; locked shows a lock and optional `progress` text. */
export function AchievementBadge({ icon: Icon, title, description, unlocked = false, progress, current, target, className }) {
  return (
    <div className={cn('flex w-full items-center gap-3 rounded-[20px] border p-3.5', unlocked ? 'border-border bg-surface' : 'border-dashed border-border-strong bg-transparent', className)}>
      <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', unlocked ? 'bg-[var(--brand-lavender)] text-primary' : 'bg-surface-strong text-muted')}>
        {unlocked ? <Icon size={24} strokeWidth={1.6} aria-hidden="true" /> : <Lock size={20} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-[15px] font-semibold', unlocked ? 'text-foreground-strong' : 'text-foreground')}>{title}</span>
        <span className="block text-sm text-muted">{unlocked ? description : (progress ?? 'Locked')}</span>
        {!unlocked && target ? (
          <span className="mt-2 flex items-center gap-2">
            <ProgressBar size="sm" value={current ?? 0} max={target} label={undefined} className="flex-1" />
            <span className="text-xs font-semibold tabular-nums text-muted">{current ?? 0}/{target}</span>
          </span>
        ) : null}
      </span>
    </div>
  );
}
