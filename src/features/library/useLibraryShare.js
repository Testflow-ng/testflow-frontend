import { useToast } from '../../components/ui/index.js';
import { shareLink } from '../../utils/share.js';
import { useBookShare, useNoteShare } from './useLibrary.js';

/**
 * Mint the public link for a book or a note and hand it to the share sheet (or the clipboard).
 * The server decides whether the caller may share — reading the book is already a pass-holder
 * privilege, and sharing is the same permission — so a refusal surfaces as the server's message.
 */
export function useLibraryShare() {
  const toast = useToast();
  const bookShare = useBookShare();
  const noteShare = useNoteShare();

  const finish = async (promise, { title, text }) => {
    try {
      const { shareUrl } = await promise;
      const result = await shareLink(shareUrl, { title, text });
      if (result === 'copied') toast.success('Link copied — anyone with it can open it.');
    } catch (error) {
      toast.error(error?.message ?? 'Could not create a share link.');
    }
  };

  return {
    pending: bookShare.isPending || noteShare.isPending,
    shareBook: (book) =>
      finish(bookShare.mutateAsync(book.id), {
        title: book?.title ?? 'TestFlow',
        text: `${book?.code ? `${book.code} · ` : ''}${book?.title ?? 'Shared from the TestFlow library'}`,
      }),
    shareNote: (note) =>
      finish(noteShare.mutateAsync(note.id), {
        title: note?.title ?? 'TestFlow',
        text: `${note?.subjectCode ? `${note.subjectCode} · ` : ''}${note?.title ?? 'Shared from the TestFlow library'}`,
      }),
  };
}
