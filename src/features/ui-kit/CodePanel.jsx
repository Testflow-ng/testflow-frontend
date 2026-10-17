import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Skeleton, Tabs, useToast } from '../../components/ui/index.js';
import { ICON } from '../../components/ui/iconProps.js';
import { highlight } from './highlight.jsx';
import { useSource } from './useSource.js';

function CodeBlock({ code, label }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy. Select the text instead.');
    }
  };

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#30363d] bg-[#0d1117]">
      <div className="flex items-center justify-between gap-3 border-b border-[#30363d] bg-[#161b22] px-4 py-2.5">
        <span className="truncate font-mono text-xs text-[#8b949e]">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-[#30363d] bg-[#21262d] px-3 text-xs font-semibold text-[#e6edf3] hover:bg-[#30363d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#79c0ff]"
        >
          {copied ? <Check {...ICON} size={14} /> : <Copy {...ICON} size={14} />}
          {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
      <pre className="max-h-[32rem] overflow-auto p-4 text-[13px] leading-relaxed text-[#e6edf3]" tabIndex={0} aria-label={`Code: ${label}`}>
        <code className="font-mono">{highlight(code)}</code>
      </pre>
    </div>
  );
}

/** Right panel. "Usage" is a written example; "Source" is the real file(s), read straight from the repo. */
function CodePanel({ entry, values }) {
  const [tab, setTab] = useState('usage');
  const sources = entry.source ? [].concat(entry.source) : [];
  const usage = typeof entry.usage === 'function' ? entry.usage(values) : entry.usage;
  const { items, loading } = useSource(sources, tab === 'source');

  const tabs = [{ value: 'usage', label: 'Usage example' }, ...(sources.length ? [{ value: 'source', label: 'Component source' }] : [])];

  return (
    <div className="w-full space-y-3">
      <Tabs items={tabs} value={tab} onValueChange={setTab} idPrefix="kit-code" label="Code views" />
      {tab === 'usage' ? (
        <>
          <CodeBlock code={usage} label="Example (JSX)" />
          <p className="px-1 text-xs text-muted">A written example of how to use it, not the implementation. Switch to Component source for the real code.</p>
        </>
      ) : loading ? (
        <Skeleton className="h-64 w-full rounded-[18px]" />
      ) : (
        <div className="space-y-4">
          {items.map((s) => (
            <CodeBlock key={s.path} code={s.code} label={s.path} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CodePanel;
