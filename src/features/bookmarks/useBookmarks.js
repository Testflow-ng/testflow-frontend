import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../components/ui/index.js';
import { bookmarksApi } from './api.js';

const KEY = ['question-bookmarks'];

/** The student's saved questions, newest first (the server orders it). */
export function useBookmarks() {
  return useQuery({
    queryKey: KEY,
    queryFn: bookmarksApi.list,
    staleTime: 60_000,
  });
}

/**
 * The saved question ids as a Set, for bookmark toggles.
 *
 * Read from the same query the list reads, so the star on a question and the row in the
 * profile can never disagree .they are one cache entry, drawn twice.
 */
export function useBookmarkedIds() {
  const { data } = useBookmarks();
  return useMemo(() => new Set((data ?? []).map((item) => item.questionId)), [data]);
}

/**
 * Toggle a bookmark, optimistically.
 *
 * The button has to react on the tap: it is a 250ms round trip otherwise, on a phone, in a
 * hall. `question` is only needed for the optimistic row .the server returns the canonical
 * question with its answer and explanation, which replaces this the moment the request lands.
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    /* Destructured: callers pass `{ questionId, question }`, and the API helper takes the id.
       Passing the whole variables object through posted `{ questionId: {...} }`, which the
       API rejected .the toggle then rolled itself back with nothing on screen to say so. */
    mutationFn: ({ questionId }) => bookmarksApi.toggle(questionId),
    onMutate: async ({ questionId, question }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData(KEY);
      const list = previous ?? [];
      const already = list.some((item) => item.questionId === questionId);
      queryClient.setQueryData(
        KEY,
        already
          ? list.filter((item) => item.questionId !== questionId)
          : [
              {
                id: `pending_${questionId}`,
                questionId,
                question,
                createdAt: new Date().toISOString(),
                pending: true,
              },
              ...list,
            ],
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
      /* A bookmark that silently fails is worse than one that fails loudly: the button has
         already flipped, and the student has no reason to doubt it. */
      toast.error('Could not save that question', error?.message ?? 'Please try again.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
