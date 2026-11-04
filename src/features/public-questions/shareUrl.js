/**
 * The public link for a single question.
 *
 * Same shape the admin question bank and the public question page already use: the backend
 * serves this path as an HTML page carrying the Open Graph tags, so pasting it into WhatsApp
 * or Telegram renders the question as a card. It is deliberately *not* a client route .a
 * social crawler will not run our JavaScript, so the page and its preview image have to come
 * off the server.
 */
export const questionShareUrl = (questionId) =>
  `${window.location.origin}/api/public/questions/${questionId}/share`;

/** The caption that travels with a shared question. */
export const questionShareCaption = (question) =>
  question?.subjectCode
    ? `See if you can answer this ${question.subjectCode} question.`
    : 'See if you can answer this one.';
