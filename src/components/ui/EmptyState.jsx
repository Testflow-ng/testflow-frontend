import Mascot from '../brand/Mascot.jsx';
import { cn } from '../../utils/cn.js';

/**
 * One layout for "nothing here yet". Pass `mood` to show Flo, or `icon` for a plain glyph.
 * `action` is any node (usually a Button). Say what is missing and what to do next.
 */
function EmptyState({ mood, icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border-strong px-6 py-12 text-center', className)}>
      {mood ? (
        <Mascot mood={mood} size={84} />
      ) : Icon ? (
        <span className="flex size-14 items-center justify-center rounded-full bg-[var(--brand-lavender)] text-primary">
          <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="mt-4 font-heading text-lg font-bold tracking-tight text-foreground-strong">{title}</h3>
      {description && <p className="mt-1.5 max-w-[38ch] text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
