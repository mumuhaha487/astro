import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 4174,
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
});
