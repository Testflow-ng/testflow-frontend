import { Crown } from 'lucide-react';
import Avatar from '../ui/Avatar.jsx';
import { cn } from '../../utils/cn.js';

const medal = ['bg-accent text-accent-foreground', 'bg-[var(--brand-lavender)] text-primary', 'bg-[var(--brand-sage)] text-secondary'];

/** One line of a leaderboard. `isYou` highlights the signed-in student. */
function LeaderboardRow({ rank, name, score, detail, src, isYou = false, className }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border px-3.5 py-2.5', isYou ? 'border-primary/30 bg-[var(--brand-lavender)]/60' : 'border-border bg-surface', className)}>
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums', rank <= 3 ? medal[rank - 1] : 'bg-surface-strong text-muted')}>
        {rank === 1 ? <Crown size={15} aria-label="First place" /> : rank}
      </span>
      <Avatar name={name} src={src} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-foreground-strong">
          {name}
          {isYou && <span className="ml-1.5 text-xs font-bold text-primary">You</span>}
        </span>
        {detail && <span className="block truncate text-xs text-muted">{detail}</span>}
      </span>
      <span className="font-heading text-lg font-extrabold tabular-nums text-foreground-strong">{score}</span>
    </div>
  );
}

export default LeaderboardRow;
