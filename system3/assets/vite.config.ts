import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/* builds the runtime; from /system3/assets issue "npx vite build" */
export default defineConfig({
  plugins: [
    viteSingleFile(),
    {
      name: "postbuild-commands",
      closeBundle: async () => {
        const cwd = process.cwd(); // Current working directory (where command was run)
        const scriptDir = dirname(fileURLToPath(import.meta.url)); // Script's directory (where the script file is located)
        const buildDir = cwd + "/dist/";
        const editorRuntimeDir = scriptDir + "/../../editor/runtime/";
        if (existsSync(editorRuntimeDir)) rmSync(editorRuntimeDir, { recursive: true, force: true });
        if (!existsSync(editorRuntimeDir)) mkdirSync(editorRuntimeDir);
        readdirSync(buildDir).forEach(filename => copyFileSync(buildDir + filename, editorRuntimeDir + filename));
      },
    },
  ],
});
