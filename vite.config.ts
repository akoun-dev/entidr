import { defineConfig, type ConfigEnv } from "vite";
import { default as react } from '@vitejs/plugin-react';
import path from "path";

export default defineConfig(({ mode }: ConfigEnv) => {
  const apiBaseUrl = process.env.VITE_API_BASE_URL;
  const proxyTarget = apiBaseUrl ? new URL(apiBaseUrl).origin : "";

  return {
    define: {
      'import.meta.env.LOG_LEVEL': JSON.stringify(process.env.LOG_LEVEL || 'info'),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    optimizeDeps: {
      exclude: ['ioredis', 'redis-errors', 'redis-parser'],
      include: ['react', 'react-dom', 'react-router-dom'],
      force: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react';
            }
            if (id.includes('node_modules/react-router-dom')) {
              return 'router';
            }
            if (id.includes('node_modules/@radix-ui')) {
              return 'ui';
            }
            if (id.includes('node_modules/lodash') || id.includes('node_modules/axios')) {
              return 'vendor';
            }
            if (id.includes('/addons/') && id.includes('/index.ts')) {
              return 'addons';
            }
          },
        },
      },
    },
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
