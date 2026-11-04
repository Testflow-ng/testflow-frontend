import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const pageList = (page, count) => {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page, page - 1, page + 1]);
  const pages = [...set].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  return pages.flatMap((p, i) => (i && p - pages[i - 1] > 1 ? ['…', p] : [p]));
};

const btn =
  'inline-flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40';

/** 1-based pagination. Calls `onPageChange(n)`. */
function Pagination({ page, pageCount, onPageChange, className }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <button type="button" className={cn(btn, 'text-muted hover:bg-surface-strong')} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      {pageList(page, pageCount).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(btn, p === page ? 'bg-primary text-primary-foreground' : 'text-foreground-strong hover:bg-surface-strong')}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={cn(btn, 'text-muted hover:bg-surface-strong')} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;
