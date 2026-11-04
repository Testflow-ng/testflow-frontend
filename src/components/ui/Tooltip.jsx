import { cloneElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../utils/cn.js';

const positions = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
};

/**
 * Short hint on hover or keyboard focus. Wrap a single focusable element. The tooltip
 * describes the control (aria-describedby); it never replaces an accessible name.
 */
function Tooltip({ label, side = 'top', delay = 250, children, className }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const id = useId();
  const show = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  }, [delay]);
  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setOpen(false);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => e.key === 'Escape' && hide()}
    >
      {cloneElement(children, { 'aria-describedby': open ? id : undefined })}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 w-max max-w-60 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-medium leading-4 text-secondary-foreground shadow-lg',
            positions[side] ?? positions.top,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}

export default Tooltip;
