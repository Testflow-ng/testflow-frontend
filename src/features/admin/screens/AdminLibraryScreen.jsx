import { useState } from 'react';
import { BookOpen, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmDialog,
  DropdownMenu,
  EmptyState,
  Field,
  FileUpload,
  IconButton,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from '../../../components/ui/index.js';
import Book from '../../../components/data/Book.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdminBooks } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';

const BLANK = { title: '', code: '', description: '', priceMinor: 0, visibility: 'all_students', bookType: 'textbook' };
const VIS = [
  { value: 'all_students', label: 'All students' },
  { value: 'paid', label: 'Only people who pay' },
];
const BOOK_TYPES = [
  { value: 'textbook', label: 'Textbook' },
  { value: 'slides', label: 'Slides' },
];

/** The platform library: every book admins publish for organisations to read. */
function AdminLibraryScreen() {
  const toast = useToast();
  const { data, error, isLoading } = useAdminBooks();
  const books = data?.books ?? [];
  const [editing, setEditing] = useState(null);
  const [remove, setRemove] = useState(null);

  const removeBook = async (book) => {
    setRemove(null);
    try {
      await adminApi.deleteLibraryBook(book.id);
      toast.success('Book removed');
    } catch (e) {
      toast.error('Could not remove the book', e?.message);
    }
  };

  return (
    <Screen width="full">
      <PageHeader
        title="Library"
        subtitle="Organisation library: slides, textbooks, and notes"
        action={
          <Button size="sm" leadingIcon={<Plus size={15} />} onClick={() => setEditing(BLANK)}>
            Add a book
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        {error ? (
          <LoadError error={error} what="the library" />
        ) : isLoading ? (
          <TableSkeleton rows={3} />
        ) : books.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Your library is empty"
            description="Add a PDF and choose who can read it."
            action={<Button onClick={() => setEditing(BLANK)}>Add first book</Button>}
          />
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {books.map((b) => (
              <li key={b.id}>
                <Book size="full" code={b.code || 'BOOK'} title={b.title} color={b.color} />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Badge variant={b.priceMinor ? 'lime' : 'outline'}>{b.priceMinor ? formatMoney(b.priceMinor) : 'Free'}</Badge>
                  <DropdownMenu
                    placement="bottom-end"
                    trigger={(p) => (
                      <IconButton aria-label={`Actions for ${b.title}`} size="sm" variant="ghost" {...p}>
                        <MoreHorizontal size={16} strokeWidth={1.6} aria-hidden="true" />
                      </IconButton>
                    )}
                    items={[
                      { label: 'Edit', icon: Pencil, onSelect: () => setEditing(b) },
                      { separator: true },
                      { label: 'Remove', icon: Trash2, danger: true, onSelect: () => setRemove(b) },
                    ]}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {b.bookType ?? 'textbook'} · {b.visibility === 'paid' ? 'Paid' : 'All students'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && <BookModal key={editing.id ?? 'new'} initial={editing} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={Boolean(remove)}
        onOpenChange={(o) => !o && setRemove(null)}
        tone="danger"
        title={`Remove ${remove?.title ?? 'this book'}?`}
        description="Students lose access to it."
        confirmLabel="Remove"
        onConfirm={() => remove && removeBook(remove)}
      />
    </Screen>
  );
}

function BookModal({ initial, onClose }) {
  const toast = useToast();
  const [b, setB] = useState({ ...BLANK, ...initial });
  const [file, setFile] = useState(null);
  const set = (k) => (v) => setB((x) => ({ ...x, [k]: v }));
  const isNew = !initial?.id;

  const save = useAdminMutation(
    async () => {
      const body = {
        title: b.title.trim(),
        code: b.code.trim().toUpperCase(),
        description: b.description,
        priceMinor: b.priceMinor ?? 0,
        visibility: b.visibility,
        bookType: b.bookType,
      };
      if (!file) {
        if (isNew) return adminApi.createLibraryBook(body);
        return adminApi.updateLibraryBook(initial.id, body);
      }
      const form = new FormData();
      form.append('file', file);
      Object.entries(body).forEach(([k, v]) => form.append(k, v));
      return adminApi.uploadLibraryBook(initial.id, form);
    },
    {
      onSuccess: () => {
        toast.success('Book saved');
        onClose();
      },
      onError: (e) => toast.error('Could not save', e?.message),
    },
  );

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={isNew ? 'Add a book' : 'Edit book'}
      description="PDF files up to 25 MB."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={save.isPending} disabled={!b.title.trim()} onClick={() => save.mutate()}>
            Save book
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">
        <Field label="Title" required>
          <Input value={b.title} maxLength={120} onChange={(e) => set('title')(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Short code" hint="Shown on the cover">
            <Input value={b.code} maxLength={10} onChange={(e) => set('code')(e.target.value.toUpperCase())} />
          </Field>
          <Field label="Price (₦)" hint="0 is free">
            <Input
              type="number"
              min="0"
              value={(b.priceMinor ?? 0) / 100}
              onChange={(e) => set('priceMinor')(Math.round(Number(e.target.value || 0) * 100))}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Who can read it">
            <Select value={b.visibility} onValueChange={set('visibility')} options={VIS} />
          </Field>
          <Field label="Type">
            <Select value={b.bookType} onValueChange={set('bookType')} options={BOOK_TYPES} />
          </Field>
        </div>
        <Field label="About this book">
          <Textarea rows={3} value={b.description} maxLength={500} onChange={(e) => set('description')(e.target.value)} />
        </Field>
        <FileUpload
          label="PDF file"
          accept="application/pdf,.pdf"
          maxBytes={25 * 1024 * 1024}
          hint="PDF, up to 25 MB"
          fileName={file?.name}
          onFile={setFile}
          onRemove={() => setFile(null)}
        />
      </div>
    </Modal>
  );
}

export default AdminLibraryScreen;
