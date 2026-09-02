import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const api = process.env.API_PROXY ?? 'http://127.0.0.1:8000'
const reverb = process.env.REVERB_PROXY ?? 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/graphql': api,
      '/sanctum': api,
      '/app': {
        target: reverb,
        ws: true,
      },
    },
  },
})

