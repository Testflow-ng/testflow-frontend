import { Star } from 'lucide-react';
import { AchievementBadge } from '../../components/data/Badges.jsx';
import { ACHIEVEMENT_ICONS } from './achievementIcons.js';
import { ACHIEVEMENT_GROUPS, deriveAchievements } from './achievements.js';


/** Badges in sections (Practice, Scores, ...). Locked ones show a progress bar toward unlocking. */
function Achievements({ stats }) {
  const achievements = deriveAchievements(stats);

  return (
    <div className="space-y-8">
      {ACHIEVEMENT_GROUPS.map((group) => {
        const items = achievements.filter((a) => a.group === group.key);
        const earned = items.filter((a) => a.earned).length;
        return (
          <section key={group.key} aria-labelledby={`ach-${group.key}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id={`ach-${group.key}`} className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                {group.label}
              </h2>
              <span className="text-xs font-semibold tabular-nums text-muted">
                {earned}/{items.length}
              </span>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((a) => (
                <li key={a.key} className="flex">
                  <AchievementBadge
                    icon={ACHIEVEMENT_ICONS[a.key] ?? Star}
                    title={a.label}
                    description={a.description}
                    unlocked={a.earned}
                    progress={a.description}
                    current={a.current}
                    target={a.target}
                  />
                  <span className="sr-only">{a.earned ? 'Earned' : 'Locked'}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default Achievements;
