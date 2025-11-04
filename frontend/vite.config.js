import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        // Ensure service worker and manifest are included in build
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sw.js' || assetInfo.name === 'manifest.json') {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
})
