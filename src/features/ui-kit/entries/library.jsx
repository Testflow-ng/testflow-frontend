import { useState } from 'react';
import { Button } from '../../../components/ui/index.js';
import Book from '../../../components/data/Book.jsx';
import BookDetailModal from '../../library/components/BookDetailModal.jsx';
import ContinueReading from '../../library/components/ContinueReading.jsx';

/* One book per cover colour, so the shelf reads like the real thing. */
const SHELF = [
  { color: 'red', code: 'MTH101', title: 'Elementary Mathematics I' },
  { color: 'blue', code: 'GST101', title: 'Use of English I' },
  { color: 'ink', code: 'CHM101', title: 'General Chemistry I' },
  { color: 'green', code: 'BIO101', title: 'General Biology I' },
  { color: 'amber', code: 'PHY101', title: 'General Physics I' },
  { color: 'violet', code: 'CSC101', title: 'Introduction to Computing' },
  { color: 'teal', code: 'STA101', title: 'Statistics for Science' },
];

const SAMPLE_BOOK = {
  id: 'bk_mth101',
  code: 'MTH101',
  title: 'Elementary Mathematics I',
  subtitle: 'Algebra, calculus and statistics',
  color: 'red',
  level: 100,
  semester: 'first',
  pages: 148,
  sizeKb: 4210,
  edition: '2nd edition',
  author: 'TestFlow Editorial',
  year: 2024,
  topics: ['Algebra', 'Calculus', 'Statistics'],
  description:
    'A 100 level, first semester companion for MTH101, covering algebra, calculus and statistics with worked examples and past-question walkthroughs.',
  bookmarked: true,
  updatedAt: '2026-09-27T09:00:00.000Z',
};

const READING = [
  { book: SAMPLE_BOOK, page: 42, percent: 28, updatedAt: '2026-10-17T21:00:00.000Z' },
  { book: { ...SAMPLE_BOOK, id: 'bk_bio101', code: 'BIO101', title: 'General Biology I', color: 'green', pages: 164 }, page: 120, percent: 73 },
  { book: { ...SAMPLE_BOOK, id: 'bk_gst101', code: 'GST101', title: 'Use of English I', color: 'blue', pages: 96 }, page: 96, percent: 100 },
];

export default [
  {
    id: 'book', name: 'Book cover', category: 'Library', source: ['data/Book.jsx', 'data/bookColors.js'],
    description: 'A course as a book on a shelf: code at the top of the cover, the TestFlow mark stamped in the middle, the title underneath. Seven cover colours and an optional select action.',
    keywords: ['book', 'library', 'cover', 'shelf', 'course', 'spine', 'reading', 'colour', 'tile'],
    Preview: () => (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
          {SHELF.map((b) => <Book key={b.color} size="full" {...b} />)}
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <Book size="sm" color="red" code="MTH101" title="Elementary Mathematics I" />
          <Book size="md" color="blue" code="GST101" title="Use of English I" onSelect={() => {}} />
          <Book size="lg" color="teal" code="BIO101" title="General Biology I" showTitle={false} />
        </div>
      </div>
    ),
    usage: `import Book from '../components/data/Book.jsx';

// color: ink | red | blue | green | amber | violet | teal      size: sm | md | lg | full
// Pass onSelect to make the book a button; its accessible name is "code: title".
<Book code="MTH101" title="Elementary Mathematics I" color="red" />
<Book code="GST101" title="Use of English I" color="blue" size="full" onSelect={open} />

// Shelf grid: let the cell drive the width.
<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
  {books.map((b) => <Book key={b.id} size="full" {...b} onSelect={() => open(b)} />)}
</div>`,
  },
  {
    id: 'book-detail', name: 'Book dialog', category: 'Library', source: ['features/library/components/BookDetailModal.jsx'],
    description: 'What a student sees before opening a book: cover, about, details, the download and bookmark controls at the top and Read or Cancel at the bottom. Presentational .the parent owns the data and the API calls.',
    keywords: ['book', 'library', 'dialog', 'modal', 'detail', 'download', 'bookmark', 'read', 'about'],
    Preview: function Demo() {
      const [open, setOpen] = useState(false);
      const [bookmarked, setBookmarked] = useState(SAMPLE_BOOK.bookmarked);
      return (
        <div className="space-y-4">
          <Button onClick={() => setOpen(true)}>Open book dialog</Button>
          <BookDetailModal
            book={{ ...SAMPLE_BOOK, bookmarked }}
            open={open}
            onOpenChange={setOpen}
            progress={{ page: 42, percent: 28, updatedAt: '2026-10-17T21:00:00.000Z' }}
            onRead={() => setOpen(false)}
            onToggleBookmark={() => setBookmarked((v) => !v)}
            onDownload={() => {}}
          />
        </div>
      );
    },
    usage: `import BookDetailModal from '../features/library/components/BookDetailModal.jsx';

// Presentational: pass the book, its progress, and the callbacks that hit the API.
<BookDetailModal
  book={book}
  open={open}
  onOpenChange={setOpen}
  progress={progress}            // { page, percent, updatedAt } or null
  onRead={openReader}
  onToggleBookmark={toggleBookmark}
  onDownload={download}
  bookmarkBusy={saving}
  downloading={preparing}
/>`,
  },
  {
    id: 'continue-reading', name: 'Continue reading', category: 'Library', source: ['features/library/components/ContinueReading.jsx'],
    description: 'Every book the student has started, newest first, each resuming where they stopped .not just the last one. Hides itself when there is nothing to resume.',
    keywords: ['library', 'reading', 'continue', 'resume', 'progress', 'last read', 'shelf'],
    Preview: () => <ContinueReading items={READING} onResume={() => {}} />,
    usage: `import ContinueReading from '../features/library/components/ContinueReading.jsx';

// items: [{ book, page, percent, updatedAt }], newest first.
<ContinueReading items={reading} onResume={(book, page) => navigate(\`/library/\${book.id}/read?page=\${page}\`)} />`,
  },
];
