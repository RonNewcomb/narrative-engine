import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { exit } from "node:process";
import { fileURLToPath } from "node:url";
import type { iFictionRecord } from "../common/iFictionRecord";
import { compileStory } from "./compile.js";

/**
 * To run,                   npm run publish3
 */

// Current working directory (where command was run)
const cwd = process.cwd();
// Script's directory (where the script file is located)
const scriptDir = dirname(fileURLToPath(import.meta.url));

console.log("Current working directory:", cwd);
console.log("Script directory:", scriptDir);

const argTypes: Record<string, string> = {
  "-n": "name",
  "-a": "appDir",
  "-b": "buildDir",
  "-c": "commonDir",
  "-d": "deployDir",
};

const parsedargs: Record<string, string | undefined> = {};
for (let args = process.argv.slice(2); args.length; true) {
  const paramSwitch = argTypes[args.shift() || ""];
  if (!paramSwitch) {
    console.log(JSON.stringify(argTypes, undefined, 2));
    exit(1);
  }
  parsedargs[paramSwitch] = args.shift();
}

const appName = parsedargs.name || "system3.sample.txt";
const appDir = parsedargs.appDir || cwd;
const buildDir = parsedargs.buildDir || appDir + "./build/";
const commonDir = parsedargs.commonDir || scriptDir + "/assets/";
const deployDir = parsedargs.deployDir || appDir + "./deploy/"; // "/mnt/c/inetpub/wwwroot/tin/";

console.log("Reading", appDir + "bibliographic.json");
const about: iFictionRecord["story"]["bibliographic"] = JSON.parse(readFileSync(appDir + "bibliographic.json", "utf-8"));

const substitutions = Object.entries({
  "${appName}": appName,
  "${ifid}": new Date().toISOString(),
  "${title}": about.title,
  "${author}": about.author,
  "${headline}": about.headline,
  "${firstpublished}": about.firstpublished,
  "${language}": about.language || "en",
  "${description}": about.description || `${about.title}: ${about.headline} by ${about.author}`,
  '<link rel="stylesheet" href="index.css" />': "",
  "</head>": "\n</head>",
} satisfies Record<string, string | number | boolean>);

console.log("Clear build folder", buildDir);
if (existsSync(buildDir)) rmSync(buildDir, { recursive: true, force: true });
if (!existsSync(buildDir)) mkdirSync(buildDir);

console.log("Copying assets");
readdirSync(commonDir).forEach(filename => copyFileSync(commonDir + filename, buildDir + filename));

function templating(contents: string): string {
  return substitutions.reduce((text, [key, value]) => (text = text.replaceAll(key, value.toString())), contents);
}

console.log("Create index.html");
const indexHtml = readFileSync(buildDir + "index.html", "utf-8");
writeFileSync(buildDir + "index.html", templating(indexHtml));

console.log("Create manifest.json");
const manifestJson = readFileSync(buildDir + "manifest.json", "utf-8");
writeFileSync(buildDir + "manifest.json", templating(manifestJson));

console.log("Compiling story");
await compileStory(appDir + "/" + appName, buildDir + "/story.json");

// console.log("Build", appDir + appName + ".ts");
// const buildResult = await build({
//   build: {
//     lib: {
//       entry: resolve(appDir + appName + ".ts"),
//       formats: ["es"],
//       fileName: () => appName + ".js",
//     },
//     outDir: buildDir,
//     emptyOutDir: false,
//     cssCodeSplit: false,
//     rollupOptions: {
//       output: {
//         assetFileNames: "[name].[ext]",
//       },
//     },
//   },
// });

console.log(" ");
console.log("Compiled successfully.");

// if (deployDir) {
//   console.log("Deploy", buildDir + "*", "to", deployDir + "*");
//   if (!existsSync(deployDir)) mkdirSync(deployDir);
//   readdirSync(buildDir).forEach(filename => copyFileSync(buildDir + filename, deployDir + filename));
// }
