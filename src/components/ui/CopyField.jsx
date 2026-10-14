import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/** Read-only value with a copy button (DNS records, invite links, references). */
function CopyField({ label, value, mono = true, className }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the value is still selectable */
    }
  };
  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-sm font-medium text-foreground-strong">{label}</p>}
      <div className="flex items-center gap-2 rounded-full border border-border-strong bg-surface-strong/60 py-1.5 pl-4 pr-1.5">
        <span className={cn('min-w-0 flex-1 select-all truncate text-sm text-foreground-strong', mono && 'font-mono')}>{value}</span>
        <button type="button" onClick={copy} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-surface px-3.5 text-sm font-semibold text-foreground-strong shadow-sm hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {copied ? <Check size={15} aria-hidden="true" className="text-success" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
          <span className="sr-only" role="status">{copied ? 'Copied to clipboard' : ''}</span>
        </button>
      </div>
    </div>
  );
}

export default CopyField;
