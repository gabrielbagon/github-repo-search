import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";                 
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],                                    
  test: {
    environment: "jsdom",
    globals: true,                                        
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