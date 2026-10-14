import { cn } from '../../utils/cn.js';

/** On/off switch. Controlled: `checked` + `onCheckedChange(next)`. Give it a visible `label` or an `aria-label`. */
function Switch({ checked = false, onCheckedChange, label, disabled, className, id, ...props }) {
  const toggle = () => !disabled && onCheckedChange?.(!checked);
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? undefined : props['aria-label']}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent transition-colors motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-border-strong',
        )}
      >
        <span className={cn('absolute left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none', checked && 'translate-x-5')} />
      </button>
      {label && (
        <label htmlFor={id} onClick={toggle} className="cursor-pointer text-[15px] text-foreground-strong">
          {label}
        </label>
      )}
    </span>
  );
}

export default Switch;
