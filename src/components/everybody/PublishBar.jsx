import { useState } from 'react';
import { Eye } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';

/**
 * Draft / published state and the Publish button. `hasUnpublished` = the draft differs from the live site.
 * `canPublish` is false when the subscription does not allow publishing (explain why in `blockedReason`).
 */
function PublishBar({ hasUnpublished, publishedAt, version, canPublish = true, blockedReason, onPublish, onPreview }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-border bg-surface px-4 py-3">
      <StatusBadge status={hasUnpublished ? 'draft' : 'published'} label={hasUnpublished ? 'Unpublished changes' : 'Live'} />
      <p className="min-w-0 flex-1 text-sm text-muted">
        {publishedAt ? `Last published ${publishedAt}${version ? ` (v${version})` : ''}` : 'Not published yet'}
        {!canPublish && blockedReason ? <span className="block text-[#8a5a00]">{blockedReason}</span> : null}
      </p>
      <Button variant="outline" size="sm" onClick={onPreview}><Eye size={15} aria-hidden="true" /> Preview</Button>
      <Button size="sm" disabled={!hasUnpublished || !canPublish} onClick={() => setOpen(true)}>Publish</Button>
      <ConfirmDialog open={open} onOpenChange={setOpen} title="Publish your site?" description="Your changes go live for everyone straight away. You can roll back from version history." confirmLabel="Publish" onConfirm={onPublish} />
    </div>
  );
}

export default PublishBar;
