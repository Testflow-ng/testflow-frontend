import { Award, Compass, Flame, Medal, Sparkles, Star } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { deriveAchievements } from './achievements.js';

const ICONS = {
  'first-exam': Star,
  'five-exams': Flame,
  'high-scorer': Medal,
  perfect: Sparkles,
  consistent: Award,
  explorer: Compass,
};

function Achievements({ stats }) {
  const achievements = deriveAchievements(stats);

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {achievements.map((achievement) => {
        const Icon = ICONS[achievement.key] ?? Star;
        return (
          <li
            key={achievement.key}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border p-4 text-center',
              achievement.earned
                ? 'border-border bg-surface'
                : 'border-dashed border-border opacity-60',
            )}
          >
            <span
              className={cn(
                'flex size-11 items-center justify-center rounded-full',
                achievement.earned ? 'bg-primary/10 text-primary' : 'bg-surface-strong text-muted',
              )}
            >
              <Icon size={20} aria-hidden="true" />
            </span>
            <span className="text-[14px] font-semibold leading-snug text-foreground-strong">
              {achievement.label}
            </span>
            <span className="text-[12px] leading-snug text-muted">{achievement.description}</span>
            <span className="sr-only">{achievement.earned ? 'Earned' : 'Locked'}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default Achievements;
