import { cn } from '../../utils/cn.js';

const dot = { default: 'bg-border-strong', success: 'bg-success', danger: 'bg-danger', warning: 'bg-warning', primary: 'bg-primary' };

/** Vertical history (campaign changes, audit log). `items` is [{ title, time, detail?, tone? }], newest first. */
function Timeline({ items, className }) {
  return (
    <ol className={cn('relative space-y-5', className)}>
      {items.map((it, i) => (
        <li key={`${it.title}-${it.time}`} className="relative pl-7">
          {i < items.length - 1 && <span aria-hidden="true" className="absolute left-[7px] top-4 h-[calc(100%+0.5rem)] w-px bg-border" />}
          <span aria-hidden="true" className={cn('absolute left-0 top-1.5 size-[15px] rounded-full border-[3px] border-background', dot[it.tone ?? 'default'])} />
          <p className="text-sm font-semibold text-foreground-strong">{it.title}</p>
          <p className="text-xs text-muted">{it.time}</p>
          {it.detail && <p className="mt-1 text-sm leading-relaxed text-muted">{it.detail}</p>}
        </li>
      ))}
    </ol>
  );
}

export default Timeline;
