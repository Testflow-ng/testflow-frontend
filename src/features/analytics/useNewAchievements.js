import { useCallback, useMemo, useState } from 'react';
import { deriveAchievements } from './achievements.js';

const STORAGE_KEY = 'tf_seen_achievements';

/** Keys already celebrated on this device. Unreadable storage means "none". */
const readSeen = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    // A corrupt or unavailable store must never block the screen behind it.
    return new Set();
  }
};

/**
 * Badges earned since the user last acknowledged one.
 *
 * Achievements are derived from stats rather than stored as events, so there
 * is no server-side "unseen" flag. This keeps a local set of celebrated keys
 * and diffs against it.
 *
 * No effects. The seen set is read once into state via a lazy initialiser, and
 * `fresh` is derived from it during render. An earlier version mirrored the
 * result into state inside an effect and re-read storage during render to
 * invalidate — that renders once without the celebration and again with it,
 * which is exactly the flash this is meant to avoid.
 *
 * Nothing is marked seen until `acknowledge` runs, so a badge earned while the
 * app was backgrounded still gets its moment on return.
 *
 * On a device with no history every currently-earned badge counts as new. For
 * a real new user that is correct: their first badge should celebrate. For an
 * existing user on a new phone it is a one-time recap, which is a reasonable
 * thing to show and cheaper than syncing seen-state to the server.
 */
export function useNewAchievements(stats) {
  const [seen, setSeen] = useState(readSeen);

  const fresh = useMemo(
    () => (stats ? deriveAchievements(stats).filter((a) => a.earned && !seen.has(a.key)) : []),
    [stats, seen],
  );

  const acknowledge = useCallback(() => {
    const next = new Set(seen);
    fresh.forEach((a) => next.add(a.key));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Storage full or blocked: the badge simply celebrates again next time,
      // which is a far better failure than throwing on a celebration.
    }
    setSeen(next);
  }, [fresh, seen]);

  return { fresh, acknowledge };
}
