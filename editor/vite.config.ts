import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    proxy: {
      "/api/save": {
        target: "http://localhost:3000", // Dummy target
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            let body = [] as any[];
            req.on("data", chunk => body.push(chunk));
            req.on("end", () => {
              const bodyString = Buffer.concat(body).toString();
              if (bodyString) console.log("Request Body:", bodyString);
              res.end("File saved");
            });
          });
        },
      },
    },
  },
});
