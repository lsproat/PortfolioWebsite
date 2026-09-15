import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Explicitly publish only the public site key, keeping the existing name.
  define: {
    "import.meta.env.CLOUDFLARE_TURNSTILE_SITE_KEY": JSON.stringify(
      loadEnv(mode, process.cwd(), "CLOUDFLARE_TURNSTILE_SITE_KEY").CLOUDFLARE_TURNSTILE_SITE_KEY || "",
    ),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
