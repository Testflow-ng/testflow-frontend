/**
 * A stable, anonymous id for this browser, sent with sign-up so one person cannot collect a free
 * trial per account. A random id kept in storage plus a hash of coarse browser traits (so clearing
 * storage alone does not give a new identity). Nothing here identifies the person.
 */
let cached = null;

const sha256 = async (text) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const deviceFingerprint = async () => {
  if (cached) return cached;
  try {
    let id = '';
    try {
      id = localStorage.getItem('tf_device') || '';
      if (!id) { id = crypto.randomUUID(); localStorage.setItem('tf_device', id); }
    } catch { /* storage blocked: the traits below still identify the browser */ }
    const traits = [
      navigator.userAgent, navigator.language, navigator.hardwareConcurrency, screen.width, screen.height,
      screen.colorDepth, Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.platform,
    ].join('|');
    // Two parts: the traits alone (survive cleared storage) and the stored id.
    cached = `${(await sha256(traits)).slice(0, 32)}.${id}`;
  } catch {
    cached = '';
  }
  return cached;
};
