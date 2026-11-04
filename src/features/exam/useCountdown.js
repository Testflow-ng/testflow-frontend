import { useEffect, useRef, useState } from 'react';

const secondsUntil = (expiresAt) =>
  Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));

/**
 * Ticking countdown to `expiresAt` (seconds remaining). Fires `onExpire` once
 * when it hits zero. The client timer is a convenience; the server enforces the
 * real deadline.
 */
export function useCountdown(expiresAt, onExpire) {
  const [remaining, setRemaining] = useState(() => secondsUntil(expiresAt));
  const onExpireRef = useRef(onExpire);
  const fired = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const id = setInterval(() => {
      const value = secondsUntil(expiresAt);
      setRemaining(value);
      if (value <= 0 && !fired.current) {
        fired.current = true;
        clearInterval(id);
        onExpireRef.current?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}
