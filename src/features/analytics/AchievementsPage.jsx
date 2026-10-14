import { Trophy } from 'lucide-react';
import { Banner, Card, ProgressBar, ProgressRing, SkeletonCard } from '../../components/ui/index.js';
import Mascot from '../../components/brand/Mascot.jsx';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { AchievementBadge } from '../../components/data/Badges.jsx';
import { useStats } from './useStats.js';
import Achievements from './Achievements.jsx';
import { ACHIEVEMENT_ICONS } from './achievementIcons.js';
import { deriveAchievements } from './achievements.js';

/** Flo's expression and line follow how much has really been earned. */
function floFor(earned, total) {
  if (earned === 0) return { mood: 'encouraging', line: 'No badges yet. Finish one exam and the first is yours.' };
  if (earned === total) return { mood: 'excited', line: 'Every badge earned. Outstanding.' };
  if (earned / total >= 0.5) return { mood: 'confident', line: 'More than halfway. Keep going.' };
  return { mood: 'happy', line: 'Nice start. The next one is close.' };
}

function AchievementsPage() {
  const { data: stats, isLoading, isError, error } = useStats();

  const list = stats ? deriveAchievements(stats) : [];
  const earned = list.filter((a) => a.earned).length;
  const locked = list.filter((a) => !a.earned);
  const next = [...locked].sort((a, b) => b.current / b.target - a.current / a.target)[0];
  const flo = floFor(earned, list.length);

  return (
    <Screen width="xl">
      <PageHeader title="Achievements" subtitle="Badges you earn as you practice." />

      <div className="mt-6 space-y-8">
        {isLoading ? (
          <>
            <SkeletonCard className="h-48" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <SkeletonCard key={i} className="h-[5.5rem]" />
              ))}
            </div>
          </>
        ) : isError ? (
          <Banner variant="danger">{error?.message ?? 'Could not load achievements.'}</Banner>
        ) : stats ? (
          <>
            <Card padding="lg" className="grid items-center gap-6 bg-[var(--brand-lavender)] sm:grid-cols-[auto_1fr_auto]">
              <Mascot mood={flo.mood} animation="float" size={120} className="mx-auto" />
              <div className="text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Your collection</p>
                <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
                  {earned} of {list.length} <em className="tf-accent font-normal">earned</em>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{flo.line}</p>
              </div>
              <div className="mx-auto">
                <ProgressRing value={earned} max={list.length} size={104} stroke={10} tone="primary" label="Badges earned">
                  <Trophy size={26} className="text-primary" aria-hidden="true" />
                </ProgressRing>
              </div>
            </Card>

            {next && (
              <section aria-labelledby="next-up">
                <h2 id="next-up" className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Next up</h2>
                <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="sm:w-80">
                    <AchievementBadge
                      icon={ACHIEVEMENT_ICONS[next.key] ?? Trophy}
                      title={next.label}
                      description={next.description}
                      progress={next.description}
                      unlocked={false}
                      className="border-0 p-0"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <ProgressBar
                      tone="accent"
                      value={next.current}
                      max={next.target}
                      label={`${next.current} of ${next.target}`}
                    />
                  </div>
                </Card>
              </section>
            )}

            <Achievements stats={stats} />
          </>
        ) : null}
      </div>
    </Screen>
  );
}

export default AchievementsPage;
