import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Read-only value with a copy button (DNS records, invite links, references). */
function CopyField({ label, value, mono = true, className }) {
  // idle | copied | selected
  const [state, setState] = useState('idle');
  const valueRef = useRef(null);

  const selectValue = () => {
    const node = valueRef.current;
    const selection = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!node || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const copy = async () => {
    let done = false;
    try {
      // Secure origins with permission and focus. Not every browser or context allows it.
      await navigator.clipboard.writeText(value);
      done = true;
    } catch {
      /* fall through */
    }
    if (!done) {
      try {
        // Older / unfocused / permission-blocked contexts. Runs inside the click.
        const area = document.createElement('textarea');
        area.value = value;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-1000px';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        done = document.execCommand('copy');
        document.body.removeChild(area);
      } catch {
        done = false;
      }
    }
    if (done) {
      setState('copied');
    } else {
      // Last resort: select the text so Cmd/Ctrl+C works, and say so.
      selectValue();
      setState('selected');
    }
    window.setTimeout(() => setState('idle'), 2200);
  };

  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-sm font-medium text-foreground-strong">{label}</p>}
      <div className="flex items-center gap-2 rounded-full border border-border-strong bg-surface-strong/60 py-1.5 pl-4 pr-1.5">
        <span ref={valueRef} className={cn('min-w-0 flex-1 select-all truncate text-sm text-foreground-strong', mono && 'font-mono')}>{value}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={state === 'selected' ? `Text selected, press ${isMac() ? 'Command C' : 'Control C'} to copy` : `Copy ${label ?? 'value'}`}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-surface px-3.5 text-sm font-semibold text-foreground-strong shadow-sm hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {state === 'copied' ? <Check size={15} aria-hidden="true" className="text-success" /> : <Copy size={15} aria-hidden="true" />}
          {state === 'copied' ? 'Copied' : state === 'selected' ? (isMac() ? 'Press ⌘C' : 'Press Ctrl+C') : 'Copy'}
          <span className="sr-only" role="status">
            {state === 'copied' ? 'Copied to clipboard' : state === 'selected' ? 'Clipboard blocked. The value is selected; press Command C or Control C.' : ''}
          </span>
        </button>
      </div>
    </div>
  );
}

export default CopyField;
