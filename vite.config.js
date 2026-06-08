import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'charts-vendor':  ['recharts'],
          'icons-vendor':   ['react-icons'],
          'store-vendor':   ['zustand', 'axios', 'clsx'],
        },
      },
    },
  },
})
