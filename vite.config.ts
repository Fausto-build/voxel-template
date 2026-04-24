import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@dimforge/rapier3d-compat") || id.includes("@react-three/rapier")) {
            return "rapier";
          }
          if (id.includes("node_modules/three/")) {
            return "three";
          }
          if (id.includes("@react-three/fiber") || id.includes("@react-three/drei")) {
            return "r3f";
          }
        },
      },
    },
  },
});
