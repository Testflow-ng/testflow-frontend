import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from './api.js';

/** The shelf, paged server-side. Previous page is kept on screen while the next one loads. */
export function useBooks(params) {
  return useQuery({
    queryKey: ['library', 'books', params],
    queryFn: () => libraryApi.listBooks(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useBook(id) {
  return useQuery({
    queryKey: ['library', 'book', id],
    queryFn: () => libraryApi.getBook(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

/** Every book the student has started, newest first. */
export function useReading() {
  return useQuery({
    queryKey: ['library', 'reading'],
    queryFn: () => libraryApi.reading(),
    staleTime: 30_000,
  });
}

export function useBookPages(id, page) {
  return useQuery({
    queryKey: ['library', 'pages', id, page],
    queryFn: () => libraryApi.pages(id, page),
    enabled: Boolean(id) && Boolean(page),
    placeholderData: keepPreviousData,
  });
}

export function useSetBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => libraryApi.setBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'reading'] });
    },
  });
}

export function useSaveProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => libraryApi.saveProgress(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library', 'reading'] }),
  });
}

export function useDownloadBook() {
  return useMutation({ mutationFn: (id) => libraryApi.download(id) });
}
