/**
 * What Flo is feeling, and why.
 *
 * The mascot is only a companion if its expression is *earned* by something
 * true about the user's situation. A character that grins at a failed paper is
 * worse than no character at all: it tells the student the app is not paying
 * attention. So every mood here is derived from real state, and the mapping
 * lives in one file rather than being guessed at each call site.
 *
 * Each entry returns `{ mood, animation, line }`:
 *   mood      — the expression (see Mascot.jsx)
 *   animation — the motion class, chosen for the frequency of the surface
 *   line      — a short piece of copy in Flo's voice, or null where the screen
 *               already says enough and a second voice would be clutter
 */

/* Score bands match utils/score.js so the mascot never disagrees with the
   number printed next to it. */
const PASS = 70;
const BORDERLINE = 50;
const STRONG = 85;

/** Days of silence before the mascot starts looking bored, then falls asleep. */
const BORED_AFTER_DAYS = 3;
const ASLEEP_AFTER_DAYS = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Reaction to a single finished paper. This is the emotional peak of the app,
 * so it gets the biggest performances.
 */
export function moodForScore(score) {
  if (score >= STRONG) {
    return {
      mood: 'excited',
      animation: 'celebrate',
      confetti: true,
      line: 'Outstanding. You have this one.',
    };
  }
  if (score >= PASS) {
    return {
      mood: 'thumbsUp',
      animation: 'jump',
      confetti: true,
      line: 'Solid pass. Keep that up.',
    };
  }
  if (score >= BORDERLINE) {
    return {
      mood: 'encouraging',
      animation: 'wave',
      confetti: false,
      line: 'Nearly there. One more run at it.',
    };
  }
  return {
    mood: 'sad',
    animation: 'slump',
    confetti: false,
    // Names the next action rather than the failure. Nobody needs to be told
    // they did badly by a cartoon; they need to know what to do about it.
    line: 'That one was rough. Try it again while it is fresh.',
  };
}

/**
 * Resting state on the dashboard, from overall readiness and recency.
 *
 * Inactivity is checked first: someone returning after two weeks should be
 * greeted by a mascot that noticed, not by a verdict on a score from a
 * fortnight ago.
 */
export function moodForDashboard({ hasData, score, lastActiveAt, streakCount = 0 } = {}) {
  const daysIdle = lastActiveAt ? (Date.now() - new Date(lastActiveAt).getTime()) / DAY_MS : null;

  if (daysIdle !== null && daysIdle >= ASLEEP_AFTER_DAYS) {
    return { mood: 'sleeping', animation: 'breathe', line: 'Long time. Ready when you are.' };
  }
  if (daysIdle !== null && daysIdle >= BORED_AFTER_DAYS) {
    return { mood: 'thinking', animation: 'lookAround', line: 'Been a few days. Fancy a quick one?' };
  }

  if (!hasData) {
    return { mood: 'happy', animation: 'float', line: null };
  }

  if (score >= STRONG) {
    return { mood: 'confident', animation: 'float', line: null };
  }
  if (score >= PASS) {
    return { mood: 'happy', animation: 'float', line: null };
  }
  if (score >= BORDERLINE) {
    return { mood: 'encouraging', animation: 'float', line: null };
  }
  // Low overall, but a live streak means they are already doing the work.
  if (streakCount > 0) {
    return { mood: 'encouraging', animation: 'float', line: null };
  }
  return { mood: 'thinking', animation: 'float', line: null };
}

/** Fixed moods for moments that are not about performance. */
export const MOMENTS = {
  boot: { mood: 'happy', animation: 'walkIn' },
  loading: { mood: 'neutral', animation: 'runIn' },
  examStarting: { mood: 'confident', animation: 'bounce' },
  submitting: { mood: 'surprised', animation: 'bounce' },
  offline: { mood: 'thinking', animation: 'lookAround' },
  error: { mood: 'surprised', animation: 'slideIn' },
  emptyHistory: { mood: 'thinking', animation: 'float' },
  emptyCourses: { mood: 'encouraging', animation: 'float' },
  achievement: { mood: 'applauding', animation: 'bounce' },
};

/**
 * Most recent activity across sessions, for the inactivity check. Uses the
 * newest timestamp of any kind (started or submitted) so someone who opened a
 * paper yesterday but never finished it does not read as absent.
 */
export function lastActivityFrom(sessions = []) {
  const stamps = sessions
    .flatMap((s) => [s.submittedAt, s.startedAt, s.createdAt])
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter((n) => Number.isFinite(n));

  return stamps.length ? new Date(Math.max(...stamps)).toISOString() : null;
}
