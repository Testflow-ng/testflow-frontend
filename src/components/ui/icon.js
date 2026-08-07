/**
 * Icon scale.
 *
 * An audit of the codebase found 18 distinct `size={...}` values in use
 * (10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 28, 30, 32, 44, 48, 64) and
 * five different stroke widths. Nothing chose those numbers; they accumulated.
 * The visible cost is that the same chevron is a different weight on three
 * screens, and icons sitting beside identical text do not share an optical
 * size.
 *
 * Five steps, each tied to the text it sits beside rather than to a guess:
 *
 *   xs  14  alongside 12-13px meta text (timestamps, counts, chips)
 *   sm  16  alongside 13-15px body text; row chevrons and inline affordances
 *   md  18  the default UI icon: buttons, list-row marks, section headings
 *   lg  22  navigation and feature marks, where the icon is the label
 *   xl  28  empty states, where the icon is the only graphic on screen
 *
 * Stroke stays at lucide's default 2 everywhere except the active tab, which
 * thickens to mark selection. A 1.5 stroke at 16px renders sub-pixel on a
 * 1x Android screen and reads as a smudge, which is why the thin values are
 * gone.
 */
export const ICON = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
};

/** Stroke weights. Selection is the only state that changes weight. */
export const STROKE = {
  default: 2,
  selected: 2.4,
};

export default ICON;
