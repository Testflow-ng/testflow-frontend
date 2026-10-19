import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import Textarea from './Textarea.jsx';
import Field from './Field.jsx';

/**
 * Confirm a risky action. `tone="danger"` makes the confirm button red. Set `requireReason` (with
 * `minReasonLength`) to ask for a written reason first (reject, suspend, refund); `onConfirm(reason)`
 * receives it. `onConfirm` may return a promise: the button shows busy until it settles.
 */
function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'primary', requireReason = false, minReasonLength = 5, reasonLabel = 'Reason', onConfirm }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const tooShort = requireReason && reason.trim().length < minReasonLength;

  const close = (next) => {
    if (!next) setReason('');
    onOpenChange(next);
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.(reason.trim());
      close(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={close}
      title={title}
      description={description}
      dismissible={!busy}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => close(false)} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={confirm} disabled={tooShort || busy} aria-busy={busy}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {requireReason && (
        <Field label={reasonLabel} hint={`At least ${minReasonLength} characters.`} required>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      )}
    </Modal>
  );
}

export default ConfirmDialog;
