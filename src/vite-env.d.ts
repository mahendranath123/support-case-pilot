/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http:///103.127.117.182:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

