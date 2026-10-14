import { Children, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { useDismiss } from './useDismiss.js';

const sizes = { sm: 'h-11 sm:h-9', md: 'h-12 sm:h-11', lg: 'h-12' };

// Accept either an `options` array or native-style <option> children.
const optionsFromChildren = (children) =>
  Children.toArray(children)
    .filter((c) => isValidElement(c) && c.type === 'option')
    .map((c) => ({ value: String(c.props.value ?? c.props.children), label: c.props.children, disabled: c.props.disabled }));

/**
 * Custom select (a styled listbox, not the browser's picker). Works inside `Field`
 * (id / aria-* land on the trigger). Controlled (`value` + `onValueChange`) or uncontrolled
 * (`defaultValue`). `onChange` also fires with `{ target: { name, value } }` for form libraries,
 * and a hidden input carries `name` for plain forms.
 *
 * Keyboard: Enter/Space/ArrowDown open, arrows move, Home/End jump, typing a letter jumps,
 * Enter selects, Escape closes.
 */
function Select({
  options: optionsProp,
  children,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onChange,
  placeholder = 'Select an option',
  size = 'md',
  disabled = false,
  name,
  id,
  className,
  ...aria
}) {
  const options = useMemo(() => optionsProp ?? optionsFromChildren(children), [optionsProp, children]);
  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [flip, setFlip] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: '', timer: null });
  const listId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss({ open, onClose: close, containerRef, triggerRef });

  const selectedIndex = options.findIndex((o) => String(o.value) === String(value));
  const selected = options[selectedIndex];

  const openList = (index) => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setFlip(window.innerHeight - rect.bottom < 280 && rect.top > window.innerHeight - rect.bottom);
    setActive(index ?? (selectedIndex >= 0 ? selectedIndex : firstEnabled(0, 1)));
    setOpen(true);
  };

  function firstEnabled(from, step) {
    for (let i = 0; i < options.length; i += 1) {
      const idx = (from + i * step + options.length * 2) % options.length;
      if (!options[idx].disabled) return idx;
    }
    return -1;
  }

  const choose = (index) => {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    if (valueProp === undefined) setInner(opt.value);
    onValueChange?.(opt.value);
    onChange?.({ target: { name, value: opt.value } });
    close();
    triggerRef.current?.focus();
  };

  // Keep the active option visible while arrowing through a long list.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onKeyDown = (e) => {
    if (disabled) return;
    const move = (step) => setActive((i) => firstEnabled((i < 0 ? (step > 0 ? -1 : 0) : i) + step, step));
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList(e.key === 'ArrowUp' && selectedIndex < 0 ? firstEnabled(options.length - 1, -1) : undefined);
      }
      return;
    }
    if (e.key === 'ArrowDown') (e.preventDefault(), move(1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), move(-1));
    else if (e.key === 'Home') (e.preventDefault(), setActive(firstEnabled(0, 1)));
    else if (e.key === 'End') (e.preventDefault(), setActive(firstEnabled(options.length - 1, -1)));
    else if (e.key === 'Enter' || e.key === ' ') (e.preventDefault(), choose(active));
    else if (e.key === 'Tab') close();
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      clearTimeout(typed.current.timer);
      typed.current.text += e.key.toLowerCase();
      typed.current.timer = setTimeout(() => (typed.current.text = ''), 600);
      const hit = options.findIndex((o) => !o.disabled && String(o.label).toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-full border border-border-strong bg-surface pl-5 pr-4 text-left text-base sm:text-sm',
          'transition-[border-color,box-shadow] duration-[var(--duration-sm)] motion-reduce:transition-none',
          'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15',
          open && 'border-primary ring-4 ring-primary/15',
          'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15',
          'disabled:cursor-not-allowed disabled:bg-surface-strong disabled:opacity-50',
          selected ? 'text-foreground-strong' : 'text-muted',
          sizes[size],
        )}
        {...aria}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" className={cn('shrink-0 text-muted transition-transform motion-reduce:transition-none', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          className={cn(
            'absolute left-0 z-50 max-h-64 w-full min-w-48 overflow-y-auto rounded-[20px] border border-border bg-surface p-1.5 shadow-[0_12px_40px_-12px_rgba(27,67,50,0.25)]',
            flip ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {options.map((o, i) => {
            const isSelected = i === selectedIndex;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={o.disabled || undefined}
                onMouseEnter={() => !o.disabled && setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] text-foreground-strong',
                  i === active && 'bg-surface-strong',
                  isSelected && 'font-semibold',
                  o.disabled && 'cursor-not-allowed opacity-45',
                )}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check size={16} strokeWidth={2.4} aria-hidden="true" className="shrink-0 text-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Select;
