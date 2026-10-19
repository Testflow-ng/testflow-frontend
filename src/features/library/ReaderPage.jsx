import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Bookmark, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button, EmptyState, IconButton, ProgressBar, SkeletonText, useToast } from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import { saveFile } from './download.js';
import { hasLibraryAccess, useEntitlement } from '../billing/useBilling.js';
import LibraryLocked from './components/LibraryLocked.jsx';
import { useBook, useBookPages, useDownloadBook, useReading, useSaveProgress, useSetBookmark } from './useLibrary.js';

/**
 * The reader. One page at a time, with the two things a student wants at hand:
 * save it or take it with them. Where they stop is written back on every page
 * change, which is what fills "Continue reading" on the shelf.
 */
function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  /* Where the reader opens. An explicit ?page wins; otherwise the student's own
     saved place, which the reading list supplies. `requested` is null until they
     turn a page, so the derived page stays correct when that list lands. */
  const [requested, setRequested] = useState(() => Number(searchParams.get('page')) || null);
  const [bookmarkOverride, setBookmarkOverride] = useState(null);

  const { data: book, isError: bookFailed, error: bookError, refetch: refetchBook } = useBook(id);
  const { data: reading } = useReading();
  const saveProgress = useSaveProgress();
  const setBookmark = useSetBookmark();
  const download = useDownloadBook();
  const { data: held } = useEntitlement();

  const saved = reading?.find((entry) => entry.bookId === id);
  /* Do not decide the starting page until the reading list has answered, or a
     book opened without ?page would open at 1 and overwrite a real place. */
  const resolvingStart = requested == null && reading === undefined;
  const page = Math.max(1, requested ?? saved?.page ?? 1);

  const { data: content, isPending, isError, error, refetch } = useBookPages(id, page);

  const totalPages = content?.totalPages ?? book?.pages ?? 1;
  const bookmarked = bookmarkOverride ?? book?.bookmarked ?? false;

  /* Record the visit, so the book shows up in "Continue reading" from here on.
     The guard makes the write idempotent: the mutation result is a new object
     on every render, so the effect re-runs, but only a page we have not already
     saved is written back. */
  const bookId = book?.id;
  const savedKey = useRef(null);
  useEffect(() => {
    if (!bookId || resolvingStart) return;
    const key = `${bookId}:${page}`;
    if (savedKey.current === key) return;
    savedKey.current = key;
    saveProgress.mutate({ id: bookId, page });
  }, [bookId, page, resolvingStart, saveProgress]);

  const goTo = (next) => {
    const clamped = Math.max(1, Math.min(totalPages, next));
    setRequested(clamped);
    setSearchParams({ page: String(clamped) }, { replace: true });
  };

  const onToggleBookmark = () => {
    const next = !bookmarked;
    setBookmarkOverride(next);
    setBookmark.mutate(id, {
      onError: () => {
        setBookmarkOverride(!next);
        toast.error('Could not save that bookmark.');
      },
    });
  };

  const onDownload = () => {
    download.mutate(id, {
      onSuccess: (file) => {
        saveFile(file);
        toast.success(`Downloading ${book?.code ?? 'book'}`);
      },
      onError: () => toast.error('Could not prepare that download.'),
    });
  };

  if (!hasLibraryAccess(held)) {
    return (
      <Screen width="md">
        <PageHeader back="/library" title={book?.title ?? 'Library'} />
        <div className="mt-8"><LibraryLocked onBack={() => navigate('/library')} /></div>
      </Screen>
    );
  }

  return (
    <Screen width="lg">
      <PageHeader
        back="/library"
        eyebrow={book?.code}
        title={book?.title ?? 'Reader'}
        subtitle={book ? `${book.author} · page ${page} of ${totalPages}` : undefined}
        action={
          <div className="flex items-center gap-1">
            <IconButton aria-label={`Download ${book?.code ?? 'book'}`} title="Download" onClick={onDownload} disabled={download.isPending}>
              <Download {...ICON} />
            </IconButton>
            <IconButton
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this book'}
              aria-pressed={bookmarked}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              onClick={onToggleBookmark}
              disabled={setBookmark.isPending}
              className={bookmarked ? 'text-primary' : undefined}
            >
              <Bookmark {...ICON} className={bookmarked ? 'fill-current' : ''} />
            </IconButton>
          </div>
        }
      />

      {bookFailed || isError ? (
        <EmptyState
          className="mt-6"
          icon={AlertTriangle}
          title="That page would not load"
          description={(error ?? bookError)?.message ?? 'Check your connection and try again.'}
          action={
            <Button
              variant="outline"
              onClick={() => {
                refetchBook();
                refetch();
              }}
            >
              Try again
            </Button>
          }
        />
      ) : isPending || !content ? (
        <div className="mt-6 rounded-[24px] border border-border bg-surface p-6 sm:p-10" role="status" aria-live="polite">
          <span className="sr-only">Loading page {page}</span>
          <div className="mx-auto max-w-[62ch]">
            <SkeletonText lines={7} />
          </div>
        </div>
      ) : (
        <>
          <article className="mt-6 rounded-[24px] border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(27,67,50,0.04),0_8px_24px_-12px_rgba(27,67,50,0.12)] sm:p-10">
            <div className="mx-auto max-w-[62ch] space-y-5">
              {content.blocks.map((block, index) =>
                block.type === 'heading' ? (
                  <h2 key={index} className="font-heading text-xl font-bold tracking-tight text-foreground-strong">
                    {block.text}
                  </h2>
                ) : (
                  <p key={index} className="text-[15px] leading-[1.85] text-foreground">
                    {block.text}
                  </p>
                ),
              )}
            </div>
          </article>

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
              leadingIcon={<ChevronLeft {...ICON} />}
            >
              Previous
            </Button>
            <p className="text-sm text-muted">
              Page <span className="font-semibold text-foreground-strong">{page}</span> of {totalPages}
            </p>
            <Button
              variant="outline"
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages}
              trailingIcon={<ChevronRight {...ICON} />}
            >
              Next
            </Button>
          </div>

          <ProgressBar className="mt-4" value={page} max={totalPages} label="Reading progress" />

          <div className="mt-6 flex justify-center">
            <Button variant="ghost" onClick={() => navigate('/library')}>
              Back to the library
            </Button>
          </div>
        </>
      )}
    </Screen>
  );
}

export default ReaderPage;
