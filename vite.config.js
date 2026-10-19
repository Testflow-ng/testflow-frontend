import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';
import { ADS_OG_ALT, ADS_OG_IMAGE, ADS_PAGES, SITE_URL, buildAdsJsonLd } from './src/features/ads/adsSeo.js';
import { EDDYRUS_SEO, buildEddyrusJsonLd } from './src/content/landing/eddyrus.js';
import { EVERYBODY_EXTRA_PAGES, EVERYBODY_SEO, buildEverybodyJsonLd } from './src/content/landing/everybody.js';

// Every statically prerendered route: its head data, share image and JSON-LD (if any).
const PRERENDER = [
  ...Object.entries(ADS_PAGES).map(([route, page]) => ({
    route,
    page,
    image: ADS_OG_IMAGE,
    imageAlt: ADS_OG_ALT,
    jsonLd: route === '/ads' ? buildAdsJsonLd() : null,
  })),
  { route: EDDYRUS_SEO.route, page: EDDYRUS_SEO, image: EDDYRUS_SEO.image, imageAlt: EDDYRUS_SEO.imageAlt, jsonLd: buildEddyrusJsonLd() },
  { route: EVERYBODY_SEO.route, page: EVERYBODY_SEO, image: EVERYBODY_SEO.image, imageAlt: EVERYBODY_SEO.imageAlt, jsonLd: buildEverybodyJsonLd() },
  ...Object.entries(EVERYBODY_EXTRA_PAGES).map(([route, page]) => ({ route, page, image: EVERYBODY_SEO.image, imageAlt: EVERYBODY_SEO.imageAlt, jsonLd: null })),
];

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Social crawlers (WhatsApp, X, Facebook) do not run JavaScript, so the SPA's
 * Seo component cannot change their tags. After the build we write
 * dist/ads/index.html (and /terms, /rules, /signin, /register) as copies of the
 * app shell with the page-specific <head>. Static hosts serve /ads/index.html
 * for /ads, and the same app bundle then takes over client-side.
 */
function adsPrerender() {
  return {
    name: 'testflow-ads-prerender',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve('dist');
      // If the build itself failed there is no shell to read; skip so the real error is the one reported.
      if (!fs.existsSync(path.join(dist, 'index.html'))) return;
      const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
      for (const { route, page, image, imageAlt, jsonLd } of PRERENDER) {
        const url = `${SITE_URL}${route}`;
        const robots = page.noIndex
          ? 'noindex, follow'
          : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
        const head = [
          `<title>${esc(page.title)}</title>`,
          `<meta name="description" content="${esc(page.description)}" />`,
          page.keywords ? `<meta name="keywords" content="${esc(page.keywords)}" />` : '',
          `<meta name="robots" content="${robots}" />`,
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:site_name" content="TestFlow" />`,
          `<meta property="og:title" content="${esc(page.title)}" />`,
          `<meta property="og:description" content="${esc(page.description)}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:image" content="${image}" />`,
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
          `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:title" content="${esc(page.title)}" />`,
          `<meta name="twitter:description" content="${esc(page.description)}" />`,
          `<meta name="twitter:image" content="${image}" />`,
          `<meta property="og:locale" content="en_NG" />`,
          jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '',
        ]
          .filter(Boolean)
          .join('\n    ');
        let html = shell
          .replace(/<title>[\s\S]*?<\/title>/, '')
          .replace(/<meta\s+(?:name|property)="(?:description|keywords|robots|og:[a-z:_]+|twitter:[a-z:_]+)"[\s\S]*?\/>\s*/g, '')
          .replace(/<link rel="canonical"[^>]*>\s*/g, '')
          .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '')
          .replace('</head>', `    ${head}\n  </head>`);
        const out = path.join(dist, route.slice(1), 'index.html');
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, html);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    adsPrerender(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicons/favicon.png', 'icons/apple-touch-icon.png', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'TestFlow | OAU CBT Practice',
        short_name: 'TestFlow',
        description: 'OAU CBT practice, timed tests, mock exams, and course revision for Obafemi Awolowo University students.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        categories: ['education'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        // Offline app shell: precache the built assets and fall back to the SPA
        // entry for navigations. API calls stay network-only (server-authoritative).
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff,woff2,ttf}'],
        navigateFallback: '/index.html',
        // `/r/:token` is a server-rendered page (the Open Graph share link), not an app route:
        // letting the worker answer it would hand a crawler the SPA shell instead of the tags.
        navigateFallbackDenylist: [/^\/api\//, /^\/r\//, /^\/ads\.txt$/],
        cleanupOutdatedCaches: true,
        skipWaiting: true, // a new deploy replaces the old worker immediately
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB to accommodate growing app shell
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'es2020',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
