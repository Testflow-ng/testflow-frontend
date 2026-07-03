import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from './api.js';

export function useStats() {
  return useQuery({ queryKey: ['examStats'], queryFn: analyticsApi.stats, staleTime: 60 * 1000 });
}
