import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
// import svgr from '@svgr/rollup';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  // plugins: [react(), svgr({
  //   svgo: true,
  // }),],
  plugins: [react(), svgr(), tailwindcss()],
});
