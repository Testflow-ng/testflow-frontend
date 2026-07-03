import { cn } from '../../utils/cn.js';

const sizes = {
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

/** Default avatar: the person's initials on a tonal brand circle. */
function Avatar({ name, size = 'md', className }) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
        sizes[size],
        className,
      )}
    >
      {initialsFrom(name)}
    </span>
  );
}

export default Avatar;
