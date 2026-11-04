import { useNavigate } from 'react-router-dom';
import { ArrowRight, Pencil, Star } from 'lucide-react';
import { Badge, IconButton } from '../../components/ui/index.js';
import { ICON } from '../../components/ui/iconProps.js';
import { cn } from '../../utils/cn.js';
import { useAuth } from '../auth/useAuth.js';
import { subjectMeta } from './subjectMeta.js';
import { useTogglePin } from './useSubjects.js';

/** Subject tile. Whole card starts practice; pin (students) or manage (admins) sits in the corner and never starts an exam. */
function SubjectCard({ subject, onSelect }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutate: togglePin, isPending: isPinning } = useTogglePin();
  const { Icon, accent } = subjectMeta(subject.code);
  const count = subject.questionCount ?? 0;
  const empty = count === 0;
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isPinned = user?.pinnedSubjects?.includes(subject.id);
  const inert = empty && !isAdmin;

  const open = () => !inert && onSelect(subject);

  return (
    <div
      role="button"
      tabIndex={inert ? -1 : 0}
      aria-disabled={inert || undefined}
      aria-label={empty ? `${subject.title}: no questions yet` : `Set up ${subject.title} practice`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      className={cn(
        'group flex w-full flex-col gap-4 rounded-[20px] border border-border bg-surface p-5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        inert ? 'cursor-not-allowed opacity-60' : 'tf-pressable cursor-pointer [@media(hover:hover)]:hover:border-border-strong [@media(hover:hover)]:hover:bg-surface-strong',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', accent)}>
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        {isAdmin ? (
          <IconButton size="sm" variant="outline" aria-label={`Manage ${subject.title}`} onClick={(e) => { e.stopPropagation(); navigate('/admin/subjects'); }}>
            <Pencil {...ICON} />
          </IconButton>
        ) : (
          <IconButton
            size="sm"
            variant={isPinned ? 'accent' : 'outline'}
            disabled={isPinning}
            aria-pressed={Boolean(isPinned)}
            aria-label={isPinned ? `Unpin ${subject.title}` : `Pin ${subject.title}`}
            onClick={(e) => { e.stopPropagation(); togglePin(subject.id); }}
          >
            <Star {...ICON} className={cn(isPinned && 'fill-current')} />
          </IconButton>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted">{subject.code}</span>
          {subject.level && <Badge variant="outline">{subject.level}L</Badge>}
        </div>
        <h3 className="mt-1 line-clamp-2 break-words font-heading text-[1.05rem] font-bold leading-snug tracking-tight text-foreground-strong">
          {subject.title}
        </h3>
        {empty && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">We are adding content for this subject. Check back soon.</p>}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Badge variant={empty ? 'outline' : 'sage'}>{empty ? 'Empty' : `${count} questions`}</Badge>
        {!inert && (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary">
            {empty && isAdmin ? 'View management' : 'Start practice'}
            <ArrowRight {...ICON} className="transition-transform [@media(hover:hover)]:group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </div>
  );
}

export default SubjectCard;
