import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Désactivé temporairement en raison de problèmes de compatibilité ESM/CommonJS
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const apiBaseUrl = process.env.VITE_API_BASE_URL;
  const proxyTarget = apiBaseUrl ? new URL(apiBaseUrl).origin : "";

  return {
    define: {
      'import.meta.env.LOG_LEVEL': JSON.stringify(process.env.LOG_LEVEL || 'info'),
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
      // Désactivé temporairement en raison de problèmes de compatibilité ESM/CommonJS
      // mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
