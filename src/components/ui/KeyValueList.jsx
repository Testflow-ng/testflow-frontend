import { cn } from '../../utils/cn.js';

/** Label/value pairs (payment details, campaign summary). `items` is [{ label, value }] (value can be a node). */
function KeyValueList({ items, className }) {
  return (
    <dl className={cn('divide-y divide-border rounded-[20px] border border-border bg-surface', className)}>
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="text-sm font-medium text-foreground-strong sm:text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default KeyValueList;
