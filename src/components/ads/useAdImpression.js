import { useEffect, useRef } from 'react';

/**
 * Counts an impression the way the Ads API requires: the element must be at least 50% visible for 1000 ms.
 * Calls `onImpression({ visibleMs })` once. Attach the returned ref to the card.
 */
export function useAdImpression(onImpression, { threshold = 0.5, minMs = 1000 } = {}) {
  const ref = useRef(null);
  const fired = useRef(false);
  const cb = useRef(onImpression);
  useEffect(() => {
    cb.current = onImpression;
  }, [onImpression]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    let timer = null;
    let since = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= threshold) {
          if (timer || fired.current) return;
          since = performance.now();
          timer = setTimeout(() => {
            fired.current = true;
            cb.current?.({ visibleMs: Math.round(performance.now() - since) });
          }, minMs);
        } else {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, threshold, 1] },
    );
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [threshold, minMs]);
  return ref;
}
