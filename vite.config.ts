// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Lovable overrides this in its sandbox; external builds target their host.
  nitro: { preset: process.env["NITRO_PRESET"] || (process.env["VERCEL"] ? "vercel" : "node-server") },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Pre-declare the hero's three.js addon so Vite never re-optimizes it mid-session;
    // a mid-session re-optimize tears down the running React instance and blanks the page.
    optimizeDeps: { include: ["three", "three/addons/geometries/RoundedBoxGeometry.js"] },
  },
});
