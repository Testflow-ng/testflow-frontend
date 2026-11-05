import { useRef, useState } from 'react';
import { ArrowRight, BookOpen, Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useDismiss } from './ui/useDismiss.js';
import { cn } from '../utils/cn.js';

/**
 * Premium product & workspace switcher for Testflow.
 * Allows instant, elegant switching between Testflow CBT (student practice)
 * and Testflow for Everyone (organization workspace).
 */
function ProductSwitcher({ products = [], current = 'student', className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useDismiss({
    open,
    onClose: () => setOpen(false),
    containerRef,
    triggerRef,
  });

  const active = products.find((p) => p.key === current) ?? products[0];

  const handleSelect = (item) => {
    setOpen(false);
    item.onSelect?.();
  };

  const getBadgeIcon = (key) => {
    if (key === 'student') {
      return <BookOpen size={14} strokeWidth={1.8} aria-hidden="true" />;
    }
    return <Building2 size={14} strokeWidth={1.8} aria-hidden="true" />;
  };

  const getBadgeStyle = (key) => {
    if (key === 'student') {
      return 'bg-[var(--brand-lavender)] text-primary';
    }
    return 'bg-primary/10 text-primary';
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Switch workspace. Current: ${active?.label}`}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'group flex w-full items-center gap-2 rounded-[12px] border border-black/[0.08] bg-white/75 px-2.5 py-1.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all',
          'hover:border-black/[0.14] hover:bg-white hover:shadow-[0_2px_5px_rgba(0,0,0,0.04)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          open && 'border-primary/40 bg-white ring-2 ring-primary/20',
        )}
      >
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-[8px] transition-transform group-hover:scale-105',
            getBadgeStyle(active?.key),
          )}
        >
          {getBadgeIcon(active?.key)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold tracking-tight text-foreground-strong">
            {active?.label}
          </span>
          <span className="block truncate text-[11px] font-medium text-[#7a867f]">
            {active?.description || (active?.key === 'student' ? 'Student Practice' : 'Workspace')}
          </span>
        </span>

        <ChevronsUpDown
          size={14}
          aria-hidden="true"
          className="ml-1 shrink-0 text-[#8f9a93] transition-colors group-hover:text-foreground-strong"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Workspaces"
          className={cn(
            'absolute left-0 top-full z-50 mt-1.5 w-60 rounded-[18px] border border-black/[0.08] bg-white p-1.5',
            'shadow-[0_16px_40px_-10px_rgba(20,30,25,0.18)] backdrop-blur-md',
            'animate-in fade-in-0 zoom-in-95 duration-100',
          )}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            Workspaces
          </div>

          <div className="flex flex-col gap-0.5 pt-0.5">
            {products.map((item) => {
              const isSelected = item.key === current;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    'group/item flex w-full items-center gap-2.5 rounded-[12px] p-2 text-left transition-colors',
                    isSelected
                      ? 'bg-primary/5 text-foreground-strong'
                      : 'text-[#3d4a43] hover:bg-black/[0.04]',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-[8px]',
                      getBadgeStyle(item.key),
                    )}
                  >
                    {getBadgeIcon(item.key)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-foreground-strong">
                      {item.label}
                    </span>
                    <span className="block truncate text-[11px] text-muted">
                      {item.description}
                    </span>
                  </span>

                  {isSelected ? (
                    <Check size={14} className="shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <ArrowRight
                      size={13}
                      className="shrink-0 text-muted opacity-0 transition-opacity group-hover/item:opacity-100"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSwitcher;
