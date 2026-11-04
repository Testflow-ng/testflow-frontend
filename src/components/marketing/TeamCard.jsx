import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Person card. Use real names and public links only. `avatar` falls back to the default avatar;
 * `links` is [{ label, href }] (opened in a new tab with rel="noopener noreferrer").
 */
function TeamCard({ name, role, summary, avatar, links = [], className }) {
  return (
    <article className={cn('flex flex-col gap-2 rounded-[20px] border border-border bg-surface p-7', className)}>
      <img src={avatar || '/team/default-avatar.svg'} alt={`${name}, ${role}`} width="84" height="84" loading="lazy" decoding="async" className="mb-1.5 size-[84px] rounded-full bg-[var(--brand-sage)] object-cover shadow-[0_0_0_3px_var(--background),0_0_0_4px_var(--color-border)]" />
      <h3 className="font-heading text-lg font-bold text-foreground-strong">{name}</h3>
      <p className="text-xs font-bold uppercase tracking-wide text-primary">{role}</p>
      {summary && <p className="text-sm leading-relaxed text-muted">{summary}</p>}
      {links.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`${name}: ${l.label} (opens in a new tab)`} className="inline-flex items-center gap-1 border-b border-border pb-px text-sm font-bold text-foreground-strong hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {l.label} <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          ))}
        </p>
      )}
    </article>
  );
}

export default TeamCard;
