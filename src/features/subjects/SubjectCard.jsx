import { ChevronRight } from 'lucide-react';
import Spinner from '../../components/ui/Spinner.jsx';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from './subjectMeta.js';

/** Compact, tappable subject row: the whole card starts a practice exam. */
function SubjectCard({ subject, onStart, isStarting }) {
  const { Icon, accent } = subjectMeta(subject.code);
  const count = subject.questionCount ?? 0;
  const disabled = count === 0;

  return (
    <button
      type="button"
      disabled={disabled || isStarting}
      onClick={() => onStart(subject.code)}
      aria-label={
        disabled
          ? `${subject.title}: no questions yet`
          : `Start ${subject.title} practice, ${count} questions`
      }
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors',
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-border-strong hover:bg-surface-strong',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg', accent)}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-medium text-muted">{subject.code}</p>
        <h3 className="truncate text-sm font-semibold text-foreground-strong">{subject.title}</h3>
        <p className="mt-0.5 text-xs text-muted">
          {disabled ? 'No questions yet' : `${count} questions`}
        </p>
      </div>
      <span className="shrink-0 text-muted">
        {isStarting ? (
          <Spinner size="sm" className="text-primary" />
        ) : (
          <ChevronRight size={18} aria-hidden="true" />
        )}
      </span>
    </button>
  );
}

export default SubjectCard;
