import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Uncomment 'base' ONLY if deploying to subfolder (e.g., domain.com/freelancetracker/)
  // Leave commented for subdomain deployment (e.g., freelancetracker.domain.com)
  // base: '/freelancetracker/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['@playwright/test', 'playwright', 'playwright-core'],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
