import { Crown, Trophy } from 'lucide-react';
import { Button, Card, EmptyState, Reveal } from '../../components/ui/index.js';
import LeaderboardRow from '../../components/data/LeaderboardRow.jsx';
import { cn } from '../../utils/cn.js';

const PODIUM = ['bg-accent text-accent-foreground', 'bg-[var(--brand-lavender)] text-primary', 'bg-[var(--brand-sage)] text-secondary'];
const mmss = (s) => (s == null ? null : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`);

/** "92% accuracy · 3m 04s · 9 correct", the stats the Hall of Fame prints under a name. */
const rowDetail = ({ accuracy, timeTakenSeconds, correctCount }) =>
  [
    accuracy != null ? `${accuracy}% accuracy` : null,
    mmss(timeTakenSeconds),
    correctCount != null ? `${correctCount} correct` : null,
  ]
    .filter(Boolean)
    .join(' · ');

const detailOf = (r) => rowDetail(r) || r.attemptStatus;
const scoreOf = (r) => (r.score != null ? `${r.score} pts` : '-');

/**
 * The live session standings, styled like the Hall of Fame: a podium for the top three, then the
 * rest as rows. Both the participant result and the host dashboard render this, so a published
 * sitting looks the same on either side. Pass `onSelect` to make each place open that person's
 * paper (the host reviewing the room).
 */
function LiveLeaderboard({ rows = [], meId = null, onSelect, empty = 'No papers to rank yet.' }) {
  const ranked = [...rows].sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER));
  const isYou = (r) => Boolean(r.isYou) || (meId != null && String(r.userId) === String(meId));
  // Only a submitted or timed-out paper can be opened; a name with no paper is shown, not clickable.
  const canOpen = (r) => typeof onSelect === 'function' && ['submitted', 'timed_out'].includes(r.attemptStatus);

  if (ranked.length === 0) return <EmptyState icon={Trophy} title="No standings yet" description={empty} />;

  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="grid gap-3">
      <Reveal>
        <ol className="grid gap-3 sm:grid-cols-3">
          {top.map((r, i) => (
            <li key={r.userId}>
              <Card className={cn('flex h-full flex-col items-center gap-2 text-center', isYou(r) && 'ring-2 ring-primary/30')}>
                <span className={cn('flex size-11 items-center justify-center rounded-full', PODIUM[i])}>
                  {i === 0 ? <Crown size={20} strokeWidth={1.5} aria-label="First place" /> : <Trophy size={18} strokeWidth={1.5} aria-label={`Place ${i + 1}`} />}
                </span>
                <p className="font-heading text-lg font-bold text-foreground-strong">#{r.rank ?? i + 1}</p>
                <p className="max-w-full truncate text-[15px] font-semibold text-foreground-strong">
                  {r.displayName}
                  {isYou(r) && <span className="ml-1.5 text-xs font-bold text-primary">You</span>}
                </p>
                <p className="font-heading text-2xl font-extrabold tabular-nums text-foreground-strong">{scoreOf(r)}</p>
                <p className="text-xs text-muted">{detailOf(r)}</p>
                {canOpen(r) && (
                  <Button variant="ghost" size="sm" onClick={() => onSelect(r)}>
                    View paper
                  </Button>
                )}
              </Card>
            </li>
          ))}
        </ol>
      </Reveal>

      {rest.length > 0 && (
        <Reveal delay={0.08}>
          <div className="space-y-2">
            {rest.map((r, i) =>
              canOpen(r) ? (
                <button
                  key={r.userId}
                  type="button"
                  onClick={() => onSelect(r)}
                  aria-label={`View ${r.displayName}'s paper`}
                  className="block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <LeaderboardRow rank={r.rank ?? i + 4} name={r.displayName} score={scoreOf(r)} detail={detailOf(r)} isYou={isYou(r)} />
                </button>
              ) : (
                <LeaderboardRow key={r.userId} rank={r.rank ?? i + 4} name={r.displayName} score={scoreOf(r)} detail={detailOf(r)} isYou={isYou(r)} />
              ),
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}

export default LiveLeaderboard;
