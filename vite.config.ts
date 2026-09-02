import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * `SINGLE_FILE=1` collapses the build back into one chunk.
 *
 * The routes are code-split, so an ordinary build emits a small entry and a
 * chunk per page and fetches them as the visitor moves. The standalone bundle
 * cannot do that: it is one HTML file with no server behind it, and a dynamic
 * import would be a request to nowhere. `inlineDynamicImports` puts everything
 * back in one chunk for that build alone, so both outputs come from the same
 * source and neither is a special case in the code.
 */
const SINGLE_FILE = process.env.SINGLE_FILE === "1";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: SINGLE_FILE
    ? { rollupOptions: { output: { inlineDynamicImports: true } } }
    : {},
}));
