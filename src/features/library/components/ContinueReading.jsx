import { BookOpen, RotateCcw } from 'lucide-react';
import { Button, ProgressBar } from '../../../components/ui/index.js';
import { ICON } from '../../../components/ui/iconProps.js';
import Book from '../../../components/data/Book.jsx';

/**
 * The books a student has already opened, newest first, each resuming where
 * they stopped. Not just the last one .every book in progress keeps its own
 * place. Presentational: `onResume(book, page)`.
 */
function ContinueReading({ items, onResume }) {
  if (!items?.length) return null;

  return (
    <section className="mt-9" aria-labelledby="continue-reading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="continue-reading" className="font-heading text-lg font-bold tracking-tight text-foreground-strong">
          Continue reading
        </h2>
        <p className="text-xs text-muted">
          {items.length} book{items.length === 1 ? '' : 's'} started
        </p>
      </div>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ book, page, percent }) => {
          const finished = percent >= 100;
          return (
            <li key={book.id} className="flex items-center gap-3.5 rounded-[20px] border border-border bg-surface p-3.5">
              <Book code={book.code} title={book.title} color={book.color} size="sm" showTitle={false} className="w-[4.25rem] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{book.code}</p>
                <p className="truncate font-heading text-sm font-bold leading-snug text-foreground-strong">{book.title}</p>
                <ProgressBar className="mt-2" size="sm" value={percent} label={`${book.code} progress`} labelHidden />
                <p className="mt-1 text-xs text-muted">
                  {finished ? 'Finished' : `Page ${page} of ${book.pages} · ${percent}%`}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2.5"
                  onClick={() => onResume(book, finished ? 1 : page)}
                  leadingIcon={finished ? <RotateCcw {...ICON} size={15} /> : <BookOpen {...ICON} size={15} />}
                >
                  {finished ? 'Read again' : 'Continue'}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default ContinueReading;
