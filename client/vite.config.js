import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Us — Couple Games',
        short_name: 'Us',
        description: 'A private, immersive couple game app for love, play, and connection.',
        theme_color: '#FFD6E8',
        background_color: '#FFF0F5',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache the app shell (JS, CSS, HTML, static assets)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Exclude socket.io and API requests from being cached to ensure real-time works
        navigateFallbackDenylist: [/^\/socket\.io/, /^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly', // Never cache API routes
          },
          {
            urlPattern: /socket\.io/,
            handler: 'NetworkOnly', // Never cache websockets
          }
        ]
      }
    })
  ],
})
