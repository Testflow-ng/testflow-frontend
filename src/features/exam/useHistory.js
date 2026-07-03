import { useQuery } from '@tanstack/react-query';
import { examApi } from './api.js';

export function useHistory() {
  return useQuery({ queryKey: ['examHistory'], queryFn: examApi.history });
}
