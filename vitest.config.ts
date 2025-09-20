import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(new URL("./", import.meta.url)));

export default defineConfig({
  test: {
    environment: "jsdom",                
    setupFiles: ["./test/setup.ts"],     
    include: ["**/*.test.ts", "**/*.test.tsx"], 
    css: true,                           
    restoreMocks: true,                  
    clearMocks: true,
  },
  resolve: {
    alias: {
      "@": root,                         
    },
  },
});
