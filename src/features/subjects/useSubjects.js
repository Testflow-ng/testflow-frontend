import { useQuery } from '@tanstack/react-query';
import { subjectsApi } from './api.js';

export function useSubjects() {
  // Subject list count updates frequently during content entry;
  // set staleTime to 0 to ensure fresh counts on every visit.
  return useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsApi.list,
    staleTime: 0
  });
}
