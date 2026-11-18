/**
 * Hand a link to the native share sheet when there is one (a phone in a class WhatsApp group is
 * the common case), and to the clipboard otherwise. Returns where the link went:
 * 'shared' | 'copied' | 'cancelled'.
 */
export async function shareLink(url, { title, text } = {}) {
  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare({ url }));

  if (canNativeShare) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
      /* fall through to the clipboard */
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    /* Older or non-secure contexts: select a hidden field and copy the hard way. */
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {
      /* nothing else to try */
    }
    textarea.remove();
    return 'copied';
  }
}
