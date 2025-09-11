import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';
import path from 'path';

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    // vitePrerenderPlugin({
    //   renderTarget: "#root",
    //   prerenderScript: path.resolve(__dirname, "src/components/prerender.jsx"),
    //   additionalPrerenderRoutes: ["/404"], // we’ll add game routes from API dynamically
    // }),
  ],
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@styles": "/src/styles",
      "@shared": "/src/shared",
      "@utility": "/src/utility",
      "@assets": "/src/assets",
    },
  },
  server: {
    port: 8080,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
