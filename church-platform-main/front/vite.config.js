import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 4131,
  },
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: {
      quill: path.resolve(__dirname, 'node_modules/quill/dist/quill.min.js'),
    },
  },
  optimizeDeps: {
    include: ['quill', 'react-quill-2', 'quill-better-table'],
  },
});
