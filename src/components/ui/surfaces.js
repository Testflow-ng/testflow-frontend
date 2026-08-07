import { cn } from '../../utils/cn.js';

/**
 * Class recipes for the two surfaces this app is built out of: the card and
 * the tappable list row. Same single-source-of-truth pattern as
 * `buttonClasses` — markup that can't render a `<Card>` (a router `Link`, a
 * `<button>`, an `<li>`) still gets identical styling.
 *
 * The important mobile detail is `interactive`: the codebase previously
 * expressed affordance with `hover:` alone, which never fires on a touch
 * device, so nothing on a phone reacted to being pressed. `tf-pressable` adds
 * the :active scale, and hover styling is gated behind a fine pointer so it
 * doesn't stick after a tap on mobile Safari.
 */

const paddings = {
  none: '',
  sm: 'p-3.5',
  md: 'p-4',
  lg: 'p-5',
};

const surfaceBase = 'rounded-2xl border border-border bg-surface';

const interactiveClasses =
  'tf-pressable cursor-pointer active:bg-surface-strong ' +
  '[@media(hover:hover)]:hover:bg-surface-strong [@media(hover:hover)]:hover:border-border-strong ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function cardClasses({ padding = 'md', interactive = false, className } = {}) {
  return cn(surfaceBase, paddings[padding] ?? paddings.md, interactive && interactiveClasses, className);
}

/**
 * Icon + label/meta + trailing accessory row. `min-h-14` (56px) guarantees the
 * whole row is a comfortable target even when its text wraps to one line.
 */
export function listRowClasses({ interactive = true, className } = {}) {
  return cn(
    surfaceBase,
    'flex min-h-14 w-full items-center gap-3 p-3.5 text-left',
    interactive && interactiveClasses,
    className,
  );
}

/**
 * Rows inside a grouped, divided list (Settings, Profile > Account). Full-bleed
 * horizontal padding, 52px minimum height — the iOS grouped-table proportions.
 */
export function groupRowClasses({ interactive = true, className } = {}) {
  return cn(
    'flex min-h-[3.25rem] w-full items-center justify-between gap-3 px-4 py-3 text-left',
    interactive &&
      'tf-pressable active:bg-surface-strong [@media(hover:hover)]:hover:bg-surface-strong',
    className,
  );
}

/** Container for a grouped list: one border, hairline dividers between rows. */
export function groupListClasses({ className } = {}) {
  return cn('overflow-hidden divide-y divide-border', surfaceBase, className);
}

/**
 * The sheet.
 *
 * TestFlow's core object is an exam paper, so the interface is built out of
 * that furniture: one ruled sheet carrying many facts, rather than a field of
 * separately-bordered cards. One border and one silhouette per group means the
 * eye lands on the content, not on twelve repeated rectangles.
 *
 * Radius is deliberately larger than a card (20px vs 16px) — the sheet is the
 * page's primary object and reads as one plane, while its internal rows carry
 * no radius at all. Radius varies by role here, it is not one global value.
 */
export function sheetClasses({ className } = {}) {
  return cn(
    'overflow-hidden rounded-[1.25rem] border border-border bg-surface divide-y divide-border',
    className,
  );
}

/**
 * A ruled row on the sheet: label on the left, figure on the right, optional
 * trailing accessory. 56px minimum so a row is a comfortable target even
 * when it is not itself tappable.
 */
export function sheetRowClasses({ interactive = false, className } = {}) {
  return cn(
    'flex min-h-14 w-full items-center gap-3 px-4 text-left',
    interactive &&
      'tf-pressable active:bg-surface-strong [@media(hover:hover)]:hover:bg-surface-strong',
    className,
  );
}
