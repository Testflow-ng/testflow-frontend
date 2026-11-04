import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Accessible FAQ. `items` is [[question, answer], ...] (answers are plain text). Each question is a real
 * button with aria-expanded; the panel animates open (instant under reduced motion). `multiple` lets
 * several stay open; `defaultOpen` is an array of indexes.
 */
function FaqAccordion({ items, multiple = true, defaultOpen = [], className }) {
  const base = useId();
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className={cn('divide-y divide-border border-y border-border', className)}>
      {items.map(([q, a], i) => {
        const isOpen = open.has(i);
        return (
          <div key={q}>
            <h3>
              <button
                type="button"
                id={`${base}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-a${i}`}
                onClick={() => toggle(i)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-[1.0625rem] font-medium text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{q}</span>
                <Plus size={20} strokeWidth={1.8} aria-hidden="true" className={cn('shrink-0 text-primary transition-transform duration-200 motion-reduce:transition-none', isOpen && 'rotate-45')} />
              </button>
            </h3>
            <div id={`${base}-a${i}`} role="region" aria-labelledby={`${base}-q${i}`} className={cn('grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <p className="max-w-[60ch] pb-5 text-[15px] leading-relaxed text-muted">{a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
