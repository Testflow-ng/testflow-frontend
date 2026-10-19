import { useRef } from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Tab list (underline-free pill style). Controlled: `value` + `onValueChange`.
 * `items` is [{ value, label, count? }]. Pair each tab with a `TabPanel` using the same `idPrefix`.
 * Keyboard: Left/Right move and select, Home/End jump.
 */
function Tabs({ items, value, onValueChange, idPrefix = 'tabs', label, className }) {
  const refs = useRef({});
  const onKeyDown = (e) => {
    const i = items.findIndex((t) => t.value === value);
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    if (next === null) return;
    e.preventDefault();
    onValueChange(items[next].value);
    refs.current[items[next].value]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-strong p-1', className)}>
      {items.map((t) => {
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            ref={(n) => (refs.current[t.value] = n)}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${t.value}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${t.value}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(t.value)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              selected ? 'bg-surface text-foreground-strong shadow-sm' : 'text-muted hover:text-foreground-strong',
            )}
          >
            {t.label}
            {t.count != null && <span className={cn('rounded-full px-1.5 text-xs', selected ? 'bg-primary/10 text-primary' : 'bg-border text-muted')}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ value, active, idPrefix = 'tabs', children, className }) {
  if (value !== active) return null;
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${value}`} aria-labelledby={`${idPrefix}-tab-${value}`} tabIndex={0} className={cn('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl', className)}>
      {children}
    </div>
  );
}

export default Tabs;
