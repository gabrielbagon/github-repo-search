import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true, // ← habilita describe/it/expect no escopo global
    setupFiles: [path.resolve(__dirname, "test/setup.ts")],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    css: true,
    restoreMocks: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
