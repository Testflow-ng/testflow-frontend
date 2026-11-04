import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s) => (s ? new Date(`${s}T00:00:00`) : null);
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Month calendar. `mode="single"`: value is "YYYY-MM-DD". `mode="range"`: value is { start, end }.
 * `min`/`max` are "YYYY-MM-DD" limits. Arrow keys move by day/week, PageUp/PageDown by month,
 * Enter selects. Used by DatePicker and DateRangePicker.
 */
function Calendar({ mode = 'single', value, onChange, min, max, className }) {
  const anchor = mode === 'range' ? parse(value?.start) : parse(value);
  const [view, setView] = useState(() => {
    const d = anchor ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [focus, setFocus] = useState(() => iso(anchor ?? new Date()));
  const refs = useRef({});
  const today = iso(new Date());
  const lo = min ?? '0000-01-01';
  const hi = max ?? '9999-12-31';

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7;
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => iso(new Date(view.getFullYear(), view.getMonth(), i + 1)))];
  }, [view]);

  const pick = (day) => {
    if (day < lo || day > hi) return;
    if (mode === 'single') return onChange(day);
    const { start, end } = value ?? {};
    if (!start || end) onChange({ start: day, end: null });
    else onChange(day < start ? { start: day, end: start } : { start, end: day });
  };

  const move = (days) => {
    const d = parse(focus);
    d.setDate(d.getDate() + days);
    const next = iso(d);
    setFocus(next);
    setView(new Date(d.getFullYear(), d.getMonth(), 1));
    requestAnimationFrame(() => refs.current[next]?.focus());
  };

  const onKeyDown = (e) => {
    const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (map[e.key]) (e.preventDefault(), move(map[e.key]));
    else if (e.key === 'PageDown') (e.preventDefault(), setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1)));
    else if (e.key === 'PageUp') (e.preventDefault(), setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1)));
  };

  const inRange = (d) => mode === 'range' && value?.start && value?.end && d > value.start && d < value.end;
  const isEdge = (d) => (mode === 'range' ? d === value?.start || d === value?.end : d === value);

  return (
    <div className={cn('w-72 select-none', className)}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))} className="flex size-9 items-center justify-center rounded-full hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <p aria-live="polite" className="font-heading text-[15px] font-bold text-foreground-strong">{view.toLocaleString('en', { month: 'long', year: 'numeric' })}</p>
        <button type="button" aria-label="Next month" onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))} className="flex size-9 items-center justify-center rounded-full hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div role="grid" aria-label="Calendar" onKeyDown={onKeyDown}>
        <div role="row" className="grid grid-cols-7 text-center text-[11px] font-bold uppercase text-muted">
          {DAYS.map((d) => <span key={d} role="columnheader" className="py-1">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((d, i) => {
            if (!d) return <span key={`b${i}`} />;
            const disabled = d < lo || d > hi;
            const edge = isEdge(d);
            return (
              <button
                key={d}
                ref={(n) => (refs.current[d] = n)}
                type="button"
                role="gridcell"
                tabIndex={d === focus ? 0 : -1}
                aria-selected={edge || inRange(d) || undefined}
                aria-current={d === today ? 'date' : undefined}
                aria-label={parse(d).toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                disabled={disabled}
                onClick={() => (setFocus(d), pick(d))}
                className={cn(
                  'flex h-9 items-center justify-center text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30',
                  edge ? 'rounded-full bg-primary font-bold text-primary-foreground' : inRange(d) ? 'bg-[var(--brand-lavender)] text-primary' : 'rounded-full text-foreground-strong hover:bg-surface-strong',
                  d === today && !edge && 'font-bold text-primary',
                )}
              >
                {Number(d.slice(8))}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
