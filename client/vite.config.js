import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // defaults to current folder
  build: {
    outDir: 'dist',
  },
});
