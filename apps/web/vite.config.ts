import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // In production the Expo web app is exported to /app. During local dev of
      // the marketing site, proxy /app to the live deployment so the embedded
      // phone demo still shows the real app.
      '/app': {
        target: 'https://mynichi.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/app\/?/, '/')
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'vs-duolingo': resolve(__dirname, 'vs/duolingo.html'),
        'vs-anki': resolve(__dirname, 'vs/anki.html'),
        'vs-google-translate': resolve(__dirname, 'vs/google-translate.html'),
        'vs-jisho': resolve(__dirname, 'vs/jisho.html')
      }
    }
  }
});
