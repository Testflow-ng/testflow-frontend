/** Derive the achievement list (earned/locked) from a student's stats. */
export function deriveAchievements(stats) {
  return [
    {
      key: 'first-exam',
      label: 'First step',
      description: 'Complete your first exam',
      earned: stats.totalExams >= 1,
    },
    {
      key: 'five-exams',
      label: 'Warming up',
      description: 'Complete 5 exams',
      earned: stats.totalExams >= 5,
    },
    {
      key: 'high-scorer',
      label: 'High scorer',
      description: 'Score 80% or higher',
      earned: stats.bestScore >= 80,
    },
    {
      key: 'perfect',
      label: 'Flawless',
      description: 'Score 100% on an exam',
      earned: stats.bestScore >= 100,
    },
    {
      key: 'consistent',
      label: 'Consistent',
      description: 'Average 70% across 3+ exams',
      earned: stats.totalExams >= 3 && stats.averageScore >= 70,
    },
    {
      key: 'explorer',
      label: 'Explorer',
      description: 'Practice 3 different subjects',
      earned: stats.perSubject.length >= 3,
    },
  ];
}
