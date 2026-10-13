/**
 * Waitlist configuration.
 *
 * The backend has no waitlist endpoint yet, so nothing here pretends to save a
 * submission. Set `VITE_WAITLIST_URL` to a form/endpoint that accepts
 * `POST { email }` as JSON once one exists. Until then the form hands the
 * request to the visitor's mail app, addressed to the team inbox.
 */
export const WAITLIST_URL = import.meta.env.VITE_WAITLIST_URL || '';
export const WAITLIST_EMAIL = 'hello@testflow.com.ng';

export const COMING_SOON_PATH = '/coming-soon';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (value) => EMAIL_PATTERN.test(value.trim());

export async function joinWaitlist(email) {
  const clean = email.trim();
  if (WAITLIST_URL) {
    const res = await fetch(WAITLIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean }),
    });
    if (!res.ok) throw new Error('Waitlist request failed');
    return 'saved';
  }
  const subject = encodeURIComponent('Add me to the Testflow waitlist');
  const body = encodeURIComponent(`Please add ${clean} to the Testflow waitlist.`);
  window.location.href = `mailto:${WAITLIST_EMAIL}?subject=${subject}&body=${body}`;
  return 'mailto';
}
