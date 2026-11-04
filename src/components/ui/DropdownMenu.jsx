import { useCallback, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { useDismiss } from './useDismiss.js';

const placements = {
  'bottom-start': 'top-full left-0 mt-2',
  'bottom-end': 'top-full right-0 mt-2',
  'top-start': 'bottom-full left-0 mb-2',
  'top-end': 'bottom-full right-0 mb-2',
};

const itemClass = (danger, disabled) =>
  cn(
    'flex w-full items-center justify-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-[15px] outline-none transition-colors',
    'focus-visible:bg-surface-strong hover:bg-surface-strong',
    danger ? 'text-danger hover:bg-danger/10 focus-visible:bg-danger/10' : 'text-foreground-strong',
    disabled && 'pointer-events-none opacity-50',
  );

/**
 * Menu button. `items` is [{ label, icon, onSelect, to, danger, disabled }]; use `{ separator: true }` for a divider.
 * Keyboard: Enter/Space/ArrowDown open, arrows move, Home/End jump, Escape closes.
 */
function DropdownMenu({ trigger, items = [], placement = 'bottom-end', className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss({ open, onClose: close, containerRef, triggerRef });

  const focusItem = (index) => {
    const nodes = menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])') ?? [];
    if (!nodes.length) return;
    nodes[(index + nodes.length) % nodes.length].focus();
  };

  const openAndFocus = (index) => {
    setOpen(true);
    requestAnimationFrame(() => focusItem(index));
  };

  const onTriggerKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openAndFocus(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAndFocus(-1);
    }
  };

  const onMenuKey = (e) => {
    const nodes = [...(menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])') ?? [])];
    const current = nodes.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') (e.preventDefault(), focusItem(current + 1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), focusItem(current - 1));
    else if (e.key === 'Home') (e.preventDefault(), focusItem(0));
    else if (e.key === 'End') (e.preventDefault(), focusItem(-1));
    else if (e.key === 'Tab') close();
  };

  const select = (item) => {
    close();
    triggerRef.current?.focus?.();
    item.onSelect?.();
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {trigger({
        ref: triggerRef,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
        onClick: () => (open ? close() : openAndFocus(0)),
        onKeyDown: onTriggerKey,
      })}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          onKeyDown={onMenuKey}
          className={cn(
            'absolute z-50 min-w-52 rounded-[20px] border border-border bg-surface p-1.5 shadow-[0_12px_40px_-12px_rgba(27,67,50,0.25)]',
            placements[placement] ?? placements['bottom-end'],
          )}
        >
          {items.map((item, i) => {
            const anyIcon = items.some((x) => x.icon);
            if (item.separator) return <div key={`sep-${i}`} role="separator" className="mx-3 my-1.5 h-px bg-border/60" />;
            const Icon = item.icon;
            const content = (
              <>
                {Icon ? <Icon size={17} strokeWidth={1.6} aria-hidden="true" className="shrink-0" /> : anyIcon ? <span aria-hidden="true" className="size-[17px] shrink-0" /> : null}
                <span className="truncate">{item.label}</span>
              </>
            );
            const common = {
              role: 'menuitem',
              tabIndex: -1,
              'aria-disabled': item.disabled || undefined,
              className: itemClass(item.danger, item.disabled),
            };
            return item.to ? (
              <Link key={item.label} to={item.to} onClick={() => select(item)} {...common}>
                {content}
              </Link>
            ) : (
              <button key={item.label} type="button" onClick={() => select(item)} {...common}>
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
