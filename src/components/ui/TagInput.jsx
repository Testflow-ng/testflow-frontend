import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Type and press Enter or comma to add a tag; Backspace on empty removes the last. Controlled via
 * `value` (string[]) and `onChange`. `max` caps the count (e.g. 3 ad keywords).
 */
function TagInput({ value = [], onChange, max = 10, placeholder = 'Add and press Enter', label, id, className }) {
  const gen = useId();
  const fieldId = id ?? gen;
  const [text, setText] = useState('');
  const full = value.length >= max;

  const add = () => {
    const t = text.trim().replace(/,+$/, '');
    if (t && !full && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setText('');
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
  };

  return (
    <div className={className}>
      {label && <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-foreground-strong">{label}</label>}
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-[22px] border border-border-strong bg-surface px-3 py-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-lavender)] py-1 pl-3 pr-1.5 text-sm font-medium text-primary">
            {t}
            <button type="button" onClick={() => onChange(value.filter((v) => v !== t))} aria-label={`Remove ${t}`} className="flex size-5 items-center justify-center rounded-full hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={fieldId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          disabled={full}
          placeholder={full ? `Maximum of ${max} reached` : placeholder}
          className="h-8 w-0 min-w-[5rem] flex-1 text-base outline-none placeholder:text-muted sm:text-sm"
          style={{ border: 0, padding: '0 0.25rem', background: 'transparent', minHeight: 0 }}
        />
      </div>
      <p className={cn('mt-1.5 text-xs', full ? 'text-[#8a5a00]' : 'text-muted')}>{value.length} / {max}</p>
    </div>
  );
}

export default TagInput;
