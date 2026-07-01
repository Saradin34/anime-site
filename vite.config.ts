import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anilibria-v3': {
        target: 'https://api.anilibria.tv/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anilibria-v3/, ''),
      },
      '/api/aniliberty': {
        target: 'https://aniliberty.top/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aniliberty/, ''),
      },
      '/api/jikan': {
        target: 'https://api.jikan.moe/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jikan/, ''),
      },
    },
  },
});
