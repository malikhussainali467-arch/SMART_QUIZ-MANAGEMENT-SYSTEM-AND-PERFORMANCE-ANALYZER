import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development (npm run client:dev) API calls are forwarded to the Node server on port 5000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
