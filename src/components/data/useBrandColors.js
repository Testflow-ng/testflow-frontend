// Recharts needs real colour values (CSS var() support in SVG attributes is patchy), so read the brand tokens.
const read = (name, fallback) => {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

export function useBrandColors() {
  return {
    indigo: read('--brand-indigo', '#4a35f0'),
    lime: read('--brand-lime', '#d6e87c'),
    ink: read('--brand-ink', '#1b4332'),
    lavender: read('--brand-lavender', '#e9e5fb'),
    sage: read('--brand-sage', '#e4ebdd'),
    grid: read('--color-border', '#e3e1d8'),
    muted: read('--color-text-muted', '#6f7a73'),
  };
}
