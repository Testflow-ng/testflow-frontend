import { useQuery } from '@tanstack/react-query';
import { subjectsApi } from './api.js';

export function useSubjects() {
  // Subject list is near-static; avoid refetching on every mount/focus.
  return useQuery({ queryKey: ['subjects'], queryFn: subjectsApi.list, staleTime: 5 * 60 * 1000 });
}
