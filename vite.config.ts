import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ command, isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    sitemap({
      hostname: "https://gatisdesign.com",
      generateRobotsTxt: false,
      dynamicRoutes: [
        "/portfolio",
        "/par-mani",
        "/kontakti",
        "/privatuma-politika",
        "/portfolio/box-latvia",
        "/portfolio/apmekle",
        "/portfolio/digitalaisdzintars",
        "/portfolio/logo-branding",
        "/portfolio/web-design",
        "/portfolio/illustrations",
        "/portfolio/print",
      ],
      exclude: ["/404"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              "react-vendor": ["react", "react-dom", "react-router-dom"],
              "ui-radix": [
                "@radix-ui/react-dialog",
                "@radix-ui/react-dropdown-menu",
                "@radix-ui/react-popover",
                "@radix-ui/react-select",
                "@radix-ui/react-toast",
                "@radix-ui/react-tooltip",
                "@radix-ui/react-slot",
              ],
              motion: ["framer-motion", "lenis"],
              form: ["react-hook-form", "@hookform/resolvers", "zod"],
              icons: ["lucide-react"],
              query: ["@tanstack/react-query"],
            },
          },
    },
  },
}));
