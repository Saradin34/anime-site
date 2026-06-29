import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { aniwatchDevMiddleware } from './dev-server'

export default defineConfig({
  plugins: [
    react(),
    {
      // Подключаем Aniwatch endpoints прямо в Vite dev-сервере,
      // чтобы в локальной разработке /api/aniwatch/* работало без vercel dev.
      name: 'aniwatch-dev-api',
      configureServer(server) {
        server.middlewares.use(aniwatchDevMiddleware())
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth'],
          hls: ['hls.js'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
