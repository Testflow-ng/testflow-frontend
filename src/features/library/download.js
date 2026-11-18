/**
 * Save a file the books API handed us a URL for. A same-origin or data:/blob: URL is
 * downloaded under `fileName`. A signed cross-origin URL (R2) ignores the `download`
 * attribute, so it opens in a new tab instead — the URL carries a signed
 * `response-content-disposition: attachment`, which makes the browser download the
 * file rather than navigate, and leaves the app on screen either way.
 */
export function saveFile({ url, fileName } = {}) {
  if (!url || typeof document === 'undefined') return;
  let sameOrigin;
  try {
    sameOrigin = new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    sameOrigin = false;
  }
  const link = document.createElement('a');
  link.href = url;
  link.rel = 'noopener';
  if (sameOrigin || url.startsWith('data:') || url.startsWith('blob:')) {
    link.download = fileName || '';
  } else {
    link.target = '_blank';
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
}
