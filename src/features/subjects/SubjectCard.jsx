import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from './subjectMeta.js';

/** Premium subject card for the student dashboard. */
function SubjectCard({ subject, onSelect }) {
  const { Icon, accent } = subjectMeta(subject.code);
  const count = subject.questionCount ?? 0;
  const disabled = count === 0;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(subject)}
      aria-label={
        disabled ? `${subject.title}: no questions yet` : `Set up ${subject.title} practice`
      }
      className={cn(
        'group flex w-full flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition-all duration-300',
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-primary/50 hover:bg-surface-strong hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110', accent)}>
          <Icon size={24} aria-hidden="true" />
        </span>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
          count > 20 ? "bg-success/10 text-success" : "bg-surface-strong text-muted"
        )}>
          {disabled ? 'Coming Soon' : `${count} Qs`}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted">{subject.code}</p>
        <h3 className="truncate text-lg font-bold text-foreground-strong tracking-tight">{subject.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted line-clamp-2">
          {disabled
            ? 'We are currently adding content for this subject. Check back soon.'
            : `Master ${subject.title} with our curated question bank.`}
        </p>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
        Start Practice <ArrowRight size={14} />
      </div>
    </button>
  );
}

export default SubjectCard;
