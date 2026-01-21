import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [
      "reynalda.ngrok-free.app", // your specific ngrok subdomain
      ".ngrok-free.app", // wildcard for any ngrok-free.app subdomain
      "thelytokous-driverless-reynalda.ngrok-free.dev",
    ],
  },
});
