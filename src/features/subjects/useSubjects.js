import { useQuery } from '@tanstack/react-query';
import { subjectsApi } from './api.js';

export function useSubjects() {
  return useQuery({ queryKey: ['subjects'], queryFn: subjectsApi.list });
}
