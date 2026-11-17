import { Lock } from 'lucide-react';
import { Banner, Button, Modal, Skeleton } from '../../../components/ui/index.js';
import { ICON } from '../../../components/ui/iconProps.js';
import { Link } from 'react-router-dom';
import Book from '../../../components/data/Book.jsx';
import { useNote } from '../useLibrary.js';

/**
 * What a student sees when they open a note: the cover, what it is about and every page image,
 * stacked in reading order. Images are handed out as short-lived URLs by the note endpoint, so
 * they load here and nowhere else.
 */
function NoteDetailModal({ note, open, onOpenChange, locked = false }) {
  const { data, isLoading, isError, error } = useNote(open ? note?.id : null);
  if (!note) return null;

  const images = data?.imageUrls ?? [];

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={note.title}
      description={`${note.subjectCode || 'Note'}${note.level ? ` · ${note.level} level` : ''} · ${note.semester === 'second' ? 'Second' : 'First'} semester`}
      size="lg"
      footer={
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className="flex items-start gap-4 pb-4 pt-1">
        <Book code={note.subjectCode || 'NOTE'} title={note.title} color="amber" size="sm" showTitle={false} className="w-[5.5rem]" />
        {note.description ? (
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">{note.description}</p>
        ) : null}
      </div>

      {locked ? (
        <div className="pb-2">
          <Banner variant="info" className="mb-3">
            Reading notes is part of the Student Pass.
          </Banner>
          <Link to="/billing">
            <Button leadingIcon={<Lock {...ICON} />}>Get a pass to read</Button>
          </Link>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 pb-2" role="status" aria-label="Loading the note">
          {Array.from({ length: Math.max(1, Math.min(note.imageCount ?? 2, 3)) }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Banner variant="danger" className="mb-2">
          {error?.message ?? 'Could not open this note. Check your connection and try again.'}
        </Banner>
      ) : images.length === 0 ? (
        <p className="pb-4 text-sm text-muted">This note has no images yet.</p>
      ) : (
        <div className="space-y-3 pb-2">
          {images.map((url, i) => (
            <img
              key={url}
              src={url}
              alt={`Page ${i + 1} of ${note.title}`}
              className="w-full rounded-2xl border border-border"
              loading={i > 1 ? 'lazy' : undefined}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}

export default NoteDetailModal;
