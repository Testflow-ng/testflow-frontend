import { useSyncExternalStore } from 'react';

const KEY = 'tf_sidebar_collapsed';
// Card width plus a 6px gutter on each side; kept in sync with --sidebar-w in global.css.
export const SIDEBAR_EXPANDED_PX = 276;
export const SIDEBAR_COLLAPSED_PX = 76;

const listeners = new Set();

const read = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

let collapsed = read();

const apply = () => {
  document.documentElement.style.setProperty('--sidebar-w', `${collapsed ? SIDEBAR_COLLAPSED_PX : SIDEBAR_EXPANDED_PX}px`);
};
apply();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const toggle = () => {
  collapsed = !collapsed;
  try {
    localStorage.setItem(KEY, collapsed ? '1' : '0');
  } catch {
    /* storage unavailable: still works for this session */
  }
  apply();
  listeners.forEach((l) => l());
};

/** Desktop sidebar state, shared between the sidebar and the layout that makes room for it. */
export function useSidebar() {
  const isCollapsed = useSyncExternalStore(subscribe, () => collapsed, () => false);
  return { collapsed: isCollapsed, toggle };
}
