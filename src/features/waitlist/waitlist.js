/**
 * Waitlist. `POST /api/waitlist` is a Vercel serverless function (api/waitlist.js) that emails
 * the person a thank-you through Resend. If the function is not available (local `vite` dev, or
 * RESEND_API_KEY not set yet) the form falls back to opening the visitor's mail app.
 * Override the endpoint with VITE_WAITLIST_URL if needed.
 */
export const WAITLIST_URL = import.meta.env.VITE_WAITLIST_URL || '/api/waitlist';
export const WAITLIST_EMAIL = 'hello@testflow.com.ng';

export const COMING_SOON_PATH = '/coming-soon';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (value) => EMAIL_PATTERN.test(value.trim());

const JOINED_KEY = 'tf_waitlist_joined';
const wasJoined = (email) => {
  try {
    return (localStorage.getItem(JOINED_KEY) ?? '').split(',').includes(email);
  } catch {
    return false;
  }
};
const remember = (email) => {
  try {
    const list = (localStorage.getItem(JOINED_KEY) ?? '').split(',').filter(Boolean);
    localStorage.setItem(JOINED_KEY, [...new Set([...list, email])].slice(-5).join(','));
  } catch {
    /* storage unavailable: harmless */
  }
};

/** Resolves 'saved' | 'mailto'. Throws on real failures (bad email, rate limit, send error). */
export async function joinWaitlist(email, honeypot = '') {
  const clean = email.trim().toLowerCase();
  if (wasJoined(clean)) return 'saved'; // already thanked from this browser: never re-send

  let res;
  try {
    res = await fetch(WAITLIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean, website: honeypot }),
    });
  } catch {
    res = null; // no network / no function: fall back below
  }

  if (res?.ok) {
    remember(clean);
    return 'saved';
  }
  if (!res || res.status === 404 || res.status === 503) {
    const subject = encodeURIComponent('Add me to the Testflow waitlist');
    const body = encodeURIComponent(`Please add ${clean} to the Testflow waitlist.`);
    window.location.href = `mailto:${WAITLIST_EMAIL}?subject=${subject}&body=${body}`;
    return 'mailto';
  }
  throw new Error(res.status === 429 ? 'Too many tries. Please wait a few minutes.' : 'Waitlist request failed');
}
