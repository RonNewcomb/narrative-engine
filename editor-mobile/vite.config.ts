import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [basicSsl()], // speech-to-text requires https
  server: {
    host: true,
  },
});
