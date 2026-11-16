import { useState, useEffect, useRef } from 'react';
import { Badge, Banner, Button, Card, FileUpload, IconButton, Input, Select, Textarea, useToast } from '../../../components/ui/index.js';
import Book from '../../../components/data/Book.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { formatMoney } from '../../../utils/money.js';
import { wsApi } from '../api.js';
import { useOrg } from '../OrgContext.js';
import { useWsMutation } from '../useWorkspace.js';

const VIS = [
  { value: 'all_students', label: 'All students' },
  { value: 'paid', label: 'Only people who pay' },
];

const BOOK_TYPES = [
  { value: 'textbook', label: 'Textbook' },
  { value: 'slides', label: 'Slides' },
];

function AdminLibraryScreen() {
  const toast = useToast();
  const { org } = useOrg();
  const { data: books } = useWorkspace(); // Assuming useWorkspace fetches org books
  const [editing, setEditing] = useState(null);
  const [remove, setRemove] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    code: '',
    description: '',
    priceMinor: 0,
    visibility: 'all_students',
    bookType: 'textbook',
  });
  const [showUpload, setShowUpload] = useState(false);
  const uploadedRef = useRef(null);

  const del = useWsMutation((id, bookId) => wsApi.deleteBook(id, bookId), {
    onSuccess: () => toast.success('Book removed'),
  });

  const save = useWsMutation((id, body) => wsApi.saveBook(id, body), {
    onSuccess: () => {
      toast.success('Book saved');
      setEditing(null);
      setNewBook({
        title: '',
        code: '',
        description: '',
        priceMinor: 0,
        visibility: 'all_students',
        bookType: 'textbook',
      });
    },
    onError: (e) =>
      toast.error(
        e.code === 'PAYOUT_REQUIRED' ? 'Add a payout account first' : 'Could not save',
        e.message,
      ),
  });

  const handleUpload = async (file) => {
    if (!uploadedRef.current) return;
    const formData = new FormData();
    formData.append('file', uploadedRef.current.files[0]);
    formData.append('bookId', ''); // New book - will be handled separately
    // TODO: Implement upload flow
    toast.info('Upload initiated');
  };

  return (
    <Screen width="full">
      <PageHeader
        title="Library"
        subtitle="Organisation library: slides, textbooks, and notes"
        action={
          <Button size="sm" onClick={() => setShowUpload(true)}>
            <Plus size={15} />
            Add a book
          </Button>
        }
      />
      <div className="mt-6 space-y-6">
        {books?.length === 0 ? (
          <Card>
            <Card.Header>
              <Card.Title>Your library is empty</Card.Title>
            </Card.Header>
            <Card.Description>
              Add a book to get started. Free books work without a payout account.
            </Card.Description>
            <Button onClick={() => setShowUpload(true)}>Add first book</Button>
          </Card>
        ) : (
          <Card>
            <Card.Header>
              <Card.Title>{books?.length} {books?.length === 1 ? 'book' : 'books'}</Card.Title>
            </Card.Header>
            <Card.Description>
              Organisational library containing lecture slides, textbooks, and student notes.
            </Card.Description>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <Card>
          <Card.Header>Add a new book</Card.Header>
          <Card.Description>Add a new PDF to the organisation library</Card.Description>
          <FileUpload
            label="PDF file"
            accept="application/pdf,.pdf"
            maxBytes={25 * 1024 * 1024}
            hint="PDF, up to 25 MB"
            fileName={newBook.fileName || undefined}
            onFile={(f) => {
              setNewBook((prev) => ({ ...prev, fileName: f.name }));
              uploadedRef.current = document.createElement('input');
              uploadedRef.current.type = 'file';
              uploadedRef.current.accept = '.pdf';
              uploadedRef.current.files = [f];
            }}
            onRemove={() => setShowUpload(false)}
          />
          <Button type="submit" onClick={() => save.mutate(newBook)} disabled={!newBook.title.trim()}>
            Save book
          </Button>
          <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
        </Card>
      )}

      {/* Book list */}
      <Card>
        <Card.Header>
          <Card.Title>Books on shelf</Card.Title>
        </Card.Header>
        <Card.Description>{books?.length} books currently on shelf</Card.Description>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {(books ?? []).map((b) => (
            <li key={b.id} className="relative">
              <Book size="full" code={b.code || 'BOOK'} title={b.title} color={b.color} />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div>
                  <Badge variant={b.priceMinor ? 'lime' : 'outline'}>{formatMoney(b.priceMinor)}</Badge>
                  <span>{b.bookType} | {b.visibility}</span>
                </div>
                <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label={`Actions for ${b.title}`} size="sm" variant="ghost" {...p}><MoreHorizontal size={16} /></IconButton>} items={[
                  { label: 'Edit', icon: 'Pencil', onSelect: () => setEditing(b) },
                  { separator: true },
                  { label: 'Remove', icon: 'Trash2', danger: true, onSelect: () => setRemove(b) },
                ]} />
              </div>
            </li>
          ))}
        </ul>
        <Pagination className="mt-9" page={1} pageCount={1} onPageChange={() => {}} />
      </Card>
    </Screen>
  );
}

export default AdminLibraryScreen;
