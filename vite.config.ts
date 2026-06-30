import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { aniwatchDevMiddleware } from './dev-server'

export default defineConfig({
  plugins: [
    react(),
    {
      // Подключаем Aniwatch endpoints прямо в Vite dev-сервере
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
    target: 'es2020',
    cssMinify: true,
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Умное разделение: тяжёлые библиотеки в свои чанки,
        // которые грузятся только когда нужны
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('hls.js')) return 'hls'
            if (id.includes('firebase')) return 'firebase'
            if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor'
            if (id.includes('zustand')) return 'state'
            if (id.includes('lucide-react')) return 'icons'
            // Остальные мелкие — в один общий vendor
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  // Префетч: при бездействии браузер заранее подгружает чанки роутов
  experimental: {
    renderBuiltUrl(filename) {
      return '/' + filename
    },
  },
})
