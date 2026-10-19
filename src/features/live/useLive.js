import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { liveApi } from './api.js';

const TERMINAL = ['completed', 'results_published', 'cancelled'];
const POLL_MS = 3000;

/** Host view of a room. Resolves only for the host: a 403 means "you are a participant" (no retry). */
export function useHostRoom(code) {
  return useQuery({
    queryKey: ['live', code, 'host'],
    queryFn: () => liveApi.hostRoom(code),
    retry: false,
    refetchInterval: (q) => (q.state.data && !TERMINAL.includes(q.state.data.status) ? POLL_MS : false),
  });
}

/** Participant view: room details plus your membership. Enabled once we know you are not the host. */
export function useMembership(code, enabled) {
  return useQuery({
    queryKey: ['live', code, 'member'],
    queryFn: () => liveApi.membership(code),
    enabled,
    refetchInterval: (q) => (q.state.data && q.state.data.status !== 'cancelled' && q.state.data.status !== 'results_published' ? POLL_MS : false),
  });
}

export function useLiveAction(code, fn, { onSuccess } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['live', code] });
      onSuccess?.(...args);
    },
  });
}

export function useDashboard(code, enabled) {
  return useQuery({ queryKey: ['live', code, 'dashboard'], queryFn: () => liveApi.dashboard(code), enabled });
}

export function useMyResult(code, enabled) {
  return useQuery({ queryKey: ['live', code, 'result'], queryFn: () => liveApi.result(code), enabled, retry: false });
}

/**
 * Seconds left until `endsAt`, measured against the server's clock (`serverTime` from the same response),
 * never the device clock alone. Ticks once a second.
 */
export function useRemaining(endsAt, serverTime) {
  const [offset] = useState(() => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0));
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  if (!endsAt) return null;
  return Math.max(0, Math.floor((new Date(endsAt).getTime() - (now + offset)) / 1000));
}
