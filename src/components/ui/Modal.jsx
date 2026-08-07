import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { cn } from '../../utils/cn.js';
import { useIsMobile } from '../../hooks/useMediaQuery.js';

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/*
  Curves mirror the CSS tokens in global.css. The sheet uses the iOS drawer
  curve; the centred dialog uses the strong ease-out. Nothing uses ease-in.
  Percentage translate, so the sheet always travels exactly its own height
  regardless of content.
*/
const EASE_DRAWER = [0.32, 0.72, 0, 1];
const EASE_OUT = [0.23, 1, 0.32, 1];

const sheetMotion = {
  initial: { transform: 'translateY(100%)' },
  animate: { transform: 'translateY(0%)' },
  exit: { transform: 'translateY(100%)' },
  transition: { duration: 0.34, ease: EASE_DRAWER },
};

const dialogMotion = {
  initial: { opacity: 0, transform: 'scale(0.97)' },
  animate: { opacity: 1, transform: 'scale(1)' },
  exit: { opacity: 0, transform: 'scale(0.97)' },
  transition: { duration: 0.18, ease: EASE_OUT },
};

/**
 * Accessible dialog: focus is moved in on open and trapped, Escape closes (when
 * dismissible), body scroll is locked, and focus returns to the trigger on
 * close.
 *
 * Mobile presentation is a true bottom sheet — it slides up, carries a grab
 * handle, and can be flicked down to dismiss. Drag is bound to the handle and
 * header via `useDragControls` rather than the whole panel, so a swipe inside a
 * long body scrolls the body instead of dragging the sheet away. From `sm` up
 * it stays the centred dialog the desktop layout already used.
 */
function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = 'md',
  dismissible = true,
  children,
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();
  const descId = useId();
  const isMobile = useIsMobile();
  const dragControls = useDragControls();

  /*
    Keep the latest `onOpenChange` in a ref so the effect below does not have to
    depend on it.

    This fixes a real typing bug. Callers pass an inline arrow
    (`onOpenChange={() => {}}`, `onOpenChange={(next) => ...}`), which is a new
    function identity on every render. With `onOpenChange` in the dependency
    array, every keystroke inside the dialog re-ran the whole effect: it tore
    down, re-ran, and called `focusables[0].focus()` again, moving focus off the
    field being typed in and onto the first focusable element in the dialog. The
    symptom was having to click back into the input after every single character.

    Focus-on-open must happen when the dialog *opens*, not whenever a parent
    re-renders, so `open` and `dismissible` are the only real dependencies.
  */
  const onOpenChangeRef = useRef(onOpenChange);
  useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll(FOCUSABLE);
    (focusables?.length ? focusables[0] : panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && dismissible) {
        onOpenChangeRef.current(false);
        return;
      }
      if (event.key === 'Tab' && panel) {
        const items = panel.querySelectorAll(FOCUSABLE);
        if (!items.length) {
          event.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
    // Deliberately not depending on `onOpenChange`: see the ref above.
  }, [open, dismissible]);

  const startDrag = (event) => {
    if (isMobile && dismissible) dragControls.start(event);
  };

  // A flick should be enough on its own: requiring the sheet to cross a
  // distance threshold makes dismissal feel heavy. 110px/s is the point at
  // which a gesture reads as a deliberate throw rather than a drag.
  const handleDragEnd = (_event, info) => {
    if (info.velocity.y > 110 || info.offset.y > 120) onOpenChange(false);
  };

  const dragProps =
    isMobile && dismissible
      ? {
          drag: 'y',
          dragControls,
          dragListener: false,
          dragConstraints: { top: 0, bottom: 0 },
          dragElastic: { top: 0, bottom: 0.6 },
          onDragEnd: handleDragEnd,
        }
      : {};

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={() => dismissible && onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'linear' }}
            className="absolute inset-0 cursor-default bg-foreground/50"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            {...(isMobile ? sheetMotion : dialogMotion)}
            {...dragProps}
            className={cn(
              'relative z-10 flex w-full flex-col border border-border bg-surface focus:outline-none',
              // Never taller than the viewport; the body scrolls inside.
              'max-h-[88svh] rounded-t-[1.75rem]',
              'sm:max-h-[85svh] sm:rounded-2xl sm:shadow-xl',
              sizes[size],
            )}
          >
            {/* Grab handle: the affordance that says "this can be flicked away". */}
            {isMobile && dismissible ? (
              <div
                onPointerDown={startDrag}
                className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing"
                aria-hidden="true"
              >
                <span className="h-1 w-9 rounded-full bg-border-strong" />
              </div>
            ) : null}

            {title || description ? (
              <div
                onPointerDown={startDrag}
                className={cn(
                  'shrink-0 touch-none px-5 pb-3 sm:px-6 sm:pt-6',
                  isMobile && dismissible ? 'pt-2' : 'pt-5',
                )}
              >
                {title ? (
                  <h2
                    id={titleId}
                    className="font-heading text-lg font-bold leading-snug tracking-tight text-foreground-strong"
                  >
                    {title}
                  </h2>
                ) : null}
                {description ? (
                  <p id={descId} className="mt-1 text-sm leading-snug text-muted">
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* Only this region scrolls, so the title and actions stay put. */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-1 sm:px-6">
              {children}
            </div>

            {/*
              Actions sit above the home indicator and stack full-width on
              phones — a 44px-tall edge-to-edge button is far easier to hit
              than a right-aligned pair.
            */}
            {footer ? (
              <div className="shrink-0 border-t border-border px-5 pb-[calc(1rem+var(--safe-bottom))] pt-4 sm:px-6 sm:pb-5">
                <div className="flex flex-col-reverse gap-2 [&>*]:w-full sm:flex-row sm:justify-end sm:[&>*]:w-auto">
                  {footer}
                </div>
              </div>
            ) : (
              <div className="shrink-0 pb-[calc(1.25rem+var(--safe-bottom))] sm:pb-6" />
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export default Modal;
