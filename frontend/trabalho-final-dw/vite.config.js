import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Alvo do runserver do Django. Padrao: backend rodando no proprio PC, que e o
// caso do npm run dev local. Dentro do container do front o docker-compose
// define VITE_PROXY_TARGET apontando para o host, porque la 127.0.0.1 e o
// proprio container.
const apiTarget = process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173,
    hmr: {
      clientPort: 5173
    },
    // No desenvolvimento, /api, /admin e /static vao para o runserver do Django,
    // entao o front chama a API pelo mesmo caminho relativo que usa na Vercel.
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/admin': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/static': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  }
})