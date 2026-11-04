import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { useDismiss } from './useDismiss.js';

/**
 * Pick several options. `options` is [{ value, label }]; `value` is an array of values; `onValueChange(array)`.
 * Searchable by default. Selected items show as removable chips. Arrow keys move, Enter toggles, Escape closes.
 */
function MultiSelect({ options, value = [], onValueChange, placeholder = 'Select', searchable = true, label, id, className }) {
  const gen = useId();
  const fieldId = id ?? gen;
  const listId = `${fieldId}-list`;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const input = useRef(null);
  const close = useCallback(() => (setOpen(false), setQ('')), []);
  useDismiss({ open, onClose: close, containerRef: ref, triggerRef: input });

  const shown = useMemo(() => options.filter((o) => String(o.label).toLowerCase().includes(q.trim().toLowerCase())), [options, q]);
  const toggle = (v) => onValueChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const labelOf = (v) => options.find((o) => o.value === v)?.label ?? v;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setOpen(true), setActive((i) => Math.min(i + 1, shown.length - 1)));
    else if (e.key === 'ArrowUp') (e.preventDefault(), setActive((i) => Math.max(i - 1, 0)));
    else if (e.key === 'Enter' && open && shown[active]) (e.preventDefault(), toggle(shown[active].value));
    else if (e.key === 'Backspace' && !q && value.length) onValueChange(value.slice(0, -1));
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-foreground-strong">{label}</label>}
      <div onClick={() => (setOpen(true), input.current?.focus())} className={cn('relative flex min-h-12 cursor-text flex-wrap items-center gap-1.5 rounded-[24px] border border-border-strong bg-surface py-1.5 pl-3 pr-10', open && 'border-primary ring-4 ring-primary/15')}>
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-lavender)] py-1 pl-3 pr-1.5 text-sm font-medium text-primary">
            {labelOf(v)}
            <button type="button" aria-label={`Remove ${labelOf(v)}`} onClick={(e) => (e.stopPropagation(), toggle(v))} className="flex size-5 items-center justify-center rounded-full hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          ref={input}
          id={fieldId}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && shown[active] ? `${listId}-${active}` : undefined}
          value={q}
          readOnly={!searchable}
          onChange={(e) => (setQ(e.target.value), setActive(0), setOpen(true))}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? '' : placeholder}
          className="h-9 w-0 min-w-[6rem] flex-1 text-base outline-none placeholder:text-muted sm:text-sm"
          style={{ border: 0, padding: '0 0.25rem', background: 'transparent', minHeight: 0 }}
        />
        <ChevronDown size={18} aria-hidden="true" className={cn('pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-transform', open && 'rotate-180')} />
      </div>
      {open && (
        <ul id={listId} role="listbox" aria-multiselectable="true" className="absolute left-0 top-full z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-[20px] border border-border bg-surface p-1.5 shadow-[0_12px_40px_-12px_rgba(27,67,50,0.25)]">
          {shown.length === 0 && <li className="px-3 py-3 text-sm text-muted">No matches</li>}
          {shown.map((o, i) => {
            const on = value.includes(o.value);
            return (
              <li key={o.value} id={`${listId}-${i}`} role="option" aria-selected={on} onMouseDown={(e) => e.preventDefault()} onClick={() => toggle(o.value)} onMouseEnter={() => setActive(i)} className={cn('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-foreground-strong', i === active && 'bg-surface-strong')}>
                <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong')}>{on && <Check size={13} strokeWidth={3} aria-hidden="true" />}</span>
                <span className="truncate">{o.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MultiSelect;
