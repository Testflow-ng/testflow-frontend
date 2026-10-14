import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Textarea from '../ui/Textarea.jsx';
import Field from '../ui/Field.jsx';
import Checkbox from '../ui/Checkbox.jsx';

/** Reject an ad: a written reason (5+ characters, shown to the advertiser) and an optional refund. */
function RejectDialog({ open, onOpenChange, title = 'Reject this ad?', onConfirm }) {
  const [reason, setReason] = useState('');
  const [refund, setRefund] = useState(false);
  const [busy, setBusy] = useState(false);
  const close = (next) => {
    if (!next) (setReason(''), setRefund(false));
    onOpenChange(next);
  };
  const submit = async () => {
    setBusy(true);
    try {
      await onConfirm?.({ reason: reason.trim(), refund });
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
      description="The advertiser sees your reason and can edit and resubmit."
      dismissible={!busy}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => close(false)} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={submit} disabled={reason.trim().length < 5 || busy} aria-busy={busy}>Reject</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Reason" hint="At least 5 characters." required>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <Checkbox label="Refund the payment" hint="Returns the advertiser's money through the payment provider." checked={refund} onChange={(e) => setRefund(e.target.checked)} />
      </div>
    </Modal>
  );
}

export default RejectDialog;
