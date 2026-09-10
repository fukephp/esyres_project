import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

const api = process.env.API_PROXY ?? 'http://127.0.0.1:8000'
const reverb = process.env.REVERB_PROXY ?? 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: false },
      manifest: {
        name: 'Esyres',
        short_name: 'Esyres',
        start_url: '/',
        display: 'standalone',
        lang: 'bs',
      },
    }),
  ],
  server: {
    proxy: {
      '/graphql': api,
      '/sanctum': api,
      '/qr': api,
      '/app': {
        target: reverb,
        ws: true,
      },
    },
  },
})

