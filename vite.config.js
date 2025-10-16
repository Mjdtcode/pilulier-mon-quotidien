import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anthropic-proxy': {
        target: 'http://localhost:8888',
        changeOrigin: true
      }
    }
  }
})
