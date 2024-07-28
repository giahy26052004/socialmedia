import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    //get rid of the cors error
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false // remove /api from the request path to match the route in backend server
      }
    }
  },
  build: {
    sourcemap: true,

    rollupOptions: {
      onLog(level, log, handler) {
        if (log.cause && log.cause.message === `Can't resolve original location of error.`) {
          return;
        }
        handler(level, log);
      }
    }
  }
});
