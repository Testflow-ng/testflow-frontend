import { useRef } from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Pick-one control for small option sets (e.g. 10 / 20 / 40 questions). A radiogroup:
 * Left/Right (and Up/Down) move and select. `options` is [{ value, label, disabled? }].
 */
function SegmentedControl({ options, value, onValueChange, label, size = 'md', fullWidth = false, className }) {
  const refs = useRef({});
  const onKeyDown = (e) => {
    const i = options.findIndex((o) => o.value === value);
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    // Skip options marked `disabled`.
    let next = i;
    for (let step = 0; step < options.length; step += 1) {
      next = (next + dir + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    if (options[next].disabled) return;
    e.preventDefault();
    onValueChange(options[next].value);
    refs.current[options[next].value]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={cn('inline-flex rounded-full border border-border bg-surface p-1', fullWidth && 'flex w-full', className)}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(n) => (refs.current[o.value] = n)}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={o.disabled || undefined}
            disabled={o.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(o.value)}
            className={cn(
              'inline-flex items-center justify-center rounded-full font-medium transition-colors motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 text-[15px]',
              fullWidth && 'flex-1',
              selected ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground-strong',
              o.disabled && 'cursor-not-allowed opacity-50 hover:text-muted',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
