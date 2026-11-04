import { cn } from '../../utils/cn.js';

/** "12 / 60" under a field. `unit="words"` counts words instead of characters. Turns red past the limit. */
function CharacterCounter({ value = '', max, unit = 'characters', className }) {
  const count = unit === 'words' ? (value.trim() ? value.trim().split(/\s+/).length : 0) : value.length;
  const over = count > max;
  return (
    <p className={cn('text-xs tabular-nums', over ? 'font-semibold text-danger' : count > max * 0.9 ? 'text-[#8a5a00]' : 'text-muted', className)} aria-live="polite">
      {count} / {max} {unit}
      {over && <span className="sr-only"> (over the limit)</span>}
    </p>
  );
}

export default CharacterCounter;
