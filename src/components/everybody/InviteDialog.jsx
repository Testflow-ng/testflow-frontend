import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Tabs, { TabPanel } from '../ui/Tabs.jsx';
import TagInput from '../ui/TagInput.jsx';
import FileUpload from '../ui/FileUpload.jsx';
import CopyField from '../ui/CopyField.jsx';
import Field from '../ui/Field.jsx';
import Select from '../ui/Select.jsx';
import RoleSelect from './RoleSelect.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const pullEmails = (text) => [...new Set(text.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter((s) => EMAIL.test(s)))];

/**
 * Invite people three ways: type emails, upload a CSV, or share a link. `onInvite(payload)` receives
 * { mode: 'emails'|'csv'|'link', emails?, role, expiresInDays, maxUses? }; for 'link' return the URL via `linkUrl`.
 * Bulk invites are capped at 500 (the API limit).
 */
function InviteDialog({ open, onOpenChange, onInvite, linkUrl, maxEmails = 500 }) {
  const [tab, setTab] = useState('emails');
  const [emails, setEmails] = useState([]);
  const [csv, setCsv] = useState({ name: '', emails: [] });
  const [role, setRole] = useState('student');
  const [days, setDays] = useState('7');
  const [busy, setBusy] = useState(false);

  const list = tab === 'emails' ? emails : csv.emails;
  const tooMany = list.length > maxEmails;
  const send = async () => {
    setBusy(true);
    try {
      await onInvite?.({ mode: tab, emails: tab === 'link' ? undefined : list, role, expiresInDays: Number(days) });
      if (tab !== 'link') (setEmails([]), setCsv({ name: '', emails: [] }), onOpenChange(false));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Invite people"
      description="They get an email with a link to join."
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Close</Button>
          <Button onClick={send} disabled={busy || tooMany || (tab !== 'link' && list.length === 0)} aria-busy={busy}>
            {tab === 'link' ? 'Create link' : `Send ${list.length || ''} ${list.length === 1 ? 'invite' : 'invites'}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <Tabs idPrefix="invite" label="How to invite" value={tab} onValueChange={setTab} items={[{ value: 'emails', label: 'Emails' }, { value: 'csv', label: 'CSV file' }, { value: 'link', label: 'Link' }]} />
        <TabPanel idPrefix="invite" value="emails" active={tab}>
          <TagInput label="Email addresses" max={maxEmails} value={emails} onChange={(v) => setEmails(v.filter((e) => EMAIL.test(e)))} placeholder="name@example.com, press Enter" />
        </TabPanel>
        <TabPanel idPrefix="invite" value="csv" active={tab}>
          <FileUpload label="CSV or text file" accept="text/csv,text/plain,.csv" maxBytes={512 * 1024} hint="One email per line, or comma separated" fileName={csv.name || undefined} onRemove={() => setCsv({ name: '', emails: [] })} onFile={async (f) => setCsv({ name: f.name, emails: pullEmails(await f.text()) })} />
          {csv.name && <p className="mt-2 text-sm text-muted">{csv.emails.length} valid {csv.emails.length === 1 ? 'address' : 'addresses'} found{tooMany ? `. Maximum is ${maxEmails}.` : '.'}</p>}
        </TabPanel>
        <TabPanel idPrefix="invite" value="link" active={tab}>
          {linkUrl ? <CopyField label="Invite link" value={linkUrl} /> : <p className="text-sm text-muted">Create a link anyone can use to join. It stops working on the date you choose.</p>}
        </TabPanel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role"><RoleSelect value={role} onValueChange={setRole} /></Field>
          <Field label="Link expires"><Select value={days} onValueChange={setDays} options={[{ value: '1', label: 'In 1 day' }, { value: '7', label: 'In 7 days' }, { value: '30', label: 'In 30 days' }]} /></Field>
        </div>
      </div>
    </Modal>
  );
}

export default InviteDialog;
