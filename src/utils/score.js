/**
 * Score colour, in one place.
 *
 * The same three-band function was duplicated in the dashboard, the history
 * list and the result page, with the bands agreeing but the class names
 * drifting (`text-success` in one, `bg-success/10 text-success` in another).
 *
 * These use the AA-safe text roles from global.css rather than the raw brand
 * colours: `text-success` on a white surface is 3.3:1, which fails WCAG AA for
 * anything that is not large text, and score figures are exactly the place
 * where a wrong colour is also a wrong reading.
 */

const PASS = 70;
const BORDERLINE = 50;

/** Text colour for a score figure. */
export function scoreTone(score) {
  if (score >= PASS) return 'text-score-good';
  if (score >= BORDERLINE) return 'text-score-mid';
  return 'text-score-low';
}

/** Tinted pill for a score, where the figure sits on its own background. */
export function scorePill(score) {
  if (score >= PASS) return 'bg-success/10 text-score-good';
  if (score >= BORDERLINE) return 'bg-warning/10 text-score-mid';
  return 'bg-danger/10 text-score-low';
}

/** Fill colour for a progress bar, which is a shape and not text. */
export function scoreFill(score) {
  if (score >= PASS) return 'bg-success';
  if (score >= BORDERLINE) return 'bg-warning';
  return 'bg-danger';
}

/** Plain-language band, so colour is never the only carrier of meaning. */
export function scoreLabel(score) {
  if (score >= PASS) return 'on track';
  if (score >= BORDERLINE) return 'borderline';
  return 'needs work';
}
