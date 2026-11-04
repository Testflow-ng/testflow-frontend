import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/** Trail of places. `items` is [{ label, to? }]; the last one is the current page. */
function Breadcrumb({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {last || !item.to ? (
                <span aria-current={last ? 'page' : undefined} className={cn(last && 'font-medium text-foreground-strong')}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="rounded-md hover:text-foreground-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {item.label}
                </Link>
              )}
              {!last && <ChevronRight size={14} aria-hidden="true" className="shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
