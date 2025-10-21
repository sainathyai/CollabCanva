import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Temporarily enable console.logs for debugging
        drop_debugger: true,
        pure_funcs: []
      }
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'konva-vendor': ['react-konva', 'konva'],
          'firebase-vendor': ['firebase/app', 'firebase/auth']
        }
      }
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-konva', 'konva']
  }
})

