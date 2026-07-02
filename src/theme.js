const STORAGE_KEY = 'theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

const isValidTheme = (value) => value === THEMES.LIGHT || value === THEMES.DARK;

const listeners = new Set();

/**
 * Subscribe to theme changes (programmatic toggles and system-preference
 * changes). Returns an unsubscribe function. Designed for React's
 * useSyncExternalStore so every consumer stays in sync with the singleton.
 */
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

const getStoredTheme = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isValidTheme(value) ? value : null;
  } catch {
    return null;
  }
};

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute('content', theme === THEMES.DARK ? '#0f172a' : '#2563eb');
  }
};

const getTheme = () => {
  const saved = getStoredTheme();
  if (saved) {
    return saved;
  }

  const current = document.documentElement.dataset.theme;
  if (isValidTheme(current)) {
    return current;
  }

  return getSystemTheme();
};

const setTheme = (theme, { persist = true } = {}) => {
  if (!isValidTheme(theme)) {
    return;
  }

  applyTheme(theme);

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures in private modes.
    }
  }

  notify();
};

const toggleTheme = () => {
  const currentTheme = getTheme();
  setTheme(currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
};

const initializeTheme = () => {
  const storedTheme = getStoredTheme();
  const theme = storedTheme ?? getSystemTheme();
  applyTheme(theme);

  if (!storedTheme) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      applyTheme(event.matches ? THEMES.DARK : THEMES.LIGHT);
      notify();
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
  }
};

export { THEMES, getTheme, setTheme, toggleTheme, initializeTheme, subscribe };
