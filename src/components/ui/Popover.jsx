import { useCallback, useId, useRef, useState } from 'react';
import { cn } from '../../utils/cn.js';
import { useDismiss } from './useDismiss.js';

const placements = {
  'bottom-start': 'top-full left-0 mt-2',
  'bottom-end': 'top-full right-0 mt-2',
  'top-start': 'bottom-full left-0 mb-2',
  'top-end': 'bottom-full right-0 mb-2',
};

/**
 * Click-to-open floating panel. `trigger` receives props to spread on your button:
 * `<Popover trigger={(p) => <Button {...p}>Filters</Button>}>...</Popover>`.
 */
function Popover({ trigger, children, placement = 'bottom-start', className, panelClassName }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss({ open, onClose: close, containerRef, triggerRef });

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {trigger({
        ref: triggerRef,
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': open ? panelId : undefined,
        onClick: () => setOpen((v) => !v),
      })}
      {open && (
        <div
          id={panelId}
          role="dialog"
          className={cn(
            'absolute z-50 min-w-56 rounded-[20px] border border-border bg-surface p-4 shadow-[0_12px_40px_-12px_rgba(27,67,50,0.25)]',
            placements[placement] ?? placements['bottom-start'],
            panelClassName,
          )}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}

export default Popover;
