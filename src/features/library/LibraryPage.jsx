import AdSlot from '../advertising/AdSlot.jsx';
import { hasLibraryAccess, useEntitlement } from '../billing/useBilling.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bookmark, Search } from 'lucide-react';
import { Badge, Button, EmptyState, SearchField, Skeleton, useToast } from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import Book from '../../components/data/Book.jsx';
import Pagination from '../../components/data/Pagination.jsx';
import { useBooks, useDownloadBook, useReading, useSetBookmark } from './useLibrary.js';
import { saveFile } from './download.js';
import BookDetailModal from './components/BookDetailModal.jsx';
import ContinueReading from './components/ContinueReading.jsx';

const PAGE_SIZE = 12;

/** The shelf: search, bookmarks, what you were reading, and a paged grid of covers. */
function LibraryPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  /* Bookmark state we have just changed, so the card and the dialog agree even
     when the shelf is filtered to bookmarks and the book drops out of the list. */
  const [bookmarkOverrides, setBookmarkOverrides] = useState({});

  const params = { q: query, page, limit: PAGE_SIZE, filter: bookmarksOnly ? 'bookmarks' : 'all' };
  const { data, isPending, isError, error, refetch, isFetching } = useBooks(params);
  const { data: reading } = useReading();
  const setBookmark = useSetBookmark();
  const download = useDownloadBook();
  const { data: held } = useEntitlement();
  const locked = !hasLibraryAccess(held);

  const books = data?.books ?? [];
  const bookmarked = (book) => bookmarkOverrides[book.id] ?? book.bookmarked;
  /* Read the open book from the list so a refetch updates it, and fall back to
     the copy taken at click time when it is no longer on the page. */
  const selectedBook = selected ? { ...selected, ...(books.find((b) => b.id === selected.id) ?? {}), bookmarked: bookmarked(selected) } : null;
  const selectedProgress = selectedBook ? reading?.find((r) => r.bookId === selectedBook.id) : null;

  const submitSearch = (event) => {
    event.preventDefault();
    setQuery(draft.trim());
    setPage(1);
  };

  const toggleBookmarks = () => {
    setBookmarksOnly((value) => !value);
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
      onError: () => toast.error('Could not prepare that download.'),
    });
  };

  const openReader = (book, atPage) => {
    setSelected(null);
    navigate(`/library/${book.id}/read${atPage ? `?page=${atPage}` : ''}`);
  };

  return (
    <Screen width="full">
      <PageHeader
        title="Library"
        subtitle="Past questions and study material, all in one place."
        action={data ? <Badge variant="lavender">{data.total} {data.total === 1 ? 'book' : 'books'}</Badge> : null}
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
          placeholder="Search by title, course code or topic"
          aria-label="Search books"
        />
        <div className="flex items-center gap-2">
          <Button type="submit" leadingIcon={<Search {...ICON} />}>
            Search
          </Button>
          <Button
            type="button"
            variant={bookmarksOnly ? 'primary' : 'outline'}
            aria-pressed={bookmarksOnly}
            onClick={toggleBookmarks}
            leadingIcon={<Bookmark {...ICON} className={bookmarksOnly ? 'fill-current' : ''} />}
          >
            Bookmarks
          </Button>
        </div>
      </form>

      {!query && !bookmarksOnly ? (
        <ContinueReading
          items={reading ?? []}
          onResume={(book, atPage) => navigate(`/library/${book.id}/read?page=${atPage}`)}
        />
      ) : null}

      <section className="mt-9" aria-labelledby="library-results">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="library-results" className="font-heading text-lg font-bold tracking-tight text-foreground-strong">
            {query ? `Results for “${query}”` : bookmarksOnly ? 'Your bookmarks' : 'All books'}
          </h2>
          {isFetching && !isPending ? <span className="text-xs text-muted">Updating…</span> : null}
        </div>

        {isPending ? (
          <ShelfSkeleton />
        ) : isError ? (
          <EmptyState
            className="mt-4"
            icon={AlertTriangle}
            title="We could not load the library"
            description={error?.message ?? 'Check your connection and try again.'}
            action={
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        ) : books.length === 0 ? (
          <EmptyState
            className="mt-4"
            mood="thinking"
            title={query ? `No books match “${query}”` : bookmarksOnly ? 'No bookmarks yet' : 'The library is empty'}
            description={
              query
                ? 'Try a different title, course code or topic.'
                : bookmarksOnly
                  ? 'Tap the bookmark on a book and it is saved here for later.'
                  : 'Books appear here as soon as they are published.'
            }
            action={
              query ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft('');
                    setQuery('');
                    setPage(1);
                  }}
                >
                  Clear search
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
              {books.map((book) => (
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
              ))}
            </ul>

            <Pagination className="mt-9" page={data.page} pageCount={data.pageCount} onPageChange={setPage} />
            {data.total > PAGE_SIZE ? (
              <p className="mt-3 text-center text-xs text-muted">
                Page {data.page} of {data.pageCount} · {data.total} books
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
        bookmarkBusy={setBookmark.isPending}
        downloading={download.isPending}
        locked={locked}
      />
      {/* One quiet slot under the shelf. The reader itself stays ad-free so reading is never interrupted. */}
      <AdSlot placement="content_feed" className="mt-10" />
    </Screen>
  );
}

/** Book covers keep their shape while the shelf loads, so the grid does not jump. */
function ShelfSkeleton({ count = PAGE_SIZE }) {
  return (
    <div role="status" aria-live="polite" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <span className="sr-only">Loading books</span>
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
