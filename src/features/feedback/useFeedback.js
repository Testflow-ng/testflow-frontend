import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackApi } from './api.js';

const KEY = ['feedback'];

/** What this student has sent, newest first (the server orders it). */
export function useFeedback() {
  return useQuery({
    queryKey: KEY,
    queryFn: feedbackApi.list,
    staleTime: 30_000,
  });
}

/**
 * Send feedback.
 *
 * Deliberately not optimistic: the row only exists once the server has it, and the form
 * clears on success rather than inventing an id and a timestamp for something that may not
 * have been saved.
 */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: feedbackApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
