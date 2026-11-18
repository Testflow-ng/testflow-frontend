import AdSlot from '../advertising/AdSlot.jsx';
import { hasLibraryAccess, useEntitlement } from '../billing/useBilling.js';
import { useAuth } from '../auth/useAuth.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bookmark, Search } from 'lucide-react';
import { Badge, Banner, Button, EmptyState, SearchField, Select, SegmentedControl, Skeleton, useToast } from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import Book from '../../components/data/Book.jsx';
import Pagination from '../../components/data/Pagination.jsx';
import { useBooks, useDownloadBook, useNotes, useReading, useSetBookmark } from './useLibrary.js';
import { useSubjects } from '../subjects/useSubjects.js';
import { saveFile } from './download.js';
import BookDetailModal from './components/BookDetailModal.jsx';
import NoteDetailModal from './components/NoteDetailModal.jsx';
import ContinueReading from './components/ContinueReading.jsx';
import { useLibraryShare } from './useLibraryShare.js';

const PAGE_SIZE = 12;

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'textbook', label: 'Textbooks' },
  { value: 'slides', label: 'Slides' },
  { value: 'notes', label: 'Notes' },
];
const LEVEL_FILTERS = [
  { value: '', label: 'All levels' },
  { value: '100', label: '100 level' },
  { value: '200', label: '200 level' },
  { value: '300', label: '300 level' },
  { value: '400', label: '400 level' },
  { value: '500', label: '500 level' },
];
const headingFor = (typeFilter) =>
  typeFilter === 'notes' ? 'Notes' : typeFilter === 'textbook' ? 'Textbooks' : typeFilter === 'slides' ? 'Slides' : 'All books';

