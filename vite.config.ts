import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import nesting from 'tailwindcss/nesting';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        nesting,
        tailwindcss,
        autoprefixer,
      ],
    },
  },
}); 