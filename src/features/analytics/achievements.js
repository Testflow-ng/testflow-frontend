/**
 * Derive the achievement list (earned/locked, with progress) from a student's stats.
 * `group` sections the page; `current`/`target` drive the progress bar on locked badges.
 */
export const ACHIEVEMENT_GROUPS = [
  { key: 'practice', label: 'Practice' },
  { key: 'scores', label: 'Scores' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'explore', label: 'Explore' },
];

export function deriveAchievements(stats) {
  const exams = stats.totalExams ?? 0;
  const best = stats.bestScore ?? 0;
  const avg = stats.averageScore ?? 0;
  const subjects = stats.perSubject?.length ?? 0;

  const make = (key, group, label, description, current, target) => ({
    key,
    group,
    label,
    description,
    current: Math.min(current, target),
    target,
    earned: current >= target,
  });

  return [
    make('first-exam', 'practice', 'First step', 'Complete your first exam', exams, 1),
    make('five-exams', 'practice', 'Warming up', 'Complete 5 exams', exams, 5),
    make('ten-exams', 'practice', 'On a roll', 'Complete 10 exams', exams, 10),
    make('twenty-five-exams', 'practice', 'Dedicated', 'Complete 25 exams', exams, 25),
    make('high-scorer', 'scores', 'High scorer', 'Score 80% or higher', best, 80),
    make('top-marks', 'scores', 'Top marks', 'Score 90% or higher', best, 90),
    make('perfect', 'scores', 'Flawless', 'Score 100% on an exam', best, 100),
    make('consistent', 'consistency', 'Consistent', 'Average 70% across 3+ exams', exams >= 3 ? avg : 0, 70),
    make('rising-star', 'consistency', 'Rising star', 'Average 80% across 5+ exams', exams >= 5 ? avg : 0, 80),
    make('explorer', 'explore', 'Explorer', 'Practice 3 different subjects', subjects, 3),
    make('all-rounder', 'explore', 'All-rounder', 'Practice 5 different subjects', subjects, 5),
  ];
}
