import { useId } from 'react';
import { cn } from '../../utils/cn.js';

/** Range slider. Controlled: `value` + `onValueChange(number)`. `format` customises the readout. */
function Slider({ label, value, onValueChange, min = 0, max = 100, step = 1, format = (v) => v, showScale = true, className, id }) {
  const gen = useId();
  const fieldId = id ?? gen;
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-baseline justify-between">
        {label && <label htmlFor={fieldId} className="text-sm font-medium text-foreground-strong">{label}</label>}
        <output htmlFor={fieldId} className="font-heading text-lg font-extrabold text-primary">{format(value)}</output>
      </div>
      <input
        id={fieldId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className="tf-slider"
        style={{ '--fill': `${fill}%` }}
      />
      {showScale && (
        <div aria-hidden="true" className="mt-1 flex justify-between text-xs text-muted">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      )}
    </div>
  );
}

export default Slider;
