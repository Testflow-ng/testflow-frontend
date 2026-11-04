import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import TagInput from '../ui/TagInput.jsx';
import CopyField from '../ui/CopyField.jsx';
import Field from '../ui/Field.jsx';
import Select from '../ui/Select.jsx';
import RoleSelect from './RoleSelect.jsx';
import { INVITE_ROLES } from './roles.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Invite the people who help run the platform (admins and examiners). An email address is always
 * required: the invitation is tied to it, so the link only works for the account that owns that
 * address, even when the owner sends the link on WhatsApp instead of by email.
 *
 * `onInvite({ emails, role, expiresInDays })` resolves with `{ invitations: [{ email, link }] }`.
 * Students are not invited; they sign in on the organisation's own site.
 */
function InviteDialog({ open, onOpenChange, onInvite, maxEmails = 20 }) {
  const [emails, setEmails] = useState([]);
  const [role, setRole] = useState('admin');
  const [days, setDays] = useState('7');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);

  const close = (next) => {
    if (!next) (setSent(null), setEmails([]));
    onOpenChange(next);
  };

  const send = async () => {
    setBusy(true);
    try {
      const res = await onInvite?.({ emails, role, expiresInDays: Number(days) });
      setSent(res?.invitations ?? []);
    } catch {
      /* the caller shows the error */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={close}
      size="lg"
      title={sent ? 'Invitations sent' : 'Invite a teammate'}
      description={sent ? 'Each person got an email. You can also send their personal link yourself, for example on WhatsApp.' : 'They get an email with a link. The link only works for the email address you enter.'}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => close(false)} disabled={busy}>{sent ? 'Done' : 'Cancel'}</Button>
          {!sent && (
            <Button onClick={send} disabled={busy || emails.length === 0} aria-busy={busy}>
              {`Send ${emails.length || ''} ${emails.length === 1 ? 'invite' : 'invites'}`}
            </Button>
          )}
        </div>
      }
    >
      {sent ? (
        <div className="flex flex-col gap-4 pb-2">
          {sent.map((inv) => <CopyField key={inv.email} label={inv.email} value={inv.link} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-5 pb-2">
          <TagInput label="Email addresses" max={maxEmails} value={emails} onChange={(v) => setEmails(v.filter((e) => EMAIL.test(e)))} placeholder="name@example.com, press Enter" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role"><RoleSelect options={INVITE_ROLES} value={role} onValueChange={setRole} /></Field>
            <Field label="Link expires"><Select value={days} onValueChange={setDays} options={[{ value: '1', label: 'In 1 day' }, { value: '7', label: 'In 7 days' }, { value: '30', label: 'In 30 days' }]} /></Field>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default InviteDialog;
