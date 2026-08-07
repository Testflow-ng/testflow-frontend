import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reactive media query. Used where a breakpoint has to change *behaviour*
 * rather than styling — e.g. the Modal enables swipe-to-dismiss only while it
 * is rendering as a bottom sheet.
 *
 * `useSyncExternalStore` keeps this correct across concurrent renders and gives
 * SSR/first-paint a defined value instead of a post-mount flash.
 */
export function useMediaQuery(query) {
  // Memoised so useSyncExternalStore doesn't tear down and re-add the listener
  // on every render.
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True while the viewport is phone-sized (below Tailwind's `sm`). */
export function useIsMobile() {
  return useMediaQuery('(max-width: 639px)');
}

export default useMediaQuery;
