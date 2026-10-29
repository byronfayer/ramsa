import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, el front (5173) habla con el backend (3001) a través de este proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
})
