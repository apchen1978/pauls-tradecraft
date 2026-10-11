import { createReadStream, existsSync, statSync, cpSync } from "node:fs";
import { extname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const teammateDir = resolve("prototype/teammate-type");
const teammateMime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function teammateToy() {
  return {
    name: "teammate-toy",
    configureServer(server) {
      server.middlewares.use("/prototype/teammate-type", (req, res, next) => {
        const url = new URL(req.url || "/", "http://localhost");
        let pathname = decodeURIComponent(url.pathname);
        if (pathname === "/" || pathname === "") pathname = "/index.html";
        const file = resolve(teammateDir, `.${pathname}`);
        if (!file.startsWith(teammateDir) || !existsSync(file) || statSync(file).isDirectory()) {
          next();
          return;
        }
        res.setHeader("Content-Type", teammateMime[extname(file)] || "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      cpSync(teammateDir, resolve("dist/prototype/teammate-type"), { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), teammateToy()],
  base: "./",
});
