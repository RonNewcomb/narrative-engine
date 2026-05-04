import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { exit } from "node:process";
import { fileURLToPath } from "node:url";
import { compileStory } from "./compile.ts";
import type { iFictionRecord } from "./iFictionRecord";

/**
 * To run,                   npm run publish
 */

const cwd = process.cwd(); // Current working directory (where command was run)
const scriptDir = dirname(fileURLToPath(import.meta.url)); // Script's directory (where the script file is located)

console.log("Current working directory:", cwd);
console.log("Script directory:", scriptDir);

const appName = process.argv[2];
if (!appName.trim()) {
  console.log("Usage: node publish.ts <story-file>");
  exit(0);
}
const appDir = cwd + "/";
const buildDir = appDir + "dist/";
const commonDir = scriptDir + "/assets/";

console.log("Clear distribution folder", buildDir);
if (existsSync(buildDir)) rmSync(buildDir, { recursive: true, force: true });
if (!existsSync(buildDir)) mkdirSync(buildDir);

console.log("Reading", appDir + "bibliographic.json");
if (!existsSync(appDir + "bibliographic.json")) {
  console.log("bibliographic.json not found, creating template...");
  const biblio = readFileSync(scriptDir + "/bibliographic.json", "utf-8");
  writeFileSync(appDir + "bibliographic.json", biblio);
}

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

console.log("Compiling story");
await compileStory(appDir + "/" + appName, buildDir + "/story.json");

console.log("Copying assets");
readdirSync(commonDir).forEach(filename => copyFileSync(commonDir + filename, buildDir + filename));

console.log("Creating index.html");
const indexHtml = readFileSync(buildDir + "index.html", "utf-8");
writeFileSync(buildDir + "index.html", templating(indexHtml));

console.log("Creating manifest.json");
const manifestJson = readFileSync(buildDir + "manifest.json", "utf-8");
writeFileSync(buildDir + "manifest.json", templating(manifestJson));

console.log(" ");
console.log("Compiled successfully.");

function templating(contents: string): string {
  return substitutions.reduce((text, [key, value]) => (text = text.replaceAll(key, value.toString())), contents);
}

console.log("Informing editor");
const editorRuntimeDir = scriptDir + "/../editor/runtime/";
if (!existsSync(editorRuntimeDir)) mkdirSync(editorRuntimeDir);
readdirSync(buildDir).forEach(filename => copyFileSync(buildDir + filename, editorRuntimeDir + filename));
