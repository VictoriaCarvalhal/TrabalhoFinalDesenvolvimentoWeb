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
    // No desenvolvimento, /api e /admin vao para o runserver do Django, entao
    // o front chama a API pelo mesmo caminho relativo que usa na Vercel.
    // 127.0.0.1 em vez de localhost: o Node resolve localhost para ::1
    // (IPv6) e o runserver escuta em 127.0.0.1 (IPv4) -> ECONNREFUSED.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/admin': 'http://127.0.0.1:8000',
    },
  }
})