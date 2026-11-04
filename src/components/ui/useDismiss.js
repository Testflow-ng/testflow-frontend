import { useEffect } from 'react';

/** Closes a floating layer on outside press or Escape, and returns focus to the trigger. */
export function useDismiss({ open, onClose, containerRef, triggerRef }) {
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!containerRef.current?.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        triggerRef?.current?.focus?.();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, containerRef, triggerRef]);
}
