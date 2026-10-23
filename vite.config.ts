import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// DISABLE_HMR=true (utilisé par AI Studio) désactive le rechargement à chaud et la surveillance des fichiers.
const disableHmr = process.env.DISABLE_HMR === 'true';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: !disableHmr,
    watch: disableHmr ? null : {},
  },
});
