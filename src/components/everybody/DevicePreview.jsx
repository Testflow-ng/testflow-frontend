import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Frame for previewing the site at desktop or phone width. Children render inside (use `SiteRenderer`).
 * The phone frame is 375px wide with a rounded bezel; the desktop frame has a browser bar showing `host`.
 */
function DevicePreview({ children, host = 'yourname.testflow.com.ng', className }) {
  const [device, setDevice] = useState('desktop');
  return (
    <section aria-label="Site preview" className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-bold text-foreground-strong">Preview</h3>
        <SegmentedControl size="sm" label="Preview size" value={device} onValueChange={setDevice} options={[{ value: 'desktop', label: <span className="inline-flex items-center gap-1.5"><Monitor size={14} aria-hidden="true" />Desktop</span> }, { value: 'phone', label: <span className="inline-flex items-center gap-1.5"><Smartphone size={14} aria-hidden="true" />Phone</span> }]} />
      </div>
      <div className="overflow-auto rounded-[24px] bg-[var(--brand-lavender)]/50 p-4">
        {device === 'phone' ? (
          <div className="mx-auto w-[375px] max-w-full overflow-hidden rounded-[36px] border-[8px] border-[#0b110e] bg-background shadow-xl">
            <div className="max-h-[640px] overflow-y-auto">{children}</div>
          </div>
        ) : (
          <div className="mx-auto overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
            <div className="flex items-center gap-3 border-b border-border bg-surface-strong px-3 py-2">
              <span className="flex gap-1.5" aria-hidden="true"><i className="size-2.5 rounded-full bg-[#ee6a5f]" /><i className="size-2.5 rounded-full bg-[#f5bd4f]" /><i className="size-2.5 rounded-full bg-[#61c554]" /></span>
              <span className="truncate rounded-full bg-surface px-3 py-0.5 text-xs text-muted">{host}</span>
            </div>
            <div className="max-h-[520px] overflow-y-auto">{children}</div>
          </div>
        )}
      </div>
    </section>
  );
}

export default DevicePreview;
