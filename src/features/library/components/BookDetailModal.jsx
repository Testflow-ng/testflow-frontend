import { Bookmark, BookOpen, Download } from 'lucide-react';
import { Badge, Button, IconButton, KeyValueList, Modal, ProgressBar } from '../../../components/ui/index.js';
import { ICON } from '../../../components/ui/iconProps.js';
import Book from '../../../components/data/Book.jsx';

const formatSize = (kb) => (!kb ? '—' : kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/**
 * What a student sees before opening a book: the cover, what it is about, its
 * details, and the two things they can do from here .save it or download it —
 * with the download and bookmark controls at the top and the two actions at the
 * bottom. Presentational: the parent owns the data and the API calls.
 */
function BookDetailModal({
  book,
  open,
  onOpenChange,
  progress,
  onRead,
  onToggleBookmark,
  onDownload,
  bookmarkBusy = false,
  downloading = false,
}) {
  if (!book) return null;

  const finished = progress?.percent >= 100;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={book.title}
      description={`${book.code} · ${book.level} level`}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onRead} leadingIcon={<BookOpen {...ICON} />}>
            {finished ? 'Read again' : progress ? 'Continue reading' : 'Read'}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 pb-4 pt-1">
        <Book code={book.code} title={book.title} color={book.color} size="sm" showTitle={false} className="w-[5.5rem]" />

        <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            <IconButton
              aria-label={`Download ${book.code}`}
              title="Download"
              onClick={onDownload}
              disabled={downloading}
            >
              <Download {...ICON} />
            </IconButton>
            <IconButton
              aria-label={book.bookmarked ? `Remove bookmark for ${book.code}` : `Bookmark ${book.code}`}
              aria-pressed={book.bookmarked}
              title={book.bookmarked ? 'Remove bookmark' : 'Bookmark'}
              onClick={onToggleBookmark}
              disabled={bookmarkBusy}
              className={book.bookmarked ? 'text-primary' : undefined}
            >
              <Bookmark {...ICON} className={book.bookmarked ? 'fill-current' : ''} />
            </IconButton>
          </div>
          <p className="text-right text-xs text-muted">{formatSize(book.sizeKb)}</p>
        </div>
      </div>

      {progress ? (
        <div className="mb-4 rounded-[18px] bg-surface-strong/60 px-4 py-3">
          <ProgressBar value={progress.percent} size="sm" label="Your progress" showValue />          <p className="mt-1.5 text-xs text-muted">
            {finished
              ? `Finished on ${formatDate(progress.updatedAt)}`
              : `Page ${progress.page} of ${book.pages} · last read ${formatDate(progress.updatedAt)}`}
          </p>
        </div>
      ) : null}

      <div className="space-y-4 pb-4">
        <div>
          <h3 className="mb-1.5 font-heading text-sm font-bold text-foreground-strong">About this book</h3>
          <p className="text-sm leading-relaxed text-foreground">{book.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {book.topics.map((topic) => (
            <Badge key={topic} variant="lavender">
              {topic}
            </Badge>
          ))}
        </div>

        <KeyValueList
          items={[
            { label: 'Pages', value: book.pages },
            { label: 'Edition', value: book.edition },
            { label: 'Semester', value: book.semester === 'first' ? 'First semester' : 'Second semester' },
            { label: 'Author', value: book.author },
            { label: 'Updated', value: formatDate(book.updatedAt) },
          ]}
        />
      </div>
    </Modal>
  );
}

export default BookDetailModal;
