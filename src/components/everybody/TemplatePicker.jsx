import { Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/** Tiny wireframes so each template is recognisable without screenshots. */
const WIRES = {
  classic: (
    <div className="space-y-1.5">
      <div className="h-2 w-full rounded bg-border-strong/70" />
      <div className="flex gap-1.5"><div className="h-9 flex-1 rounded bg-primary/70" /><div className="h-9 w-10 rounded bg-border-strong/60" /></div>
      <div className="grid grid-cols-3 gap-1.5"><div className="h-6 rounded bg-border-strong/60" /><div className="h-6 rounded bg-border-strong/60" /><div className="h-6 rounded bg-border-strong/60" /></div>
    </div>
  ),
  modern: (
    <div className="space-y-1.5">
      <div className="h-12 w-full rounded bg-primary/70" />
      <div className="grid grid-cols-2 gap-1.5"><div className="h-8 rounded bg-border-strong/60" /><div className="h-8 rounded bg-accent/80" /></div>
      <div className="h-2 w-2/3 rounded bg-border-strong/60" />
    </div>
  ),
  minimal: (
    <div className="space-y-2 pt-1">
      <div className="h-2 w-1/2 rounded bg-foreground-strong/70" />
      <div className="h-1.5 w-full rounded bg-border-strong/60" />
      <div className="h-1.5 w-5/6 rounded bg-border-strong/60" />
      <div className="mt-2 h-5 w-16 rounded-full bg-primary/70" />
    </div>
  ),
};

/** Pick a site template. `templates` is [{ key, name, description }] (from GET /templates). Radio group semantics. */
function TemplatePicker({ templates, value, onValueChange, className }) {
  return (
    <div role="radiogroup" aria-label="Template" className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {templates.map((t) => {
        const selected = t.key === value;
        return (
          <button key={t.key} type="button" role="radio" aria-checked={selected} onClick={() => onValueChange(t.key)} className={cn('relative flex flex-col items-stretch gap-3 rounded-[20px] border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 motion-reduce:transition-none', selected ? 'border-primary bg-[var(--brand-lavender)]/50' : 'border-border bg-surface hover:border-border-strong')}>
            <div className="rounded-xl border border-border bg-background p-2.5">{WIRES[t.key] ?? WIRES.classic}</div>
            <div>
              <p className="font-heading text-base font-bold text-foreground-strong">{t.name}</p>
              {t.description && <p className="text-sm text-muted">{t.description}</p>}
            </div>
            {selected && <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={14} strokeWidth={3} aria-hidden="true" /></span>}
          </button>
        );
      })}
    </div>
  );
}

export default TemplatePicker;
