import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  // api/ testi pārbauda kontaktformas servera loģiku, tāpēc tie ir tikpat
  // obligāti kā src/ testi.
  test: { environment: "node", include: ["src/**/*.test.ts", "api/**/*.test.ts"] },
});
