import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode and current working directory
  const env = loadEnv(mode, process.cwd(), "");

  // Dynamically extract host and port from VITE_BASE_URL (or VITE_API_BASE_URL) via URL parser
  let port = undefined;
  let host = undefined;
  let origin = undefined;

  const rawBaseUrl = env.VITE_BASE_URL || env.VITE_API_BASE_URL || "";
  if (rawBaseUrl) {
    try {
      const url = new URL(rawBaseUrl);
      if (url.port) {
        port = Number(url.port);
      }
      if (url.hostname) {
        host = url.hostname;
      }
      origin = url.origin;
    } catch {
      // Fallback if not a full valid URL string
    }
  }

  // Allow explicit PORT or VITE_PORT fallback if not already set from URL
  if (!port) {
    if (env.PORT) {
      const parsed = Number(env.PORT);
      if (!Number.isNaN(parsed)) port = parsed;
    } else if (env.VITE_PORT) {
      const parsed = Number(env.VITE_PORT);
      if (!Number.isNaN(parsed)) port = parsed;
    }
  }

  if (env.HOST) {
    host = env.HOST;
  } else if (env.VITE_HOST) {
    host = env.VITE_HOST;
  }

  // Base path for router/assets (defaults to root "/" unless explicitly specified via VITE_ROUTER_BASE)
  let base = "/";
  if (env.VITE_ROUTER_BASE) {
    base = env.VITE_ROUTER_BASE.replace(/\/+$/, "") + "/";
  }

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: host || "localhost",
      port,
      strictPort: true, // Prevents falling back to a dynamic/random port if port is busy
      origin,
      watch: {
        usePolling: true,
      },
    },
    preview: {
      host: host || "localhost",
      port,
      strictPort: true,
    },
  };
});
