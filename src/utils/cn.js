import { clsx } from 'clsx';

/**
 * Compose conditional class names. Thin wrapper over clsx so component code has
 * a single, stable import for class composition across the UI kit.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
