import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }: ConfigEnv) => {
  const apiBaseUrl = process.env.VITE_API_BASE_URL ?? "http://localhost:3001";
  const proxyTarget = new URL(apiBaseUrl).origin;

  return {
    root: "./",
    publicDir: "./public",
    build: {
      rollupOptions: {
        input: "./index.html",
        output: {
          manualChunks: (id: string) => {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react";
            if (id.includes("node_modules/react-router-dom")) return "router";
            if (id.includes("node_modules/@radix-ui")) return "ui";
            if (id.includes("node_modules/lodash") || id.includes("node_modules/axios")) return "vendor";
            if (id.includes("/addons/") && id.includes("/index.ts")) return "addons";
          },
        },
      },
    },
    define: {
      "import.meta.env.LOG_LEVEL": JSON.stringify(process.env.LOG_LEVEL || "info"),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    optimizeDeps: {
      // IMPORTANT: on laisse TanStack tel quel (pas de pré-optimisation esbuild)
      exclude: [
        "ioredis",
        "redis-errors",
        "redis-parser",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
      include: ["react", "react-dom", "react-router-dom"],
      // Astuce: une fois stable, tu peux commenter `force` pour éviter la ré-optimisation systématique
      // force: true,
    },
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
