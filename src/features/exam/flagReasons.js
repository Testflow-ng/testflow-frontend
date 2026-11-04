/**
 * Why a question gets reported.
 *
 * A fixed list, not free text, because these reports are triaged: the admin queue sorts by
 * reason, and "the answer key is wrong" is a different job from "there is a typo". The one
 * open-ended case is `other`, which is why it carries the note.
 *
 * Ids are the contract .the labels below are ours to reword, the ids are what the backend
 * stores and what the admin queue groups on.
 */
export const FLAG_REASONS = [
  {
    id: 'wrong_answer',
    label: 'The correct answer is wrong',
    hint: 'The answer marked as correct is not the right one',
  },
  {
    id: 'typo',
    label: 'Typo or broken formatting',
    hint: 'Spelling, symbols, or a formula that did not render',
  },
  {
    id: 'out_of_syllabus',
    label: 'Not in the syllabus',
    hint: 'This topic is outside the course outline',
  },
  {
    id: 'duplicate',
    label: 'I have seen this already',
    hint: 'The same question appears twice in the paper',
  },
  {
    id: 'other',
    label: 'Something else',
    hint: 'Tell us in the note below',
  },
];

export const FALLBACK_REASON = FLAG_REASONS[FLAG_REASONS.length - 1];

/** The reason object for an id, falling back to `other` for anything the backend adds later. */
export const flagReason = (id) =>
  FLAG_REASONS.find((reason) => reason.id === id) ?? FALLBACK_REASON;

export const flagReasonLabel = (id) => flagReason(id).label;
