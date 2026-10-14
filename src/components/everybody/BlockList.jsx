import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import DropdownMenu from '../ui/DropdownMenu.jsx';
import Button from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

import { BLOCK_TYPES } from './blockTypes.js';

const labelOf = (type) => BLOCK_TYPES.find((b) => b.type === type)?.label ?? type;

/**
 * Ordered list of site blocks. Reorder with the up/down buttons (works with keyboard and screen readers; each
 * move is announced). `blocks` is [{ id, type }]; `max` caps the count (the API allows 12).
 * Callbacks: onSelect(id), onMove(id, -1|1), onRemove(id), onAdd(type).
 */
function BlockList({ blocks, selectedId, onSelect, onMove, onRemove, onAdd, max = 12, className }) {
  return (
    <div className={className}>
      <ol className="space-y-2" aria-label="Page sections">
        {blocks.map((b, i) => (
          <li key={b.id} className={cn('flex items-center gap-1 rounded-2xl border bg-surface p-1.5 pl-2', b.id === selectedId ? 'border-primary ring-2 ring-primary/15' : 'border-border')}>
            <GripVertical size={16} aria-hidden="true" className="shrink-0 text-muted" />
            <button type="button" onClick={() => onSelect(b.id)} aria-current={b.id === selectedId ? 'true' : undefined} className="min-w-0 flex-1 truncate rounded-lg px-2 py-2 text-left text-[15px] font-semibold text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="mr-2 text-xs font-bold text-muted">{i + 1}</span>
              {labelOf(b.type)}
            </button>
            <button type="button" onClick={() => onMove(b.id, -1)} disabled={i === 0} aria-label={`Move ${labelOf(b.type)} up`} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <ArrowUp size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onMove(b.id, 1)} disabled={i === blocks.length - 1} aria-label={`Move ${labelOf(b.type)} down`} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-strong disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <ArrowDown size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onRemove(b.id)} aria-label={`Remove ${labelOf(b.type)}`} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center justify-between gap-3">
        <DropdownMenu placement="bottom-start" trigger={(p) => <Button variant="outline" size="sm" disabled={blocks.length >= max} {...p}><Plus size={16} aria-hidden="true" /> Add section</Button>} items={BLOCK_TYPES.map((t) => ({ label: t.label, onSelect: () => onAdd(t.type) }))} />
        <p className="text-xs text-muted">{blocks.length} / {max} sections</p>
      </div>
      <p className="sr-only" role="status" aria-live="polite" id="block-status" />
    </div>
  );
}

export default BlockList;
