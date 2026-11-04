import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import Pagination from './Pagination.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';

/**
 * Sortable, paginated table with optional row selection and bulk actions.
 *
 * columns: [{ key, header, sortable?, align?, render?(row) }]; rows need a unique `id`.
 *
 * Client mode (default): give all `rows`; sorting and paging happen here.
 * Server mode: pass `server={{ page, pageCount, total, onPageChange, sort, onSortChange }}` with ONE page of
 * rows; the table only displays and reports clicks.
 *
 * `toolbar` renders above the table (filters, search, buttons). `selectable` adds checkboxes;
 * `bulkActions({ selectedIds, clear })` renders in a bar while something is selected.
 * `loading` shows skeleton rows. `rowActions(row)` renders a trailing actions cell.
 */
function DataTable({
  columns,
  rows,
  pageSize = 8,
  initialSort,
  server,
  toolbar,
  selectable = false,
  bulkActions,
  rowActions,
  loading = false,
  caption,
  emptyMessage = 'No results.',
  className,
}) {
  const [clientSort, setClientSort] = useState(initialSort ?? null);
  const [clientPage, setClientPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  const sort = server ? server.sort ?? null : clientSort;

  const sorted = useMemo(() => {
    if (server || !sort) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true }) * dir;
    });
  }, [rows, sort, server]);

  const total = server ? server.total ?? rows.length : sorted.length;
  const pageCount = server ? server.pageCount : Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = server ? server.page : Math.min(clientPage, pageCount);
  const visible = server ? rows : sorted.slice((page - 1) * pageSize, page * pageSize);
  const perPage = server ? rows.length || pageSize : pageSize;

  const toggleSort = (key) => {
    const next = sort?.key === key ? (sort.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' };
    if (server) server.onSortChange?.(next);
    else (setClientPage(1), setClientSort(next));
  };
  const goto = (p) => (server ? server.onPageChange(p) : setClientPage(p));

  const allOnPage = visible.length > 0 && visible.every((r) => selected.has(r.id));
  const someOnPage = visible.some((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((r) => (allOnPage ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const clear = () => setSelected(new Set());
  const colCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <div className={cn('rounded-[20px] border border-border bg-surface', className)}>
      {toolbar && <div className="flex flex-wrap items-center gap-3 border-b border-border p-3">{toolbar}</div>}
      {selectable && selected.size > 0 && (
        <div role="status" className="flex flex-wrap items-center gap-3 border-b border-border bg-[var(--brand-lavender)]/60 px-4 py-2.5 text-sm">
          <span className="font-semibold text-foreground-strong">{selected.size} selected</span>
          {bulkActions?.({ selectedIds: [...selected], clear })}
          <button type="button" onClick={clear} className="ml-auto rounded-full px-3 py-1 font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            Clear
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm" aria-busy={loading || undefined}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-border">
              {selectable && (
                <th scope="col" className="w-12 px-4 py-3">
                  <Checkbox aria-label="Select all rows on this page" checked={allOnPage} indeterminate={!allOnPage && someOnPage} onChange={toggleAll} />
                </th>
              )}
              {columns.map((c) => {
                const active = sort?.key === c.key;
                const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : c.sortable ? 'none' : undefined} className={cn('px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted', c.align === 'right' && 'text-right')}>
                    {c.sortable ? (
                      <button type="button" onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 rounded-md uppercase hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        {c.header}
                        <Icon size={13} aria-hidden="true" className={active ? 'text-primary' : 'opacity-60'} />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {rowActions && <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(perPage, 5) }, (_, i) => (
                <tr key={i} className="border-b border-border/70 last:border-0">
                  <td colSpan={colCount} className="px-4 py-3"><Skeleton className="h-5 w-full rounded-full" /></td>
                </tr>
              ))
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-10 text-center text-muted">{emptyMessage}</td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} aria-selected={selectable ? selected.has(row.id) : undefined} className={cn('border-b border-border/70 last:border-0 hover:bg-surface-strong/60', selected.has(row.id) && 'bg-[var(--brand-lavender)]/40')}>
                  {selectable && (
                    <td className="px-4 py-3">
                      <Checkbox aria-label={`Select row ${row.id}`} checked={selected.has(row.id)} onChange={() => toggleOne(row.id)} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4 py-3 text-foreground-strong', c.align === 'right' && 'text-right tabular-nums')}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  {rowActions && <td className="whitespace-nowrap px-3 py-2 text-right">{rowActions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
          <p className="text-xs text-muted">
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
          </p>
          <Pagination page={page} pageCount={pageCount} onPageChange={goto} />
        </div>
      )}
    </div>
  );
}

export default DataTable;
