/**
 * One-time clean slate. Some visitors still have an old cached copy of the site (service
 * worker + Cache Storage + saved settings). When RESET_VERSION changes, wipe all of that once
 * and reload so they get the current site. Bump RESET_VERSION to force another clean-up.
 *
 * Note: httpOnly auth cookies cannot be read or cleared from JavaScript, only the server can
 * clear those. Cookies visible to JS (e.g. tf_csrf) are cleared here.
 */
const RESET_VERSION = '2026-10-14-light-reset-1';
const KEY = 'tf_reset_version';

const clearCookies = () => {
  const host = location.hostname;
  const parts = host.split('.');
  const domains = [undefined, host, ...(parts.length > 2 ? [`.${parts.slice(-3).join('.')}`] : []), ...(parts.length > 1 ? [`.${parts.slice(-2).join('.')}`] : [])];
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (!name) return;
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
    });
  });
};

export async function runAppReset() {
  let done;
  try {
    done = localStorage.getItem(KEY) === RESET_VERSION;
  } catch {
    return false;
  }
  if (done) return false;

  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    localStorage.clear();
    sessionStorage.clear();
    clearCookies();
  } catch {
    // Best effort: never block the app on a clean-up failure.
  }

  try {
    localStorage.setItem(KEY, RESET_VERSION);
  } catch {
    return false;
  }
  location.reload(); // fetch the fresh site once, now that nothing is cached
  return true;
}
