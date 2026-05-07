import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import type { iFictionRecord } from "../iFictionRecord";

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
        const editorPublishAtRuntimeDir = scriptDir + "/../../editor/publisher/";

        // create or clear out /editor/runtime/
        if (existsSync(editorRuntimeDir)) rmSync(editorRuntimeDir, { recursive: true, force: true });
        if (!existsSync(editorRuntimeDir)) mkdirSync(editorRuntimeDir);

        // copy all from /dist/ to /editor/runtime/
        readdirSync(buildDir).forEach(filename => copyFileSync(buildDir + filename, editorRuntimeDir + filename));

        // create default intfic record
        const packageJson = JSON.parse(readFileSync(scriptDir + "/../../package.json", "utf-8"));
        const version = packageJson.version + "." + new Date().toISOString().replace(/[^0-9]/g, "");

        const biblioJson = JSON.parse(readFileSync(scriptDir + "/../bibliographic.json", "utf-8"));
        const intficRecord: iFictionRecord = {
          story: {
            identification: { ifid: [], format: "html" },
            bibliographic: biblioJson,
            colophon: { generator: "Mirrorway", generatorversion: version, originated: new Date().toISOString().split("T")[0] },
          },
        };

        // copy select files from here to /editor/publisher/ ; THESE FILES work in browser and in nodejs
        copyFileSync(scriptDir + "/../parser.js", editorPublishAtRuntimeDir + "parser.js");
        writeFileSync(editorPublishAtRuntimeDir + "intfic.json", JSON.stringify(intficRecord, undefined, 4));
      },
    },
  ],
});
