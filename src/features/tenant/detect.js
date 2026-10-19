// Is this page being served on an organisation's own address (grace.testflow.com.ng or their domain)?
// If so the whole app is that organisation's site, not Testflow.
const PLATFORM_HOSTS = new Set(['localhost', '127.0.0.1', 'testflow.com.ng', 'www.testflow.com.ng']);
const RESERVED = new Set(['www', 'api', 'ads', 'app', 'admin', 'docs', 'mail', 'staging']);
const KEY = 'tf_dev_tenant';

/** Returns `{ hostname }` for a tenant site, or null on Testflow itself. In dev, `?tenant=grace` pretends to be grace.testflow.com.ng. */
export function detectTenant() {
  const { hostname, search } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    try {
      const q = new URLSearchParams(search).get('tenant');
      if (q === 'off') sessionStorage.removeItem(KEY);
      else if (q) sessionStorage.setItem(KEY, q);
      const dev = sessionStorage.getItem(KEY) || import.meta.env.VITE_DEV_TENANT;
      return dev ? { hostname: dev.includes('.') ? dev : `${dev}.testflow.com.ng` } : null;
    } catch {
      return null;
    }
  }
  if (PLATFORM_HOSTS.has(hostname) || hostname.endsWith('.vercel.app')) return null;
  if (hostname.endsWith('.testflow.com.ng') && RESERVED.has(hostname.split('.')[0])) return null;
  return { hostname };
}
