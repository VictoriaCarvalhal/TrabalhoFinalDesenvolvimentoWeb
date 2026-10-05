import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
    // host.docker.internal em vez de localhost/127.0.0.1: dentro do container
    // do front, localhost e o proprio container; host.docker.internal aponta
    // para o PC onde o backend esta publicado em :8000. Fora do Docker
    // (npm run dev local) pode voltar para http://127.0.0.1:8000.
    proxy: {
      '/api': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
      '/static': "http://localhost:8000"
    },
  }
})