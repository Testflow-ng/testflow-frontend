// Vercel Routing Middleware. Link-preview crawlers (WhatsApp, Facebook, X, ...) do not run the app,
// so for an organisation's own address they get a small HTML page carrying that organisation's name
// and preview image. Everyone else, and Testflow's own site, falls straight through.
// (A vercel.json rewrite cannot do this: "/" is a real file, and files are served before rewrites.)
const BOTS = /(facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|Googlebot|bingbot|SkypeUriPreview|Pinterest|Embedly)/i;
const ROOT = 'testflow.com.ng';
const API = 'https://api.testflow.com.ng/api/v1/public/site/page';

export const config = { matcher: ['/', '/((?!assets/|api/|.*\\..*).*)'] };

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  const host = (request.headers.get('host') || '').toLowerCase().replace(/:\d+$/, '');
  const isOrgHost = host.endsWith(`.${ROOT}`) && host !== `www.${ROOT}` && host !== `api.${ROOT}`;
  if (!isOrgHost || !BOTS.test(ua)) return undefined; // carry on to the app
  try {
    const res = await fetch(`${API}?host=${encodeURIComponent(host)}`, { headers: { accept: 'text/html' } });
    if (!res.ok) return undefined;
    return new Response(await res.text(), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
    });
  } catch {
    return undefined;
  }
}
