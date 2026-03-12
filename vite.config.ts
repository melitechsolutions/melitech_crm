import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Use a function to split third-party packages into separate chunks.
        // This helps avoid a single very large initial chunk by grouping node_modules
        // packages into per-package vendor chunks and special-casing very large libs.
        manualChunks(id: string) {
          if (!id) return undefined;
          if (id.includes('node_modules')) {
            // Prefer grouping known large libs into a dedicated chunk
            if (id.includes('html2canvas')) return 'html2canvas';
            if (id.includes('purify') || id.includes('purify.es')) return 'purify';
            if (id.includes('@radix-ui')) return 'vendor-ui';
            if (id.includes('@trpc')) return 'api-client';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            // Fallback: take the package name from the path
            const parts = id.split('node_modules/')[1].split('/');
            return parts[0];
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
