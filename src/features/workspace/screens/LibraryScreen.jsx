import { useState } from 'react';
import { BookOpen, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Banner, Button, ConfirmDialog, DropdownMenu, EmptyState, Field, FileUpload, IconButton, Input, Modal, Select, Textarea, useToast } from '../../../components/ui/index.js';
import Book from '../../../components/data/Book.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { wsApi } from '../api.js';
import { useOrg } from '../OrgContext.js';
import { useBooks, useWsMutation } from '../useWorkspace.js';

const BLANK = { title: '', code: '', description: '', priceMinor: 0, visibility: 'all_students', fileName: '' };
const VIS = [{ value: 'all_students', label: 'All my students' }, { value: 'paid', label: 'Only people who pay' }];

/** The organisation's own books and notes. Free, or priced (the money goes to their payout account). */
function LibraryScreen() {
  const toast = useToast();
  const { org } = useOrg();
  const { data } = useBooks();
  const [editing, setEditing] = useState(null);
  const [remove, setRemove] = useState(null);
  const del = useWsMutation((id, bookId) => wsApi.deleteBook(id, bookId), { onSuccess: () => toast.success('Book removed') });
  const noPayout = org.payout?.status !== 'active';

  return (
    <Screen width="full">
      <PageHeader title="Library" subtitle="Share notes and books, free or for a price." action={<Button size="sm" onClick={() => setEditing(BLANK)} leadingIcon={<Plus size={15} />}>Add a book</Button>} />
      <div className="mt-6 space-y-6">
        {noPayout && <Banner variant="info" action={<a href="/workspace/payments"><Button size="sm" variant="secondary">Add payout account</Button></a>}>To sell a book you need a payout account. Free books work without one.</Banner>}
        {data?.length === 0 ? <EmptyState icon={BookOpen} title="Your library is empty" description="Add a PDF and choose who can read it." action={<Button onClick={() => setEditing(BLANK)}>Add a book</Button>} /> : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {(data ?? []).map((b) => (
              <li key={b.id} className="relative">
                <Book size="full" code={b.code || 'BOOK'} title={b.title} color={b.color} />
                <div className="mt-2 flex items-center justify-between gap-2">
                  {b.priceMinor ? <Badge variant="lime">{formatMoney(b.priceMinor)}</Badge> : <Badge variant="outline">Free</Badge>}
                  <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label={`Actions for ${b.title}`} size="sm" variant="ghost" {...p}><MoreHorizontal size={16} /></IconButton>} items={[{ label: 'Edit', icon: Pencil, onSelect: () => setEditing(b) }, { separator: true }, { label: 'Remove', icon: Trash2, danger: true, onSelect: () => setRemove(b) }]} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {editing && <BookModal key={editing.id ?? 'new'} initial={editing} onClose={() => setEditing(null)} noPayout={noPayout} />}
      <ConfirmDialog open={Boolean(remove)} onOpenChange={(o) => !o && setRemove(null)} tone="danger" title={`Remove ${remove?.title}?`} description="Students lose access to it." confirmLabel="Remove" onConfirm={() => del.mutateAsync(remove.id)} />
    </Screen>
  );
}

function BookModal({ initial, onClose, noPayout }) {
  const toast = useToast();
  const [b, setB] = useState({ ...BLANK, ...initial });
  const set = (k) => (v) => setB((x) => ({ ...x, [k]: v }));
  const save = useWsMutation((id, body) => wsApi.saveBook(id, body), { onSuccess: () => { toast.success('Book saved'); onClose(); }, onError: (e) => toast.error(e.code === 'PAYOUT_REQUIRED' ? 'Add a payout account first' : 'Could not save', e.message) });
  const priced = (b.priceMinor ?? 0) > 0;
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={initial.id ? 'Edit book' : 'Add a book'} description="PDF files up to 25 MB."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={save.isPending} disabled={!b.title.trim() || (priced && noPayout)} onClick={() => save.mutate(b)}>Save book</Button></>}>
      <div className="space-y-4 py-1">
        <Field label="Title" required><Input value={b.title} maxLength={120} onChange={(e) => set('title')(e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Short code" hint="Shown on the cover"><Input value={b.code} maxLength={10} onChange={(e) => set('code')(e.target.value.toUpperCase())} /></Field>
          <Field label="Price (₦)" hint="0 is free"><Input type="number" min="0" value={(b.priceMinor ?? 0) / 100} onChange={(e) => set('priceMinor')(Math.round(Number(e.target.value || 0) * 100))} /></Field>
        </div>
        <Field label="Who can read it"><Select value={b.visibility} onValueChange={set('visibility')} options={VIS} /></Field>
        <Field label="About this book"><Textarea rows={3} value={b.description} maxLength={500} onChange={(e) => set('description')(e.target.value)} /></Field>
        <FileUpload label="PDF file" accept="application/pdf,.pdf" maxBytes={25 * 1024 * 1024} hint="PDF, up to 25 MB" fileName={b.fileName || undefined} onFile={(f) => set('fileName')(f.name)} onRemove={() => set('fileName')('')} />
        {priced && noPayout && <Banner variant="warning">Add a payout account before selling this book.</Banner>}
      </div>
    </Modal>
  );
}

export default LibraryScreen;
