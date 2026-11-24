import path from "node:path";
import { defineConfig } from "vite";

const studioRoot = import.meta.dirname;
const pkg = (name: string) => path.resolve(studioRoot, "node_modules", name);

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom", "lexical"],
    alias: [
      { find: /^react$/, replacement: pkg("react") },
      { find: /^react\/(.+)$/, replacement: `${pkg("react")}/$1` },
      { find: /^react-dom$/, replacement: pkg("react-dom") },
      { find: /^react-dom\/(.+)$/, replacement: `${pkg("react-dom")}/$1` },
      { find: /^lexical$/, replacement: pkg("lexical") },
    ],
  },
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
