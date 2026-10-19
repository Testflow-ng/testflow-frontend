import { useCallback, useId, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Calendar from './Calendar.jsx';
import { useDismiss } from './useDismiss.js';
import { cn } from '../../utils/cn.js';

const show = (s) => (s ? new Date(`${s}T00:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function Shell({ id, label, display, placeholder, error, children, onClose, open, setOpen, className, ...aria }) {
  const ref = useRef(null);
  const trigger = useRef(null);
  const panel = useId();
  useDismiss({ open, onClose, containerRef: ref, triggerRef: trigger });
  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground-strong">{label}</label>}
      <button ref={trigger} id={id} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? panel : undefined} aria-invalid={error ? true : undefined} onClick={() => setOpen(!open)} className={cn('flex h-12 w-full items-center justify-between gap-3 rounded-full border border-border-strong bg-surface pl-5 pr-4 text-left text-base sm:h-11 sm:text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 aria-invalid:border-danger', display ? 'text-foreground-strong' : 'text-muted')} {...aria}>
        <span className="truncate">{display || placeholder}</span>
        <CalendarDays size={18} strokeWidth={1.6} aria-hidden="true" className="shrink-0 text-muted" />
      </button>
      {open && (
        <div id={panel} role="dialog" aria-label={label ?? 'Choose date'} className="absolute left-0 top-full z-50 mt-2 rounded-[20px] border border-border bg-surface p-3 shadow-[0_12px_40px_-12px_rgba(27,67,50,0.25)]">
          {children}
        </div>
      )}
      {error && <p role="alert" className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

/** Single date. `value` / `onChange` use "YYYY-MM-DD". */
export function DatePicker({ value, onChange, label, min, max, placeholder = 'Pick a date', error, className, id }) {
  const gen = useId();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <Shell id={id ?? gen} label={label} display={show(value)} placeholder={placeholder} error={error} open={open} setOpen={setOpen} onClose={close} className={className}>
      <Calendar value={value} min={min} max={max} onChange={(d) => (onChange(d), close())} />
    </Shell>
  );
}

/** Date range. `value` is { start, end } ("YYYY-MM-DD"); closes after the second pick. Includes quick presets. */
export function DateRangePicker({ value = {}, onChange, label, min, max, placeholder = 'Pick a range', presets = true, error, className, id }) {
  const gen = useId();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const todayD = new Date();
  const ago = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };
  const f = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const display = value.start ? `${show(value.start)}${value.end ? ` – ${show(value.end)}` : ' – …'}` : '';
  return (
    <Shell id={id ?? gen} label={label} display={display} placeholder={placeholder} error={error} open={open} setOpen={setOpen} onClose={close} className={className}>
      {presets && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {[['7 days', 6], ['30 days', 29], ['90 days', 89]].map(([l, n]) => (
            <button key={l} type="button" onClick={() => (onChange({ start: f(ago(n)), end: f(todayD) }), close())} className="rounded-full bg-surface-strong px-3 py-1 text-xs font-semibold text-foreground-strong hover:bg-[var(--brand-lavender)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Last {l}
            </button>
          ))}
        </div>
      )}
      <Calendar mode="range" value={value} min={min} max={max} onChange={(r) => (onChange(r), r.end && close())} />
    </Shell>
  );
}

export default DatePicker;
