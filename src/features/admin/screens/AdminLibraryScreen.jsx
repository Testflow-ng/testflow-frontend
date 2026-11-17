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
import { useSubjects } from '../../subjects/useSubjects.js';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdminBooks } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';

const BLANK = {
  title: '',
  code: '',
  description: '',
  level: '',
  semester: 'first',
  color: 'ink',
  priceMinor: 0,
  visibility: 'all_students',
  bookType: 'textbook',
};
const VIS = [
  { value: 'all_students', label: 'All students' },
  { value: 'paid', label: 'Only people who pay' },
];
const BOOK_TYPES = [
  { value: 'textbook', label: 'Textbook' },
  { value: 'slides', label: 'Slides' },
];
const LEVELS = [
  { value: '', label: 'No level' },
  { value: '100', label: '100 level' },
  { value: '200', label: '200 level' },
  { value: '300', label: '300 level' },
  { value: '400', label: '400 level' },
  { value: '500', label: '500 level' },
];
const SEMESTERS = [
  { value: 'first', label: 'First semester' },
  { value: 'second', label: 'Second semester' },
];
const COLORS = [
  { value: 'ink', label: 'Ink' },
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'amber', label: 'Amber' },
  { value: 'violet', label: 'Violet' },
  { value: 'teal', label: 'Teal' },
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
                  {b.level ? `${b.level} level · ` : ''}
                  {b.semester === 'second' ? 'Second semester' : 'First semester'}
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
  const { data: subjects } = useSubjects();
  const [b, setB] = useState({ ...BLANK, ...initial });
  const [file, setFile] = useState(null);
  const set = (k) => (v) => setB((x) => ({ ...x, [k]: v }));
  const isNew = !initial?.id;

  const courseOptions = [
    { value: '', label: 'No course' },
    ...(subjects ?? []).map((s) => ({ value: s.code, label: `${s.code} · ${s.title}` })),
  ];

  // Picking a course fills the short code (and title, if it is still empty) so
  // the admin only types what the course does not already answer.
  const pickCourse = (code) => {
    const subject = (subjects ?? []).find((s) => s.code === code);
    setB((x) => ({
      ...x,
      code,
      title: x.title.trim() ? x.title : subject?.title ?? '',
      level: x.level || (subject?.level ? String(subject.level) : ''),
    }));
  };

  const save = useAdminMutation(
    async () => {
      const body = {
        title: b.title.trim() || b.code.trim() || 'Untitled book',
        code: b.code.trim().toUpperCase(),
        description: b.description?.trim() ?? '',
        color: b.color,
        level: Number(b.level) || 100,
        semester: b.semester,
        priceMinor: b.priceMinor ?? 0,
        visibility: b.priceMinor > 0 ? 'paid' : b.visibility,
        bookType: b.bookType,
      };
      // A book row must exist before its PDF can be attached: create (or update)
      // the metadata first, then upload the file against the returned id. This is
      // the create-then-upload flow the backend expects; uploading to a "new" id
      // is what produced the 422.
      const saved = isNew ? await adminApi.createLibraryBook(body) : await adminApi.updateLibraryBook(initial.id, body);
      const id = saved?.id ?? saved?._id ?? initial.id;
      if (file && id) await adminApi.uploadLibraryBook(id, file);
      return saved;
    },
    {
      onSuccess: () => {
        toast.success('Book saved');
        onClose();
      },
      onError: (e) => toast.error('Could not save', e?.message),
    },
  );

  const needsCode = isNew && !b.code.trim() && !b.title.trim();

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={isNew ? 'Add a book' : 'Edit book'}
      description="Attach a PDF now or save the details and add it later."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={save.isPending} disabled={needsCode} onClick={() => save.mutate()}>
            Save book
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Course" hint="Optional — fills the code">
            <Select value={b.code} onValueChange={pickCourse} options={courseOptions} placeholder="Choose a course" searchable />
          </Field>
          <Field label="Level">
            <Select value={b.level} onValueChange={set('level')} options={LEVELS} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" hint="Optional — defaults to the code">
            <Input value={b.title} maxLength={120} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. Elementary Mathematics I" />
          </Field>
          <Field label="Short code" hint="Shown on the cover" required>
            <Input value={b.code} maxLength={10} onChange={(e) => set('code')(e.target.value.toUpperCase())} placeholder="e.g. MTH101" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Semester">
            <Select value={b.semester} onValueChange={set('semester')} options={SEMESTERS} />
          </Field>
          <Field label="Cover colour">
            <Select value={b.color} onValueChange={set('color')} options={COLORS} />
          </Field>
        </div>
        <Field label="About this book" hint="Optional">
          <Textarea rows={3} value={b.description ?? ''} maxLength={500} onChange={(e) => set('description')(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Who can read it">
            <Select value={b.visibility} onValueChange={set('visibility')} options={VIS} />
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
        <Field label="Type">
          <Select value={b.bookType} onValueChange={set('bookType')} options={BOOK_TYPES} />
        </Field>
        <FileUpload
          label="PDF file"
          accept="application/pdf,.pdf"
          maxBytes={25 * 1024 * 1024}
          hint="PDF, up to 25 MB"
          fileName={file?.name ?? (initial.fileName || undefined)}
          onFile={setFile}
          onRemove={() => setFile(null)}
        />
        {needsCode ? <p className="text-xs text-danger">Add a short code or title before saving.</p> : null}
      </div>
    </Modal>
  );
}

export default AdminLibraryScreen;
