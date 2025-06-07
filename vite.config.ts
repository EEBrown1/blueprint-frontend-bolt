import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import csp from 'vite-plugin-csp';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    csp({
      policies: {
        'default-src': ["'self'"],
        'connect-src': [
          "'self'",
          'https://*.supabase.co',
          'https://pi.pdfjs.express',
          'https://cdnjs.cloudflare.com',
        ],
        'font-src': ["'self'", 'data:', 'https://cdnjs.cloudflare.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'worker-src': ["'self'", 'blob:'],
      },
    }),
  ],
  define: {
    // Ensure environment variables are properly exposed
    'process.env': {}
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
