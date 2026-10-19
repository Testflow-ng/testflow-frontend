import { useId } from 'react';
import { TriangleAlert } from 'lucide-react';
import { contrastRatio, isHex } from '../../utils/color.js';
import { cn } from '../../utils/cn.js';

/**
 * A colour field: click the swatch to pick a colour, or type a hex code. Buttons on the organisation's site use
 * `value` as the background, so below 4.5:1 against white text it shows one short warning.
 * Set `checkContrast={false}` for colours that are not used behind white text (an accent). Controlled: `value` "#RRGGBB" and `onChange(hex)`.
 */
function ColorPicker({ label, value, onChange, className, id, checkContrast = true }) {
  const gen = useId();
  const fieldId = id ?? gen;
  const valid = isHex(value);
  const low = checkContrast && valid && contrastRatio(value, '#ffffff') < 4.5;

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label htmlFor={fieldId} className="block text-sm font-medium text-foreground-strong">{label}</label>}
      <div className="flex items-center gap-3">
        <input type="color" aria-label={`${label ?? 'Colour'} picker`} value={valid ? value.toLowerCase() : '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} className="size-12 shrink-0 cursor-pointer appearance-none rounded-2xl border border-border-strong bg-transparent p-0 [&::-moz-color-swatch]:rounded-2xl [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-2xl [&::-webkit-color-swatch]:border-0" />
        <input
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
          maxLength={7}
          spellCheck={false}
          aria-invalid={!valid || undefined}
          className="h-12 w-36 rounded-full border border-border-strong bg-surface px-5 font-mono text-sm uppercase focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 aria-invalid:border-danger"
        />
      </div>
      {(!valid || low) && (
        <p role="status" className={cn('flex items-start gap-2 text-sm', valid ? 'text-[#8a5a00]' : 'text-score-low')}>
          {valid ? <><TriangleAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Too light for white button text. Pick a darker colour.</> : 'Enter a colour like #4A35F0.'}
        </p>
      )}
    </div>
  );
}

export default ColorPicker;
