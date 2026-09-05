import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "/forum-editor/",
  publicDir: false,
  build: {
    outDir: "../public/forum-editor",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: resolve(__dirname, "forum.html"),
      output: {
        entryFileNames: "assets/forum-editor.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
