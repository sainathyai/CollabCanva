import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable TypeScript support
      jsxRuntime: 'automatic',
    })
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.logs for debugging
        drop_debugger: true,
        pure_funcs: []
      }
    },
    // Add build metadata to help identify which build is running
    define: {
      '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
      '__BUILD_VERSION__': JSON.stringify('backend-api-only-v2')
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

