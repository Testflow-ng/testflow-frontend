import { useId } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import Slider from '../ui/Slider.jsx';
import { contrastRatio, hexToHsl, hslToHex, isHex } from '../../utils/color.js';
import { cn } from '../../utils/cn.js';

const SWATCHES = ['#4a35f0', '#1b4332', '#0f6fec', '#b3261e', '#c2410c', '#a16207', '#047857', '#be185d', '#334155', '#7c3aed'];

/**
 * Custom colour picker (swatches, hex field, hue and lightness sliders) with a contrast check against white
 * text, since buttons on the organisation's site use `value` as the background. Below 4.5:1 it warns that
 * body-size button text will be hard to read. Controlled: `value` "#RRGGBB" and `onChange(hex)`.
 */
function ColorPicker({ label, value, onChange, className, id }) {
  const gen = useId();
  const fieldId = id ?? gen;
  const valid = isHex(value);
  const [h, s, l] = valid ? hexToHsl(value) : [250, 80, 55];
  const ratio = valid ? contrastRatio(value, '#ffffff') : 0;
  const pass = ratio >= 4.5;
  const setHsl = (nh, ns, nl) => onChange(hslToHex(nh, ns, nl));

  return (
    <div className={cn('space-y-3', className)}>
      {label && <label htmlFor={fieldId} className="block text-sm font-medium text-foreground-strong">{label}</label>}
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="size-12 shrink-0 rounded-2xl border border-border-strong shadow-inner" style={{ background: valid ? value : '#fff' }} />
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
      <div className="flex flex-wrap gap-2" role="group" aria-label="Preset colours">
        {SWATCHES.map((c) => (
          <button key={c} type="button" onClick={() => onChange(c)} aria-label={c} aria-pressed={value?.toLowerCase() === c} className="relative flex size-8 items-center justify-center rounded-full border border-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" style={{ background: c }}>
            {value?.toLowerCase() === c && <Check size={14} strokeWidth={3} aria-hidden="true" className="text-white" />}
          </button>
        ))}
      </div>
      {valid && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label="Hue" min={0} max={360} value={h} onValueChange={(v) => setHsl(v, s, l)} showScale={false} format={(v) => `${v}°`} />
          <Slider label="Lightness" min={15} max={85} value={Math.min(85, Math.max(15, l))} onValueChange={(v) => setHsl(h, s, v)} showScale={false} format={(v) => `${v}%`} />
        </div>
      )}
      <p role="status" className={cn('flex items-start gap-2 rounded-xl px-3 py-2 text-sm', !valid ? 'bg-danger/10 text-score-low' : pass ? 'bg-success/10 text-score-good' : 'bg-warning/15 text-[#8a5a00]')}>
        {!valid ? 'Enter a colour like #4A35F0.' : pass ? <><Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> White text on this colour: {ratio.toFixed(1)}:1. Passes AA.</> : <><TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> White text on this colour: {ratio.toFixed(1)}:1. Too low for button text; pick a darker colour.</>}
      </p>
    </div>
  );
}

export default ColorPicker;
