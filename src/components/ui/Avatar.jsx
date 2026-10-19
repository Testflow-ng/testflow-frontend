import { cn } from '../../utils/cn.js';

const sizes = {
  xs: 'size-7 text-[10px]',
  sm: 'size-9 text-xs',
  md: 'size-12 text-base',
  lg: 'size-20 text-2xl',
};

const initialsFrom = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Avatar: a photo when `src` is given, otherwise the person's initials on a lavender circle. */
function Avatar({ name, src, size = 'md', className }) {
  return src ? (
    <img
      src={src}
      alt={name ?? ''}
      className={cn('inline-block shrink-0 rounded-full object-cover', sizes[size], className)}
    />
  ) : (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--brand-lavender)] font-semibold text-primary',
        sizes[size],
        className,
      )}
    >
      {initialsFrom(name)}
    </span>
  );
}

/** Overlapping avatars with a "+N" overflow chip. `people` is [{ name, src }]. */
export function AvatarGroup({ people = [], max = 4, size = 'sm', className }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className={cn('flex items-center -space-x-2', className)} role="group" aria-label={`${people.length} people`}>
      {shown.map((p) => (
        <Avatar key={p.name} {...p} size={size} className="ring-2 ring-background" />
      ))}
      {extra > 0 && (
        <span className={cn('inline-flex items-center justify-center rounded-full bg-surface-strong text-xs font-semibold text-muted ring-2 ring-background', sizes[size])}>
          +{extra}
        </span>
      )}
    </div>
  );
}

export default Avatar;
