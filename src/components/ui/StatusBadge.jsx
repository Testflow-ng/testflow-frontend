import { CircleDashed } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { STATUS } from './statusMap.js';

const tones = {
  success: 'bg-success/10 text-score-good border-success/25',
  warning: 'bg-warning/15 text-[#8a5a00] border-warning/30',
  danger: 'bg-danger/10 text-score-low border-danger/25',
  info: 'bg-[var(--brand-lavender)] text-primary border-transparent',
  neutral: 'bg-surface-strong text-muted border-border',
};

/** `status` is a key of STATUS (unknown keys fall back to a neutral badge). `label` overrides the text. */
function StatusBadge({ status, label, className }) {
  const cfg = STATUS[status] ?? { label: String(status), tone: 'neutral', icon: CircleDashed };
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', tones[cfg.tone], className)}>
      <Icon size={13} strokeWidth={2.2} aria-hidden="true" />
      {label ?? cfg.label}
    </span>
  );
}

export default StatusBadge;
