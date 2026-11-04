import { Pin } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar.jsx';
import { cn } from '../../utils/cn.js';

/** A course tile: code, name, question count, optional progress and a pin toggle. Click `onSelect` to open. */
function CourseCard({ code, name, questionCount, progress, pinned = false, onPin, onSelect, className }) {
  return (
    <div className={cn('group relative rounded-[20px] border border-border bg-surface p-4 transition-colors hover:border-border-strong', className)}>
      <button type="button" onClick={onSelect} className="block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <span className="inline-flex rounded-full bg-[var(--brand-lavender)] px-2.5 py-0.5 text-xs font-bold text-primary">{code}</span>
        <span className="mt-3 block font-heading text-[1.05rem] font-bold leading-snug text-foreground-strong">{name}</span>
        {questionCount != null && <span className="mt-0.5 block text-sm text-muted">{questionCount.toLocaleString()} questions</span>}
        {progress != null && <ProgressBar className="mt-3" size="sm" value={progress} label={`${code} progress`} />}
      </button>
      {onPin && (
        <button
          type="button"
          onClick={onPin}
          aria-pressed={pinned}
          aria-label={pinned ? `Unpin ${code}` : `Pin ${code}`}
          className={cn('absolute right-3 top-3 flex size-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', pinned ? 'bg-primary text-primary-foreground' : 'text-muted hover:bg-surface-strong')}
        >
          <Pin size={15} aria-hidden="true" className={pinned ? 'fill-current' : ''} />
        </button>
      )}
    </div>
  );
}

export default CourseCard;
