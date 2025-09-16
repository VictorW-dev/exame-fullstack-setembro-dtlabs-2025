import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // permite acessar do container
    port: 5173,
    strictPort: true
  },
  define: {
    "process.env": {} // corrige libs que tentam acessar process.env
  }
});
