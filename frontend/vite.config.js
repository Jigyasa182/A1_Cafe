import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://a1-cafe-backend-07w6.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
