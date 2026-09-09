import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    hmr: {
      overlay: false,  // Disable the overlay for cleaner errors
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 🆕 Add alias for react-is
      'react-is': path.resolve(__dirname, 'node_modules/react-is/index.js'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['react-is'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/react-is')) {
            return 'recharts-vendor'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-is', 'recharts'],
  },
})