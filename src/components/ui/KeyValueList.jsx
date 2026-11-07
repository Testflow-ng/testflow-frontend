import { cn } from '../../utils/cn.js';

/** Label/value pairs (payment details, campaign summary). `items` is [{ label, value }] (value can be a node). */
function KeyValueList({ items, className }) {
  return (
    <dl className={cn('w-full min-w-0 divide-y divide-border rounded-[20px] border border-border bg-surface', className)}>
      {items.map(({ label, value }) => (
        <div key={label} className="flex min-w-0 flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <dt className="shrink-0 text-sm text-muted">{label}</dt>
          <dd className="min-w-0 break-words text-sm font-medium text-foreground-strong sm:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default KeyValueList;
