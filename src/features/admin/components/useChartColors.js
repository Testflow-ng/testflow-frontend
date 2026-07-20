import { useEffect, useState } from 'react';
import { subscribe } from '../../../theme.js';

// Recharts writes fill/stroke as SVG presentation attributes where CSS var()
// support is inconsistent, so read the resolved token values in JS and refresh
// them whenever the theme changes.
const read = () => {
  const styles = getComputedStyle(document.documentElement);
  const get = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    primary: get('--color-primary', '#2563eb'),
    secondary: get('--color-secondary', '#7c3aed'),
    success: get('--color-success', '#16a34a'),
    warning: get('--color-warning', '#f59e0b'),
    info: get('--color-info', '#0ea5e9'),
    danger: get('--color-danger', '#dc2626'),
    muted: get('--color-text-muted', '#64748b'),
    border: get('--color-border', '#e2e8f0'),
    surface: get('--surface', '#ffffff'),
  };
};

export function useChartColors() {
  const [colors, setColors] = useState(read);
  useEffect(() => subscribe(() => setColors(read())), []);
  return colors;
}
