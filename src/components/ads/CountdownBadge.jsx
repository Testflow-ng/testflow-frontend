import { useEffect, useState } from 'react';
import { Hourglass } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const left = (until) => Math.max(0, new Date(until).getTime() - Date.now());

/** "7 days to republish". Reads an ISO date (`until`) and updates each minute. Amber under 3 days, red under 1. */
function CountdownBadge({ until, label = 'to republish', expiredLabel = 'Expired', className }) {
  const [ms, setMs] = useState(() => left(until));
  useEffect(() => {
    const t = setInterval(() => setMs(left(until)), 60000);
    return () => clearInterval(t);
  }, [until]);

  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const text = ms <= 0 ? expiredLabel : days >= 1 ? `${days} ${days === 1 ? 'day' : 'days'} ${label}` : `${Math.max(1, hours)} ${hours === 1 ? 'hour' : 'hours'} ${label}`;
  const tone = ms <= 0 ? 'bg-surface-strong text-muted' : days < 1 ? 'bg-danger/10 text-score-low' : days < 3 ? 'bg-warning/15 text-[#8a5a00]' : 'bg-[var(--brand-lavender)] text-primary';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', tone, className)}>
      <Hourglass size={13} aria-hidden="true" />
      {text}
    </span>
  );
}

export default CountdownBadge;
