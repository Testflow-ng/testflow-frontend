import { ArrowRight, Edit2, Star } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { cardClasses } from '../../components/ui/surfaces.js';
import { subjectMeta } from './subjectMeta.js';
import { useAuth } from '../auth/useAuth.js';
import { useNavigate } from 'react-router-dom';
import { useTogglePin } from './useSubjects.js';

/**
 * Subject tile.
 *
 * Two mobile fixes over the previous version:
 * - The "Start practice" affordance was `opacity-0 group-hover:opacity-100`,
 *   so on a touch device it was permanently invisible while still occupying a
 *   row of height. It is now always visible on touch and keeps the hover
 *   reveal only where a real pointer exists.
 * - The pin and edit controls were 30px targets. They now use a 40px control
 *   with a 44px hit area, and stop propagation so tapping them never starts an
 *   exam by accident.
 */
function SubjectCard({ subject, onSelect }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutate: togglePin, isPending: isPinning } = useTogglePin();
  const { Icon, accent } = subjectMeta(subject.code);
  const count = subject.questionCount ?? 0;
  const disabled = count === 0;
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const isPinned = user?.pinnedSubjects?.includes(subject.id);
  const isInert = disabled && !isAdmin;

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate('/admin/subjects');
  };

  const handlePin = (e) => {
    e.stopPropagation();
    togglePin(subject.id);
  };

  return (
    <div
      role="button"
      tabIndex={isInert ? -1 : 0}
      aria-disabled={isInert || undefined}
      onClick={() => !isInert && onSelect(subject)}
      onKeyDown={(e) => {
        if (isInert) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(subject);
        }
      }}
      aria-label={
        disabled ? `${subject.title}: no questions yet` : `Set up ${subject.title} practice`
      }
      className={cardClasses({
        padding: 'md',
        interactive: !isInert,
        className: cn(
          'group relative flex w-full flex-col items-start gap-3 text-left',
          isInert && 'cursor-not-allowed opacity-60',
        ),
      })}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform [@media(hover:hover)]:group-hover:scale-105',
              accent,
            )}
          >
            <Icon size={22} aria-hidden="true" />
          </span>
          {subject.level && (
            <span className="rounded-md border border-border bg-surface-strong px-2 py-0.5 text-[11px] font-bold text-muted">
              {subject.level}L
            </span>
          )}
        </div>

        <div className="-mr-1 flex items-center gap-1.5">
          {!isAdmin && (
            <button
              type="button"
              onClick={handlePin}
              disabled={isPinning}
              aria-pressed={Boolean(isPinned)}
              aria-label={isPinned ? `Unpin ${subject.title}` : `Pin ${subject.title}`}
              className={cn(
                "tf-pressable relative flex size-10 items-center justify-center rounded-full border",
                "after:absolute after:inset-[-2px] after:content-['']",
                isPinned
                  ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                  : 'border-border bg-surface-strong text-muted',
              )}
            >
              <Star size={16} aria-hidden="true" className={cn(isPinned && 'fill-amber-500')} />
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={handleEdit}
              aria-label={`Manage ${subject.title}`}
              className="tf-pressable relative flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary text-primary-foreground"
            >
              <Edit2 size={16} aria-hidden="true" />
            </button>
          )}
          <span
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
              count > 20 ? 'bg-success/10 text-success' : 'bg-surface-strong text-muted',
            )}
          >
            {disabled ? 'Empty' : `${count} Qs`}
          </span>
        </div>
      </div>

      <div className="w-full min-w-0 flex-1">
        <p className="truncate font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
          {subject.code}
        </p>
        <h3 className="mt-0.5 line-clamp-2 break-words text-[17px] font-bold leading-snug tracking-tight text-foreground-strong">
          {subject.title}
        </h3>
        {/*
          The old card always showed "Master {title} with our curated question
          bank" — two lines that restate the heading directly above them. It is
          pure filler on a list built for scanning, and dropping it fits roughly
          twice as many courses on a phone screen. Copy is kept only for the
          empty case, where it actually tells the user something.
        */}
        {disabled ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
            We are currently adding content for this subject. Check back soon.
          </p>
        ) : null}
      </div>

      <span className="flex items-center gap-1.5 text-[13px] font-bold text-primary transition-all duration-300 [@media(hover:hover)]:-translate-x-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:opacity-100">
        {disabled && isAdmin ? 'View management' : 'Start practice'}
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </div>
  );
}

export default SubjectCard;
