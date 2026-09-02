import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Generate maps for Sentry, but don't advertise them as public assets.
    sourcemap: "hidden",
    reportCompressedSize: false
  }
});
