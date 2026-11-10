import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // Avoid unhandled aggregate error stack trace in terminal when backend is down
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error: 'CloudBank backend API is not running on http://localhost:3000.',
                })
              );
            }
          });
        },
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
