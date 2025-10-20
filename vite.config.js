// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const enablePWA = process.env.NODE_ENV === 'production' || process.env.VITE_ENABLE_PWA === 'true'

export default defineConfig({
  plugins: [
    react(),
    ...(enablePWA ? [VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pill.svg','Mon quotidien icone 192.png','Mon quotidien icone 512.png'],
      manifest: {
        name: 'Pilulier : Mon Quotidien',
        short_name: 'Pilulier',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#2563eb',
        background_color: '#f7fbff',
        icons: [
          { src: '/Mon quotidien icone 192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/Mon quotidien icone 512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{html,js,css,png,svg,webmanifest}'] }
    })] : [])
  ],
  server: { port: 5173 }
})
