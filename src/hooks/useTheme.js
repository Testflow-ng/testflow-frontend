import { useSyncExternalStore } from 'react';
import { getTheme, subscribe, toggleTheme, THEMES } from '../theme.js';

/**
 * Reactive access to the active theme. Backed by the theme singleton via
 * useSyncExternalStore, so every consumer re-renders on programmatic toggles
 * and on system-preference changes — no stale local mirrors.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, getTheme);
  return {
    theme,
    isDark: theme === THEMES.DARK,
    toggle: toggleTheme,
  };
}
