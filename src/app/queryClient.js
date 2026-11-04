import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide TanStack Query client. Conservative defaults suited to an exam
 * platform: limited retries, no refetch-on-focus (avoids surprise refetches
 * mid-exam), and a short stale window for dashboard-style data.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});
