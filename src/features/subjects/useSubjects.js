import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi } from './api.js';
import { useAuth } from '../auth/useAuth.js';

export function useSubjects() {
  // Subject list count updates frequently during content entry;
  // set staleTime to 0 to ensure fresh counts on every visit.
  return useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsApi.list,
    staleTime: 0
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (id) => subjectsApi.togglePin(id),
    onSuccess: (data) => {
      // Update local auth user state with new pinned list
      setUser((prev) => ({ ...prev, pinnedSubjects: data.pinnedSubjects }));
      // Invalidate subjects query if needed, or just let the user state drive the UI
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useLeaderboard(subjectId) {
  return useQuery({
    queryKey: ['leaderboard', subjectId],
    queryFn: () => subjectsApi.leaderboard(subjectId),
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
