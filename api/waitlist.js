// Vercel serverless function: POST /api/waitlist { email }
// Sends ONE thank-you email per person through Resend. Needs RESEND_API_KEY in the Vercel env.
// Optional env: RESEND_AUDIENCE_ID (saves the list in Resend and dedupes forever),
//               WAITLIST_FROM (default "Testflow <hello@testflow.com.ng>", a verified Resend domain).
import { createHash } from 'node:crypto';

const SITE = 'https://www.testflow.com.ng';
const LOGO = `${SITE}/brand/logo-email.png`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort per-instance limiter (serverless instances do not share memory).
const hits = new Map();
const limited = (ip) => {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
};

export const buildEmail = () => {
  const subject = 'Thank you for joining the Testflow waitlist';
  const text = [
    'Hello,',
    '',
    'Thank you for joining the Testflow waitlist. We are about to launch, and you will be among the first to know.',
    'Once we launch, we will update you right here by email.',
    '',
    'Thanks,',
    'Feranmi Oresajo',
  ].join('\n');
  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#f6f4ee;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4ee;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;border:1px solid #e3e1d8;">
<tr><td style="padding:32px 36px 8px 36px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle;"><img src="${LOGO}" width="52" height="52" alt="Testflow logo" style="display:block;border:0;outline:none;"></td><td style="vertical-align:middle;padding-left:12px;font-family:Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:#1b4332;letter-spacing:-0.5px;">Testflow</td></tr></table>
</td></tr>
<tr><td style="padding:12px 36px 36px 36px;font-family:Helvetica,Arial,sans-serif;color:#1b4332;font-size:16px;line-height:1.65;">
<p style="margin:0 0 16px 0;">Hello,</p>
<p style="margin:0 0 16px 0;">Thank you for joining the Testflow waitlist. We are about to launch, and you will be among the first to know.</p>
<p style="margin:0 0 24px 0;">Once we launch, we will update you right here by email.</p>
<p style="margin:0;">Thanks,<br><strong>Feranmi Oresajo</strong></p>
</td></tr>
</table>
<p style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#6f7a73;margin:16px 0 0 0;">You received this because you joined the Testflow waitlist at testflow.com.ng.</p>
</td></tr></table>
</body></html>`;
  return { subject, text, html };
};

const resend = (path, key, init = {}) =>
  fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body ?? {});
  if (body.website) return res.status(200).json({ ok: true }); // honeypot: pretend success

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return res.status(422).json({ error: 'INVALID_EMAIL' });

  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'RATE_LIMITED' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: 'WAITLIST_NOT_CONFIGURED' });
  const audience = process.env.RESEND_AUDIENCE_ID;

  try {
    if (audience) {
      // Already on the list: skip the email so nobody gets a second one and the daily quota is protected.
      const existing = await resend(`/audiences/${audience}/contacts/${encodeURIComponent(email)}`, key);
      if (existing.ok) return res.status(200).json({ ok: true, alreadyJoined: true });
      await resend(`/audiences/${audience}/contacts`, key, { method: 'POST', body: JSON.stringify({ email, unsubscribed: false }) });
    }

    const { subject, text, html } = buildEmail();
    const sent = await resend('/emails', key, {
      method: 'POST',
      // Resend drops duplicate sends that share a key for 24 h, a second guard against double clicks.
      headers: { 'Idempotency-Key': `waitlist-${createHash('sha256').update(email).digest('hex')}` },
      body: JSON.stringify({
        from: process.env.WAITLIST_FROM || 'Testflow <hello@testflow.com.ng>',
        to: [email],
        reply_to: 'hello@testflow.com.ng',
        subject,
        text,
        html,
      }),
    });
    if (!sent.ok) return res.status(502).json({ error: 'EMAIL_FAILED' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'EMAIL_FAILED' });
  }
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
