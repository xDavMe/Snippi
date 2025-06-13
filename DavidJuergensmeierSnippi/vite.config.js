import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  base: '/main/', // 👈 THIS is what tells Vite where your app is hosted
  plugins: [svelte()],
  build: {
    outDir: 'dist',
  },
});
