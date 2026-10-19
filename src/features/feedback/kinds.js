/**
 * What a student's feedback is about.
 *
 * Three kinds rather than one box, because the three are different jobs: a broken screen is
 * something to reproduce and fix, an idea goes on a list, and the rest is read and answered.
 * `short` is the label in the segmented control, `label` is what the admin queue and the
 * student's own list call it.
 *
 * Ids are the contract .the backend stores these, the labels are ours to reword.
 */
export const FEEDBACK_KINDS = [
  {
    id: 'problem',
    label: 'Something is broken',
    short: 'Problem',
    hint: 'A screen that failed, a score that looks wrong, anything that stopped you',
    variant: 'danger',
  },
  {
    id: 'idea',
    label: 'An idea',
    short: 'Idea',
    hint: 'Something TestFlow should do, or do differently',
    variant: 'lavender',
  },
  {
    id: 'other',
    label: 'Something else',
    short: 'Other',
    hint: 'Anything that does not fit the two above',
    variant: 'outline',
  },
];

export const FALLBACK_KIND = FEEDBACK_KINDS[FEEDBACK_KINDS.length - 1];

/** The kind object for an id, falling back to `other` for anything the backend adds later. */
export const feedbackKind = (id) =>
  FEEDBACK_KINDS.find((kind) => kind.id === id) ?? FALLBACK_KIND;

export const feedbackKindLabel = (id) => feedbackKind(id).label;

/** The words behind the stars, so a 4 means the same thing to the student and to the admin. */
export const RATING_LABELS = {
  1: 'Very poor',
  2: 'Poor',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent',
};

export const ratingLabel = (value) => RATING_LABELS[value] ?? '';

/** An entry moves through these; `resolved` is the only one that means "done". */
export const FEEDBACK_STATUSES = ['open', 'in_review', 'resolved'];
