import { useEffect, useState } from 'react';
import { BookOpen, Images, MoreHorizontal, NotebookPen, Pencil, Plus, Trash2, X } from 'lucide-react';
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
  SegmentedControl,
  Textarea,
  useToast,
} from '../../../components/ui/index.js';
import Book from '../../../components/data/Book.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { useSubjects } from '../../subjects/useSubjects.js';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdminBooks, useAdminNotes } from '../useAdmin.js';
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
const LEVEL_FILTERS = [{ value: '', label: 'All levels' }, ...LEVELS.slice(1)];
const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'textbook', label: 'Textbooks' },
  { value: 'slides', label: 'Slides' },
  { value: 'notes', label: 'Notes' },
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('');
  const bookParams = {
    ...(typeFilter === 'textbook' || typeFilter === 'slides' ? { bookType: typeFilter } : {}),
    ...(levelFilter ? { level: Number(levelFilter) } : {}),
  };
  const noteParams = { ...(levelFilter ? { level: Number(levelFilter) } : {}) };
  const { data, error, isLoading } = useAdminBooks(bookParams);
  const { data: notesData, error: notesError, isLoading: notesLoading } = useAdminNotes(noteParams);
  const books = data?.books ?? [];
  const notes = notesData?.notes ?? [];
  const showBooks = typeFilter !== 'notes';
  const showNotes = typeFilter === 'notes' || typeFilter === 'all';
  const bothShown = showBooks && showNotes;
  const [editing, setEditing] = useState(null);
  const [noteEditing, setNoteEditing] = useState(false);
  const [remove, setRemove] = useState(null);
  const [removeNote, setRemoveNote] = useState(null);

  const removeBook = async (book) => {
    setRemove(null);
    try {
      await adminApi.deleteLibraryBook(book.id);
      toast.success('Book removed');
    } catch (e) {
      toast.error('Could not remove the book', e?.message);
    }
  };

  const removeNoteRow = async (note) => {
    setRemoveNote(null);
    try {
      await adminApi.deleteLibraryNote(note.id);
      toast.success('Note removed');
    } catch (e) {
      toast.error('Could not remove the note', e?.message);
    }
  };

  return (
    <Screen width="full">
      <PageHeader
        title="Library"
        subtitle="Organisation library: slides, textbooks, and notes"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" leadingIcon={<NotebookPen size={15} />} onClick={() => setNoteEditing(true)}>
              Add a note
            </Button>
            <Button size="sm" leadingIcon={<Plus size={15} />} onClick={() => setEditing(BLANK)}>
              Add a book
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <SegmentedControl options={TYPE_FILTERS} value={typeFilter} onValueChange={setTypeFilter} label="Item type" className="max-w-full" />
        </Field>
        <Field label="Level">
          <Select value={levelFilter} onValueChange={setLevelFilter} options={LEVEL_FILTERS} placeholder="All levels" />
        </Field>
      </div>

      <div className="mt-6 space-y-6">
        {showBooks ? (
          <section>
            {bothShown ? <h2 className="font-heading text-base font-bold text-foreground-strong">Books &amp; slides</h2> : null}
            {error ? (
              <div className="mt-3"><LoadError error={error} what="the library" /></div>
            ) : isLoading ? (
              <div className="mt-3"><TableSkeleton rows={3} /></div>
            ) : books.length === 0 ? (
              <EmptyState
                className="mt-3"
                icon={BookOpen}
                title="No books here"
                description={typeFilter === 'slides' ? 'Slides appear here when you publish them.' : 'Add a PDF and choose who can read it.'}
                action={<Button onClick={() => setEditing(BLANK)}>Add first book</Button>}
              />
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
          </section>
        ) : null}

        {showNotes ? (
          <section className={bothShown ? 'border-t border-border pt-6' : ''}>
            {bothShown ? <h2 className="font-heading text-base font-bold text-foreground-strong">Notes</h2> : null}
            {notesError ? (
              <div className="mt-3"><LoadError error={notesError} what="the notes" /></div>
            ) : notesLoading ? (
              <div className="mt-3"><TableSkeleton rows={3} /></div>
            ) : notes.length === 0 ? (
              <EmptyState
                className="mt-3"
                icon={NotebookPen}
                title="No notes yet"
                description="Class notes are images — scans or phone photos — mapped to a course and level."
                action={<Button onClick={() => setNoteEditing(true)}>Add first note</Button>}
              />
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {notes.map((n) => (
                  <li key={n.id}>
                    <Book size="full" code={n.subjectCode || 'NOTE'} title={n.title} color="amber" />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Badge variant="outline">
                        <Images size={12} className="mr-1 inline-block" aria-hidden="true" />
                        {n.imageCount ?? 0} {n.imageCount === 1 ? 'image' : 'images'}
                      </Badge>
                      <DropdownMenu
                        placement="bottom-end"
                        trigger={(p) => (
                          <IconButton aria-label={`Actions for ${n.title}`} size="sm" variant="ghost" {...p}>
                            <MoreHorizontal size={16} strokeWidth={1.6} aria-hidden="true" />
                          </IconButton>
                        )}
                        items={[{ label: 'Remove', icon: Trash2, danger: true, onSelect: () => setRemoveNote(n) }]}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {n.level ? `${n.level} level · ` : ''}
                      {n.semester === 'second' ? 'Second semester' : 'First semester'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>

      {editing && <BookModal key={editing.id ?? 'new'} initial={editing} onClose={() => setEditing(null)} />}
      {noteEditing && <NoteModal onClose={() => setNoteEditing(false)} />}

      <ConfirmDialog
        open={Boolean(remove)}
        onOpenChange={(o) => !o && setRemove(null)}
        tone="danger"
        title={`Remove ${remove?.title ?? 'this book'}?`}
        description="Students lose access to it."
        confirmLabel="Remove"
        onConfirm={() => remove && removeBook(remove)}
      />
      <ConfirmDialog
        open={Boolean(removeNote)}
        onOpenChange={(o) => !o && setRemoveNote(null)}
        tone="danger"
        title={`Remove ${removeNote?.title ?? 'this note'}?`}
        description="Students lose access to its images."
        confirmLabel="Remove"
        onConfirm={() => removeNote && removeNoteRow(removeNote)}
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

/**
 * The note composer: a note is class material as images (scans, photos), mapped to a course and
 * level — e.g. "MTH201, first semester, 100 level". Images attach in reading order, up to 10.
 * The create-then-upload flow mirrors books: the note row exists before its images are attached.
 */
function NoteModal({ onClose }) {
  const toast = useToast();
  const { data: subjects } = useSubjects();
  const [n, setN] = useState({ subjectCode: '', title: '', description: '', level: '100', semester: 'first', visibility: 'all_students' });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setN((x) => ({ ...x, [k]: v }));

  // Free the object URLs when the modal closes, so previews do not leak.
  useEffect(() => () => {
    setImages((current) => {
      for (const item of current) URL.revokeObjectURL(item.previewUrl);
      return current;
    });
  }, []);

  const courseOptions = [
    { value: '', label: 'Choose a course' },
    ...(subjects ?? []).map((s) => ({ value: s.code, label: `${s.code} · ${s.title}` })),
  ];

  // Picking a course fills the level from the course, so the admin only overrides it when the
  // note predates the mapping.
  const pickCourse = (code) => {
    const subject = (subjects ?? []).find((s) => s.code === code);
    setN((x) => ({
      ...x,
      subjectCode: code,
      level: subject?.level ? String(subject.level) : x.level,
    }));
  };

  const addImages = (files) => {
    setImages((current) => {
      const room = 10 - current.length;
      if (room <= 0) {
        toast.error('That is the limit', 'A note can hold up to 10 images.');
        return current;
      }
      return [...current, ...files.slice(0, room).map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) }))];
    });
  };

  const removeImage = (id) => {
    setImages((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((entry) => entry.id !== id);
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const note = await adminApi.createLibraryNote({
        subjectCode: n.subjectCode,
        title: n.title.trim(),
        description: n.description.trim(),
        level: Number(n.level) || 100,
        semester: n.semester,
        visibility: n.visibility,
      });
      if (images.length && note?.id) {
        try {
          await adminApi.uploadLibraryNoteImages(note.id, images.map((entry) => entry.file));
          toast.success('Note published');
        } catch (e) {
          // The note itself is saved; only the images failed, and they can be attached again.
          toast.error('Note saved, but the images failed to upload', e?.message);
        }
      } else {
        toast.success('Note published');
      }
      onClose();
    } catch (e) {
      toast.error('Could not save the note', e?.message);
    } finally {
      setSaving(false);
    }
  };

  const needsCourse = !n.subjectCode;
  const needsTitle = !n.title.trim();

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="Add a note"
      description="Class notes as images, mapped to a course and level."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} disabled={needsCourse || needsTitle} onClick={save}>
            Save note
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Course" hint="The note maps to this course" required>
            <Select value={n.subjectCode} onValueChange={pickCourse} options={courseOptions} placeholder="Choose a course" searchable />
          </Field>
          <Field label="Level">
            <Select value={n.level} onValueChange={set('level')} options={LEVELS.slice(1)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Semester">
            <Select value={n.semester} onValueChange={set('semester')} options={SEMESTERS} />
          </Field>
          <Field label="Who can read it">
            <Select value={n.visibility} onValueChange={set('visibility')} options={VIS} />
          </Field>
        </div>
        <Field label="Title" required>
          <Input value={n.title} maxLength={200} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. Limits — Week 3" />
        </Field>
        <Field label="About this note" hint="Optional">
          <Textarea rows={2} value={n.description} maxLength={500} onChange={(e) => set('description')(e.target.value)} placeholder="e.g. Chapters 3–4, L'Hôpital's rule" />
        </Field>
        <div>
          <FileUpload
            label="Images"
            accept="image/png,image/jpeg,image/webp"
            maxBytes={2 * 1024 * 1024}
            multiple
            onFiles={addImages}
            hint="PNG, JPEG or WebP, up to 2 MB each · up to 10 images, in reading order"
          />
          {images.length ? (
            <div className="mt-3">
              <p className="mb-2 text-xs text-muted">
                {images.length} of 10 images
              </p>
              <ul className="grid grid-cols-5 gap-2">
                {images.map((item) => (
                  <li key={item.id} className="relative overflow-hidden rounded-xl border border-border">
                    <img src={item.previewUrl} alt="" className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        {needsCourse ? <p className="text-xs text-danger">Pick the course this note belongs to.</p> : null}
        {!needsCourse && needsTitle ? <p className="text-xs text-danger">Add a title before saving.</p> : null}
      </div>
    </Modal>
  );
}

export default AdminLibraryScreen;