/** The shelf: search, filters, bookmarks, what you were reading, and a paged grid of covers. */
function LibraryPage({ isGatedPreview = false }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  /* Bookmark state we have just changed, so the card and the dialog agree even
     when the shelf is filtered to bookmarks and the book drops out of the list. */
  const [bookmarkOverrides, setBookmarkOverrides] = useState({});

  const { data: subjects } = useSubjects();
  const subjectOptions = [
    { value: '', label: 'All subjects' },
    ...(subjects ?? []).map((s) => ({ value: s.code, label: `${s.code} · ${s.title}` })),
  ];

  const notesView = typeFilter === 'notes';
  const bookParams = {
    q: query,
    page,
    limit: PAGE_SIZE,
    filter: bookmarksOnly ? 'bookmarks' : 'all',
    ...(typeFilter === 'textbook' || typeFilter === 'slides' ? { bookType: typeFilter } : {}),
    ...(levelFilter ? { level: Number(levelFilter) } : {}),
    ...(subjectFilter ? { subject: subjectFilter } : {}),
  };
  const noteParams = {
    q: query,
    page,
    limit: PAGE_SIZE,
    ...(levelFilter ? { level: Number(levelFilter) } : {}),
    ...(subjectFilter ? { subject: subjectFilter } : {}),
  };
  const { data, isPending, isError, error, refetch, isFetching } = useBooks(bookParams);
  const { data: notesData, isPending: notesPending, isError: notesErrorFlag, error: notesError, refetch: refetchNotes, isFetching: notesFetching } = useNotes(noteParams, notesView);
  const { data: reading } = useReading();
  const setBookmark = useSetBookmark();
  const download = useDownloadBook();
  const { data: held } = useEntitlement();
  const { user } = useAuth();
  const { shareBook, shareNote, pending: sharePending } = useLibraryShare();
  const locked = !hasLibraryAccess(held, user);

  const books = data?.books ?? [];
  const notes = notesData?.notes ?? [];
  const shown = notesView ? notes : books;
  const totalShown = notesView ? notesData?.total : data?.total;
  const bookmarked = (book) => bookmarkOverrides[book.id] ?? book.bookmarked;
  /* Read the open book from the list so a refetch updates it, and fall back to
     the copy taken at click time when it is no longer on the page. */
  const selectedBook = selected ? { ...selected, ...(books.find((b) => b.id === selected.id) ?? {}), bookmarked: bookmarked(selected) } : null;
  const selectedProgress = selectedBook ? reading?.find((r) => r.bookId === selectedBook.id) : null;

  const activeFetching = notesView ? notesFetching : isFetching;
  const activePending = notesView ? notesPending : isPending;
  const activeError = notesView ? notesErrorFlag : isError;
  const activeErrorDetail = notesView ? notesError : error;
  const retry = notesView ? refetchNotes : refetch;

  const submitSearch = (event) => {
    event.preventDefault();
    setQuery(draft.trim());
    setPage(1);
  };

  const toggleBookmarks = () => {
    setBookmarksOnly((value) => !value);
    setPage(1);
  };

  const onTypeChange = (value) => {
    setTypeFilter(value);
    setPage(1);
    setBookmarksOnly(false);
  };

  const onLevelChange = (value) => {
    setLevelFilter(value);
    setPage(1);
  };

  const onSubjectChange = (value) => {
    setSubjectFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setDraft('');
    setQuery('');
    setTypeFilter('all');
    setLevelFilter('');
    setSubjectFilter('');
    setBookmarksOnly(false);
    setPage(1);
  };

  const onToggleBookmark = (book) => {
    const next = !bookmarked(book);
    setBookmarkOverrides((map) => ({ ...map, [book.id]: next }));
    setBookmark.mutate(book.id, {
      onError: () => {
        setBookmarkOverrides((map) => ({ ...map, [book.id]: !next }));
        toast.error('Could not save that bookmark.');
      },
    });
  };

  const onDownload = (book) => {
    download.mutate(book.id, {
      onSuccess: (file) => {
        saveFile(file);
        toast.success(`Downloading ${book.code}`);
      },
      onError: (e) => toast.error(e?.message ?? 'Could not prepare that download.'),
    });
  };

  const openReader = (book, atPage) => {
    setSelected(null);
    navigate(`/library/${book.id}/read${atPage ? `?page=${atPage}` : ''}`);
  };

  return (
    <Screen width="full">
      {isGatedPreview ? (
        <Banner variant="info" className="mb-6">
          <strong>Admin preview:</strong> The library is currently gated for students while books are being added. Normal students see the &ldquo;Adding books&rdquo; screen.
        </Banner>
      ) : null}
      <PageHeader
        title="Library"
        subtitle="Past questions and study material, all in one place."
        action={
          totalShown != null ? (
            <Badge variant="lavender">
              {totalShown} {notesView ? (totalShown === 1 ? 'note' : 'notes') : totalShown === 1 ? 'book' : 'books'}
            </Badge>
          ) : null
        }
      />

      <form onSubmit={submitSearch} className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchField
          className="sm:max-w-md sm:flex-1"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onClear={() => {
            setDraft('');
            setQuery('');
            setPage(1);
          }}
          placeholder={notesView ? 'Search notes by title' : 'Search by title, course code or topic'}
          aria-label={notesView ? 'Search notes' : 'Search books'}
        />
        <div className="flex items-center gap-2">
          <Button type="submit" leadingIcon={<Search {...ICON} />}>
            Search
          </Button>
          {!notesView ? (
            <Button
              type="button"
              variant={bookmarksOnly ? 'primary' : 'outline'}
              aria-pressed={bookmarksOnly}
              onClick={toggleBookmarks}
              leadingIcon={<Bookmark {...ICON} className={bookmarksOnly ? 'fill-current' : ''} />}
            >
              Bookmarks
            </Button>
          ) : null}
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl options={TYPE_FILTERS} value={typeFilter} onValueChange={onTypeChange} label="Item type" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-60">
            <Select value={subjectFilter} onValueChange={onSubjectChange} options={subjectOptions} placeholder="All subjects" searchable aria-label="Filter by subject" />
          </div>
          <div className="sm:w-44">
            <Select value={levelFilter} onValueChange={onLevelChange} options={LEVEL_FILTERS} aria-label="Filter by level" />
          </div>
        </div>
      </div>

      {!query && !bookmarksOnly && !notesView && typeFilter === 'all' && !levelFilter && !subjectFilter ? (
        <ContinueReading
          items={reading ?? []}
          onResume={(book, atPage) => navigate(`/library/${book.id}/read?page=${atPage}`)}
        />
      ) : null}

      <section className="mt-9" aria-labelledby="library-results">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="library-results" className="font-heading text-lg font-bold tracking-tight text-foreground-strong">
            {query ? `Results for “${query}”` : bookmarksOnly ? 'Your bookmarks' : headingFor(typeFilter)}
          </h2>
          {activeFetching && !activePending ? <span className="text-xs text-muted">Updating…</span> : null}
        </div>

        {activePending ? (
          <ShelfSkeleton />
        ) : activeError ? (
          <EmptyState
            className="mt-4"
            icon={AlertTriangle}
            title={notesView ? 'We could not load the notes' : 'We could not load the library'}
            description={activeErrorDetail?.message ?? 'Check your connection and try again.'}
            action={
              <Button variant="outline" onClick={() => retry()}>
                Try again
              </Button>
            }
          />
        ) : shown.length === 0 ? (
          <EmptyState
            className="mt-4"
            mood="thinking"
            title={
              query
                ? `No ${notesView ? 'notes' : 'books'} match “${query}”`
                : bookmarksOnly
                  ? 'No bookmarks yet'
                  : notesView
                    ? 'No notes yet'
                    : 'The library is empty'
            }
            description={
              query
                ? 'Try a different title, course code or topic.'
                : bookmarksOnly
                  ? 'Tap the bookmark on a book and it is saved here for later.'
                  : notesView
                    ? 'Notes appear here as soon as they are published.'
                    : 'Books appear here as soon as they are published.'
            }
            action={
              query || levelFilter || subjectFilter || typeFilter !== 'all' ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear search and filters
                </Button>
              ) : bookmarksOnly ? (
                <Button variant="outline" onClick={toggleBookmarks}>
                  Show all books
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {!notesView
                ? books.map((book) => (
                    <li key={book.id} className="relative">
                      {bookmarked(book) ? (
                        <span
                          className="pointer-events-none absolute right-1 top-1 z-10 flex size-6 items-center justify-center rounded-full bg-surface shadow-sm"
                          title="Bookmarked"
                        >
                          <Bookmark size={13} className="fill-current text-primary" aria-hidden="true" />
                          <span className="sr-only">Bookmarked</span>
                        </span>
                      ) : null}
                      <Book
                        size="full"
                        code={book.code}
                        title={book.title}
                        color={book.color}
                        onSelect={() => setSelected(book)}
                      />
                    </li>
                  ))
                : notes.map((note) => (
                    <li key={note.id}>
                      <Book
                        size="full"
                        code={note.subjectCode || 'NOTE'}
                        title={note.title}
                        color="amber"
                        onSelect={() => setSelectedNote(note)}
                      />
                    </li>
                  ))}
            </ul>

            <Pagination className="mt-9" page={notesView ? notesData.page : data.page} pageCount={notesView ? notesData.pageCount : data.pageCount} onPageChange={setPage} />
            {totalShown > PAGE_SIZE ? (
              <p className="mt-3 text-center text-xs text-muted">
                Page {notesView ? notesData.page : data.page} of {notesView ? notesData.pageCount : data.pageCount} · {totalShown} {notesView ? 'notes' : 'books'}
              </p>
            ) : null}
          </>
        )}
      </section>

      <BookDetailModal
        book={selectedBook}
        open={Boolean(selectedBook)}
        onOpenChange={(next) => !next && setSelected(null)}
        progress={selectedProgress}
        onRead={() => openReader(selectedBook, selectedProgress?.page)}
        onToggleBookmark={() => onToggleBookmark(selectedBook)}
        onDownload={() => onDownload(selectedBook)}
        onShare={() => selectedBook && shareBook(selectedBook)}
        bookmarkBusy={setBookmark.isPending}
        downloading={download.isPending}
        sharing={sharePending}
        locked={locked}
      />
      <NoteDetailModal
        note={selectedNote}
        open={Boolean(selectedNote)}
        onOpenChange={(next) => !next && setSelectedNote(null)}
        locked={locked}
        onShare={() => selectedNote && shareNote(selectedNote)}
        sharing={sharePending}
      />
      {/* One quiet slot under the shelf. The reader itself stays ad-free so reading is never interrupted. */}
      <AdSlot placement="library" className="mt-10" />
    </Screen>
  );
}

/** Book covers keep their shape while the shelf loads, so the grid does not jump. */
function ShelfSkeleton({ count = PAGE_SIZE }) {
  return (
    <div role="status" aria-live="polite" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <span className="sr-only">Loading the shelf</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3" aria-hidden="true">
          <Skeleton className="aspect-[2/3] w-full rounded-[6px]" />
          <Skeleton className="h-3 w-4/5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default LibraryPage;
