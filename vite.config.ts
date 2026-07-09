import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const productionBase = '/algodat/';

const base =
  process.env.VITE_BASE_PATH ?? (process.env.NODE_ENV === 'production' ? productionBase : '/');

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/app-icon.svg', 'icons/maskable-icon.svg'],
      manifest: {
        name: 'AlgoDat Study System',
        short_name: 'AlgoDat',
        description: 'Lokale, quellenbasierte Vorbereitung auf Algorithmen und Datenstrukturen',
        lang: 'de',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#f5f4ef',
        theme_color: '#173f3a',
        icons: [
          { src: 'icons/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          {
            src: 'icons/maskable-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cacheId: 'algodat-study-system-v7',
        globPatterns: ['**/*.{js,css,html,svg,woff2,json}'],
        globIgnores: ['**/*.pdf', '**/info 1 copy/**', '**/pdfs/**', '**/tmp/**'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
      },
      devOptions: { enabled: false },
    }),
  ],
  build: { sourcemap: false, target: 'es2022' },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], css: true },
});
