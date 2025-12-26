import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KoruFormWidget',
      fileName: (format) => `index.js`,
      formats: ['iife'],
    },
    rollupOptions: {
      // For a single standalone file, we might NOT want to externalize React
      // unless we expect the host page to already have it.
      // The user asked for a "único archivo index.js", so bundling everything is safer.
      output: {
        extend: true,
      },
    },
  },
  define: {
    'process.env': {},
  },
});
