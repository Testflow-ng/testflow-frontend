import { Check, ChevronsUpDown } from 'lucide-react';
import DropdownMenu from './ui/DropdownMenu.jsx';
import { cn } from '../utils/cn.js';

/**
 * Switch between the products an account belongs to (student, ads, everyone) or between organisations.
 * `products` is [{ key, label, description?, icon, onSelect }]; `current` is the active key.
 * The identity API's `memberships` / `activeProduct` map straight onto this.
 */
function ProductSwitcher({ products, current, className }) {
  const active = products.find((p) => p.key === current) ?? products[0];
  const Icon = active?.icon;
  return (
    <DropdownMenu
      placement="bottom-start"
      trigger={(props) => (
        <button type="button" aria-label={`Switch product. Current: ${active?.label}`} className={cn('flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-2.5 py-2 text-left transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', className)} {...props}>
          {Icon && <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-lavender)] text-primary"><Icon size={17} strokeWidth={1.6} aria-hidden="true" /></span>}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground-strong">{active?.label}</span>
            {active?.description && <span className="block truncate text-xs text-muted">{active.description}</span>}
          </span>
          <ChevronsUpDown size={16} aria-hidden="true" className="shrink-0 text-muted" />
        </button>
      )}
      items={products.map((p) => ({ label: p.key === current ? `${p.label} (current)` : p.label, icon: p.key === current ? Check : p.icon, onSelect: p.onSelect }))}
    />
  );
}

export default ProductSwitcher;
