import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
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
