import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Happy Health — static marketing shell.
// Served as a GitHub Pages *project* site, so assets must be prefixed with the
// repository name. Keep this in sync with the repo name (happy-health).
// Live URL: https://happyhealthapp.github.io/happy-health/
export default defineConfig({
  base: "/happy-health/",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
