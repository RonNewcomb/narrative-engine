import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [basicSsl()], // speech-to-text requires https
  server: {
    host: true,
    port: 24218,
    strictPort: true,
    // proxy: {
    //   "/api/save": {
    //     target: "http://localhost:3000", // Dummy target
    //     changeOrigin: true,
    //     configure: (proxy, options) => {
    //       proxy.on("proxyReq", (proxyReq, req, res) => {
    //         let body = [] as any[];
    //         req.on("data", chunk => body.push(chunk));
    //         req.on("end", () => {
    //           const bodyString = Buffer.concat(body).toString();
    //           if (bodyString) console.log("Request Body:", bodyString);
    //           res.end("File saved");
    //         });
    //       });
    //     },
    //   },
    // },
  },
});
