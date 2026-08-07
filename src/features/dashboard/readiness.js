/**
 * Readiness: the one number the dashboard leads with.
 *
 * The screen exists to answer "am I ready for this paper?", so it has to lead
 * with something that actually answers it. The previous dashboard led with a
 * streak, which measures attendance rather than readiness, and reads 0 for
 * every new user.
 *
 * Two rules this file exists to enforce:
 *
 * 1. **Never show a figure without its sample size.** "68%" alone invites a
 *    student to trust one lucky 5-question attempt. "68% across 12 papers" is
 *    checkable and cannot flatter.
 * 2. **Never show a figure without a comparison.** A number with no trend
 *    cannot be acted on. The trend splits submitted attempts in half by date
 *    and compares the averages, so it says something true about direction.
 */

/** Attempts are compared oldest-to-newest, so normalise the order here. */
const submittedByDate = (sessions = []) =>
  sessions
    .filter((s) => s.status === 'submitted' && typeof s.score === 'number')
    .slice()
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

const mean = (values) =>
  values.length ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) : null;

/**
 * A trend needs enough attempts on both sides of the split to mean anything.
 * Below four, the "trend" would just be noise from a single paper, so we
 * return null and the UI says nothing rather than something untrue.
 */
const MIN_ATTEMPTS_FOR_TREND = 4;

export function deriveReadiness(stats, sessions) {
  const attempts = submittedByDate(sessions);
  const totalPapers = stats?.totalExams ?? attempts.length;

  if (!totalPapers) {
    return { hasData: false, totalPapers: 0 };
  }

  const score = stats?.averageScore ?? mean(attempts.map((a) => a.score)) ?? 0;

  let trend = null;
  if (attempts.length >= MIN_ATTEMPTS_FOR_TREND) {
    const split = Math.floor(attempts.length / 2);
    const earlier = mean(attempts.slice(0, split).map((a) => a.score));
    const recent = mean(attempts.slice(split).map((a) => a.score));
    if (earlier !== null && recent !== null && earlier !== recent) {
      trend = { delta: recent - earlier, comparedWith: split };
    }
  }

  return {
    hasData: true,
    score,
    totalPapers,
    totalCorrect: stats?.totalCorrect ?? null,
    totalAnswered: stats?.totalAnswered ?? null,
    trend,
  };
}

/**
 * Weakest and strongest subject.
 *
 * The weakest subject is the single most useful thing this app can tell a
 * student, and the old dashboard never said it. Subjects with one attempt are
 * excluded from "strongest" only — a lucky first paper should not be
 * celebrated, but a bad one is still worth flagging.
 */
export function deriveSubjectEdges(stats) {
  const perSubject = stats?.perSubject ?? [];
  if (perSubject.length < 2) return { weakest: null, strongest: null };

  const byScore = perSubject.slice().sort((a, b) => a.averageScore - b.averageScore);
  const weakest = byScore[0];
  const strongest = byScore.filter((s) => s.attempts > 1).pop() ?? byScore[byScore.length - 1];

  // With only one subject either side, naming both would print the same row
  // twice. Show the weakest alone in that case.
  if (weakest.subjectCode === strongest.subjectCode) return { weakest, strongest: null };

  // A "strongest" that is barely ahead of the weakest tells the student
  // nothing and just prints a second near-identical row. Below a 10-point
  // spread the subjects are effectively level, so we say nothing instead.
  const MEANINGFUL_SPREAD = 10;
  if (strongest.averageScore - weakest.averageScore < MEANINGFUL_SPREAD) {
    return { weakest, strongest: null };
  }

  return { weakest, strongest };
}
