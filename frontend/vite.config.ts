import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    allowedHosts: [
      "reynalda.ngrok-free.app", // your specific ngrok subdomain
      ".ngrok-free.app", // wildcard for any ngrok-free.app subdomain
      "thelytokous-driverless-reynalda.ngrok-free.dev",
    ],
  },
});
