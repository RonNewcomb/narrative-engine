import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import type { iFictionRecord } from "../common/iFictionRecord";
import { exit } from "node:process";

/**
 *                           npm install -g bun
 * To install dependencies,  bun install
 * To run,                   bun publish.ts
 */

const argTypes: Record<string, string> = {
  "-n": "name",
  "-a": "appDir",
  "-b": "buildDir",
  "-c": "commonDir",
  "-d": "deployDir",
};

const parsedargs: Record<string, string | undefined> = {};
for (let args = Bun.argv.slice(2); args.length; true) {
  const paramSwitch = argTypes[args.shift() || ""];
  if (!paramSwitch) {
    console.log(JSON.stringify(argTypes, undefined, 2));
    exit(1);
  }
  parsedargs[paramSwitch] = args.shift();
}

const appName = parsedargs.name || "story1";
const appDir = parsedargs.appDir || "../app/";
const buildDir = parsedargs.buildDir || "../build/";
const commonDir = parsedargs.commonDir || "../common/";
const deployDir = parsedargs.deployDir || ""; // "/mnt/c/inetpub/wwwroot/tin/";

console.log("Clear build folder", buildDir);
if (existsSync(buildDir)) rmSync(buildDir, { recursive: true, force: true });
if (!existsSync(buildDir)) mkdirSync(buildDir);

console.log("Read", appDir + "bibliographic.json");
const about: iFictionRecord["story"]["bibliographic"] = await Bun.file(appDir + "bibliographic.json").json();
const ifid = new Date().toISOString();

console.log("Build", appDir + appName + ".ts");
const buildResult = await Bun.build({ entrypoints: [appDir + appName + ".ts"], outdir: buildDir, target: "browser" });

const makeStyletag = (path: string) =>
  Bun.file(path)
    .text()
    .then(data => `  <style id="${path}">${data}</style>`);

const indexCss = await makeStyletag(commonDir + "index.css");
const css = await Promise.all(buildResult.outputs.filter(f => f.kind == "asset" && f.path.endsWith(".css")).map(c => makeStyletag(c.path)));

const substitutions = Object.entries(<Record<string, string | number | boolean>>{
  "${appName}": appName,
  "${ifid}": ifid,
  "${title}": about.title,
  "${author}": about.author,
  "${headline}": about.headline,
  "${firstpublished}": about.firstpublished,
  "${language}": about.language || "en",
  "${description}": about.description || `${about.title}: ${about.headline} by ${about.author}`,
  '<link rel="stylesheet" href="index.css" />': "",
  "</head>": indexCss + css.join("\n") + "\n</head>",
});

const templating = (contents: string): string =>
  substitutions.reduce((text, [key, value]) => (text = text.replaceAll(key, value.toString())), contents);

console.log("Create", buildDir + "manifest.json", "from", commonDir + "template.manifest.json");
let manifestJson = await Bun.file(commonDir + "template.manifest.json").text();
await Bun.write(buildDir + "manifest.json", templating(manifestJson));

console.log("Create", buildDir + "index.html", "from", commonDir + "template.index.html");
let indexJs = await Bun.file(buildDir + appName + ".js").text();
let indexHtml = await Bun.file(commonDir + "template.index.html").text();
indexHtml = indexHtml.replace('<script src="${appName}.js"></script>', `<script>${indexJs}</script>`);
await Bun.write(buildDir + "index.html", templating(indexHtml));

// console.log("Copy", commonDir + "index.css", "to", buildDir + "index.css");
// copyFileSync(commonDir + "index.css", buildDir + "index.css");

console.log("Copy", commonDir + "icon.svg", "to", buildDir + "icon.svg");
copyFileSync(commonDir + "icon.svg", buildDir + "icon.svg");

console.log("Copy", commonDir + "screenshot.png", "to", buildDir + "screenshot.png");
copyFileSync(commonDir + "screenshot.png", buildDir + "screenshot.png");

console.log(" ");
console.log(buildResult.success ? "Success." : "Problem.");
console.log(buildResult.outputs.filter(f => f.kind == "entry-point").length, "entry points.");
console.log(buildResult.outputs.filter(f => f.kind == "chunk").length, "chunks.");
console.log(buildResult.outputs.filter(f => f.kind == "asset").length, "assets imported from javascript.");
console.log(css.length, "css assets copied to", buildDir, "and referenced by", buildDir + "index.html");
console.log(" ");

if (deployDir) {
  console.log("Deploy", buildDir + "*", "to", deployDir + "*");
  if (!existsSync(deployDir)) mkdirSync(deployDir);
  readdirSync(buildDir).forEach(filename => copyFileSync(buildDir + filename, deployDir + filename));
}
