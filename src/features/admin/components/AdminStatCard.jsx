import { cn } from '../../../utils/cn.js';

function AdminStatCard({ label, value, icon: Icon, color, bg, hint }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', bg)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        {hint && (
          <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[10px] font-semibold text-muted">
            {hint}
          </span>
        )}
      </div>
      <p className="mt-4 font-heading text-2xl font-extrabold tabular-nums text-foreground-strong">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

export default AdminStatCard;
