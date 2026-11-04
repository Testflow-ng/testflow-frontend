/*
  Book cover palette.

  A book cover is artwork, so these are real colour values rather than semantic
  tokens .the same exception `useBrandColors.js` makes for charts. Each cover
  needs three stops (a light top-left, the base, a dark spine/bottom) to read as
  a physical object lit from one side, and no token set carries that.

  `ink` is the brand ink green; the other six are the shelf: red, blue, green,
  amber, violet and teal. Keep it at seven so a shelf stays calm.
*/

/** cover .base tone, light .top-left highlight, dark .spine and lower edge. */
export const BOOK_COLORS = {
  red: { cover: '#b02a20', light: '#cf4034', dark: '#7f1a12' },
  blue: { cover: '#1f4fa8', light: '#2f66c7', dark: '#153a7c' },
  ink: { cover: '#1b4332', light: '#2a5c46', dark: '#112d21' },
  green: { cover: '#1f7a4d', light: '#2d9a63', dark: '#14542f' },
  amber: { cover: '#c07816', light: '#dd9527', dark: '#8f560c' },
  violet: { cover: '#5b3fd6', light: '#7459e8', dark: '#4229a8' },
  teal: { cover: '#0f7080', light: '#1b8e9e', dark: '#0a4f5c' },
};

export const BOOK_COLOR_NAMES = Object.keys(BOOK_COLORS);

/** Foil for the code and rules printed on the cover. */
export const BOOK_COVER_TEXT = '#f8f4ea';

/** The cut edge of the paper block. */
export const BOOK_PAGE_EDGE = '#efeadd';
