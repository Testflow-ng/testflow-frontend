import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn.js';

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: focus is moved in on open and trapped, Escape closes (when
 * dismissible), body scroll is locked, and focus returns to the trigger on
 * close. Mobile-first: docks to the bottom as a sheet, centers on >=sm.
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
        onOpenChange(false);
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
  }, [open, dismissible, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={() => dismissible && onOpenChange(false)}
        className="absolute inset-0 cursor-default bg-foreground/50 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full rounded-t-lg border border-border bg-surface p-6 shadow-xl focus:outline-none sm:rounded-lg',
          sizes[size],
        )}
      >
        {title ? (
          <h2 id={titleId} className="font-heading text-lg text-foreground-strong">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p id={descId} className="mt-1 text-sm text-muted">
            {description}
          </p>
        ) : null}
        <div className={title || description ? 'mt-4' : undefined}>{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
