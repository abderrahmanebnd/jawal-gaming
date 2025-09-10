import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@styles': '/src/styles',
      '@shared': '/src/shared',
      '@utility': '/src/utility',
      '@assets': '/src/assets'
    }
  },
  server: {
    port: 8080,
    open: true,
    proxy:{
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
