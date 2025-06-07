import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob: https://*.pexels.com;
        font-src 'self' data:;
        connect-src 'self' https://*.supabase.co wss://*.supabase.co;
        frame-src 'self' https://*.supabase.co;
        media-src 'self' https://*.supabase.co;
        worker-src 'self' blob:;
      `.replace(/\s+/g, ' ').trim(),
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'interest-cohort=()'
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.min.js']
  },
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
