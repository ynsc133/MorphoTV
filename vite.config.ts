import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    base: "/", // 使用 Hash Router 时不需要设置 base
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000, // 单位 KB，默认 500
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // if (id.includes('react') || id.includes('react-dom')) {
              //   return 'react';
              // }
              // if (id.includes('react-router-dom')) {
              //   return 'router';
              // }
              if (id.includes('artplayer') || id.includes('hls.js')) {
                return 'player';
              }
              // if (id.includes('lucide-react')) {
              //   return 'icons';
              // }
              // if (id.includes('@radix-ui')) {
              //   return 'radix-ui';
              // }
              // if (
              //   id.includes('class-variance-authority') ||
              //   id.includes('tailwind-merge') ||
              //   id.includes('clsx')
              // ) {
              //   return 'style-utils';
              // }
              // if (id.includes('sonner')) {
              //   return 'sonner';
              // }
              // 其他第三方库统一打包
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
