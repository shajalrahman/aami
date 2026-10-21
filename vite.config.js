import { defineConfig } from 'vite';

export default defineConfig({
  // Custom domain → base is always '/'
  base: '/',
  build: {
    // Output to dist/
    outDir: 'dist',
    // Don't inline assets as base64 — keep them as files
    assetsInlineLimit: 0,
  },
});
