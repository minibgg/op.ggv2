import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  // base: '/op.ggv2/',
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],

  server: {
    proxy: {
      "/api": {
        target: "https://raw.communitydragon.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
