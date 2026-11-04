import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Tabs, { TabPanel } from '../ui/Tabs.jsx';
import TagInput from '../ui/TagInput.jsx';
import FileUpload from '../ui/FileUpload.jsx';
import Badge from '../ui/Badge.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const pullEmails = (text) => [...new Set(text.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter((s) => EMAIL.test(s)))];

const LABEL = { added: ['New account', 'success'], linked: ['Existing account', 'neutral'], already: ['Already a student', 'warning'] };

/**
 * Add students by email. Students do not sign themselves up on the organisation's site: each address
 * you add gets a message from the organisation with a link to choose a password (or sign in, if they
 * already have a Testflow account). `onAdd(emails)` resolves with `{ results: [{ email, status }] }`.
 */
function AddStudentsDialog({ open, onOpenChange, onAdd, maxEmails = 100 }) {
  const [tab, setTab] = useState('emails');
  const [emails, setEmails] = useState([]);
  const [csv, setCsv] = useState({ name: '', emails: [] });
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);

  const list = tab === 'emails' ? emails : csv.emails;
  const tooMany = list.length > maxEmails;

  const close = (next) => {
    if (!next) (setResults(null), setEmails([]), setCsv({ name: '', emails: [] }));
    onOpenChange(next);
  };

  const send = async () => {
    setBusy(true);
    try {
      const res = await onAdd?.(list);
      setResults(res?.results ?? []);
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
      title={results ? 'Students added' : 'Add students'}
      description={results ? 'Each new student got an email from you with a link to choose a password.' : 'Enter their email addresses. They get an email from you with a link to set a password, then sign in on your site.'}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => close(false)} disabled={busy}>{results ? 'Done' : 'Cancel'}</Button>
          {!results && (
            <Button onClick={send} disabled={busy || tooMany || list.length === 0} aria-busy={busy}>
              {`Add ${list.length || ''} ${list.length === 1 ? 'student' : 'students'}`}
            </Button>
          )}
        </div>
      }
    >
      {results ? (
        <ul className="flex flex-col gap-2 pb-2">
          {results.map((r) => {
            const [text, variant] = LABEL[r.status] ?? [r.status, 'neutral'];
            return (
              <li key={r.email} className="flex items-center justify-between gap-3 rounded-xl bg-surface-strong/60 px-3 py-2 text-sm">
                <span className="min-w-0 truncate text-foreground-strong">{r.email}</span>
                <Badge variant={variant}>{text}</Badge>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col gap-5 pb-2">
          <Tabs idPrefix="addstudents" label="How to add" value={tab} onValueChange={setTab} items={[{ value: 'emails', label: 'Emails' }, { value: 'csv', label: 'CSV file' }]} />
          <TabPanel idPrefix="addstudents" value="emails" active={tab}>
            <TagInput label="Email addresses" max={maxEmails} value={emails} onChange={(v) => setEmails(v.filter((e) => EMAIL.test(e)))} placeholder="name@example.com, press Enter" />
          </TabPanel>
          <TabPanel idPrefix="addstudents" value="csv" active={tab}>
            <FileUpload label="CSV or text file" accept="text/csv,text/plain,.csv" maxBytes={512 * 1024} hint="One email per line, or comma separated" fileName={csv.name || undefined} onRemove={() => setCsv({ name: '', emails: [] })} onFile={async (f) => setCsv({ name: f.name, emails: pullEmails(await f.text()) })} />
            {csv.name && <p className="mt-2 text-sm text-muted">{csv.emails.length} valid {csv.emails.length === 1 ? 'address' : 'addresses'} found{tooMany ? `. Maximum is ${maxEmails} at a time.` : '.'}</p>}
          </TabPanel>
        </div>
      )}
    </Modal>
  );
}

export default AddStudentsDialog;
