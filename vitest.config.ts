import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Resolve the "@/..." path alias (from tsconfig) so unit tests can import
// modules that use it — e.g. lib/waitlist.ts → "@/lib/prisma".
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
