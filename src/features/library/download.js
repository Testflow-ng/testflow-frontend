/**
 * Save a file the books API handed us a URL for. A same-origin or data: URL is
 * downloaded under `fileName`; a signed cross-origin URL (where browsers ignore
 * `download`) simply opens.
 */
export function saveFile({ url, fileName } = {}) {
  if (!url || typeof document === 'undefined') return;
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || '';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
