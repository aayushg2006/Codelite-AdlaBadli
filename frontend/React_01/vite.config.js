import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This tells Vite: Any request starting with /n8n-webhook should be forwarded to n8n
      '/n8n-webhook': {
        target: 'https://aayushgcode.app.n8n.cloud',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/n8n-webhook/, '')
      }
    }
  }
})