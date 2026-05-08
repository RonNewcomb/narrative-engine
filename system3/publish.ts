import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path, { dirname } from "node:path";
import { exit } from "node:process";
import { fileURLToPath } from "node:url";
import type { iFictionRecord } from "./iFictionRecord";
import { parse } from "./parser.js";

/**
 * To run,                   npm run publish
 */

const cwd = process.cwd(); // Current working directory (where command was run)
const scriptDir = dirname(fileURLToPath(import.meta.url)); // Script's directory (where the script file is located)
const appDir = cwd + "/";
const buildDir = appDir + "dist/";
const commonDir = scriptDir + "/assets/dist/";
const editorRuntimeDir = scriptDir + "/../editor/runtime/";

console.log("Current working directory:", cwd);
console.log("Script directory:", scriptDir);

console.log(`Reading ${appDir}/about.json`);
if (!existsSync(appDir + "about.json")) {
  console.error(`Missing ${appDir}about.json`);
  exit(1);
}

const record: iFictionRecord = JSON.parse(readFileSync(appDir + "about.json", "utf-8"));
const about: iFictionRecord["story"]["bibliographic"] = record.story.bibliographic;

const substitutions = Object.entries({
  "${appName}": about.title,
  "${ifid}": record.story.identification.ifid[0],
  "${title}": about.title,
  "${author}": about.author,
  "${headline}": about.headline,
  "${firstpublished}": about.firstpublished,
  "${language}": about.language || "en",
  "${description}": about.description || `${about.title} by ${about.author}`,
} satisfies Record<string, string | number | boolean>);

console.log("Open distribution folder", buildDir);
if (!existsSync(buildDir)) mkdirSync(buildDir);
if (!existsSync(editorRuntimeDir)) mkdirSync(editorRuntimeDir);

console.log("Compiling story");
await compileStory(appDir + record.filename, buildDir + "intfic.json");

console.log("Copying templated assets");
readdirSync(commonDir).forEach(filename => {
  copyFileSync(commonDir + filename, buildDir + filename);
  copyFileSync(commonDir + filename, editorRuntimeDir + filename);
});

console.log("Creating index.html");
const indexHtml = readFileSync(buildDir + "index.html", "utf-8");
writeFileSync(buildDir + "index.html", templating(indexHtml));

console.log("Creating manifest");
const [manifestFilename] = readdirSync(buildDir).filter(file => path.extname(file).toLowerCase() === ".webmanifest");
const manifestJson = readFileSync(buildDir + manifestFilename, "utf-8");
writeFileSync(buildDir + manifestFilename, templating(manifestJson));

console.log(" ");
console.log("Compiled successfully.");

function templating(contents: string): string {
  return substitutions.reduce((text, [key, value]) => (text = text.replaceAll(key, (value || "").toString())), contents);
}

// console.log("Informing editor");
// readdirSync(buildDir).forEach(filename => copyFileSync(buildDir + filename, editorRuntimeDir + filename));

/////////////
async function compileStory(storyFilename: string, outputFile: string): Promise<string> {
  console.log("Compiling...");
  let json = "";
  const source = await readFile(storyFilename).then(x => x.toString().trim());

  try {
    const ast = parse(source);
    json = JSON.stringify(ast, undefined, 2);
  } catch (e) {
    if (e instanceof SyntaxError) {
      // @ts-ignore
      const at = e.location;
      // @ts-ignore
      console.log("expected", e.expected, "found", e.found, "at", at);
      console.log(source.slice(at.start.offset, at.start.offset + 40));
    } else {
      console.error("CAUGHT", e);
    }
    throw e;
  }

  // console.log(json);
  await writeFile(outputFile, json);
  console.log("Written to ", outputFile);
  return json;
}
