import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';

/** Published versions, newest first: `versions` is [{ version, publishedAt, by }]. Rolling back publishes that version again. */
function VersionHistory({ versions, currentVersion, onRollback }) {
  const [target, setTarget] = useState(null);
  return (
    <>
      <ul className="divide-y divide-border rounded-[20px] border border-border bg-surface">
        {versions.map((v) => (
          <li key={v.version} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="font-heading text-base font-bold text-foreground-strong">Version {v.version}</span>
            {v.version === currentVersion && <Badge variant="success">Live</Badge>}
            <span className="min-w-0 flex-1 text-sm text-muted">{v.publishedAt}{v.by ? ` · ${v.by}` : ''}</span>
            {v.version !== currentVersion && <Button size="sm" variant="outline" onClick={() => setTarget(v)}><RotateCcw size={14} aria-hidden="true" /> Roll back</Button>}
          </li>
        ))}
      </ul>
      <ConfirmDialog open={Boolean(target)} onOpenChange={(o) => !o && setTarget(null)} title={target ? `Roll back to version ${target.version}?` : 'Roll back'} description="The live site changes to that version. Your current draft is kept." confirmLabel="Roll back" onConfirm={() => onRollback?.(target)} />
    </>
  );
}

export default VersionHistory;
