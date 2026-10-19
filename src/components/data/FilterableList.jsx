import { useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';
import SearchField from '../ui/SearchField.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Pagination from './Pagination.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Search box + optional filter chips + a list. `filters` is [{ value, label, test(item) }] (first one is "all").
 * Set `pageSize` to paginate the results (resets to page 1 when the search or filter changes).
 * `searchKeys` are the item fields matched by the search text. `renderItem(item)` returns a node.
 */
function FilterableList({ items, renderItem, searchKeys = ['name'], filters, placeholder = 'Search', emptyTitle = 'Nothing matches', layout = 'list', pageSize, className }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState(filters?.[0]?.value);
  const [page, setPage] = useState(1);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const test = filters?.find((f) => f.value === filter)?.test;
    return items.filter((it) => (!test || test(it)) && (!needle || searchKeys.some((k) => String(it[k] ?? '').toLowerCase().includes(needle))));
  }, [items, q, filter, filters, searchKeys]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(shown.length / pageSize)) : 1;
  const current = Math.min(page, pageCount);
  const visible = pageSize ? shown.slice((current - 1) * pageSize, current * pageSize) : shown;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField className="sm:max-w-xs sm:flex-1" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} onClear={() => { setQ(''); setPage(1); }} placeholder={placeholder} />
        {filters && <SegmentedControl label="Filter" size="sm" value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }} options={filters.map(({ value, label }) => ({ value, label }))} />}
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={SearchX} title={emptyTitle} description="Try a different word or clear the filter." />
      ) : (
        <ul className={cn(layout === 'grid' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-2')} aria-live="polite">
          {visible.map((it) => (
            <li key={it.id}>{renderItem(it)}</li>
          ))}
        </ul>
      )}
      {pageSize && shown.length > pageSize && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted">
            Showing {(current - 1) * pageSize + 1} to {Math.min(current * pageSize, shown.length)} of {shown.length}
          </p>
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

export default FilterableList;
