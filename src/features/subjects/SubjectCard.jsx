import { ArrowRight, Edit2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { subjectMeta } from './subjectMeta.js';
import { useAuth } from '../auth/useAuth.js';
import { useNavigate } from 'react-router-dom';

/** Premium subject card for the student dashboard. */
function SubjectCard({ subject, onSelect }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { Icon, accent } = subjectMeta(subject.code);
  const count = subject.questionCount ?? 0;
  const disabled = count === 0;
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate('/admin/subjects'); // Takes them to management where the modal can be opened
  };

  return (
    <button
      type="button"
      disabled={disabled && !isAdmin}
      onClick={() => onSelect(subject)}
      aria-label={
        disabled ? `${subject.title}: no questions yet` : `Set up ${subject.title} practice`
      }
      className={cn(
        'group relative flex w-full flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition-all duration-300',
        disabled && !isAdmin
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-primary/50 hover:bg-surface-strong hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110', accent)}>
          <Icon size={24} aria-hidden="true" />
        </span>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <div
              onClick={handleEdit}
              className="p-2 rounded-lg bg-surface border border-border text-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm"
              title="Manage Subject"
            >
              <Edit2 size={14} />
            </div>
          )}
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
            count > 20 ? "bg-success/10 text-success" : "bg-surface-strong text-muted"
          )}>
            {disabled ? 'Empty' : `${count} Qs`}
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1 w-full">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted truncate">{subject.code}</p>
        <h3 className="text-lg font-bold text-foreground-strong tracking-tight line-clamp-1 break-words">{subject.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted line-clamp-2 min-h-[2.5em]">
          {disabled
            ? 'We are currently adding content for this subject. Check back soon.'
            : `Master ${subject.title} with our curated question bank.`}
        </p>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
        {disabled && isAdmin ? 'View Management' : 'Start Practice'} <ArrowRight size={14} />
      </div>
    </button>
  );
}

export default SubjectCard;

export default SubjectCard;
