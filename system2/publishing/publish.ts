import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { exit } from "node:process";
import { build } from "vite";
import type { iFictionRecord } from "../common/iFictionRecord";

/**
 * To run,                   npm run publish2
 */

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

const appName = parsedargs.name || "story1";
const appDir = parsedargs.appDir || "../app/";
const buildDir = parsedargs.buildDir || "../build/";
const commonDir = parsedargs.commonDir || "../common/";
const deployDir = parsedargs.deployDir || ""; // "/mnt/c/inetpub/wwwroot/tin/";

console.log("Clear build folder", buildDir);
if (existsSync(buildDir)) rmSync(buildDir, { recursive: true, force: true });
if (!existsSync(buildDir)) mkdirSync(buildDir);

console.log("Read", appDir + "bibliographic.json");
const about: iFictionRecord["story"]["bibliographic"] = JSON.parse(readFileSync(appDir + "bibliographic.json", "utf-8"));
const ifid = new Date().toISOString();

console.log("Build", appDir + appName + ".ts");
const buildResult = await build({
  build: {
    lib: {
      entry: resolve(appDir + appName + ".ts"),
      formats: ["es"],
      fileName: () => appName + ".js",
    },
    outDir: buildDir,
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: "[name].[ext]",
      },
    },
  },
});

const makeStyletag = async (path: string) => {
  const data = readFileSync(path, "utf-8");
  return `  <style id="${path}">${data}</style>`;
};

const indexCss = await makeStyletag(commonDir + "index.css");
const cssFiles = readdirSync(buildDir).filter(f => f.endsWith(".css"));
const css = await Promise.all(cssFiles.map(f => makeStyletag(buildDir + f)));

const substitutions = Object.entries({
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
} satisfies Record<string, string | number | boolean>);

const templating = (contents: string): string =>
  substitutions.reduce((text, [key, value]) => (text = text.replaceAll(key, value.toString())), contents);

console.log("Create", buildDir + "manifest.json", "from", commonDir + "template.manifest.json");
let manifestJson = readFileSync(commonDir + "template.manifest.json", "utf-8");
writeFileSync(buildDir + "manifest.json", templating(manifestJson));

console.log("Create", buildDir + "index.html", "from", commonDir + "template.index.html");
let indexJs = readFileSync(buildDir + appName + ".js", "utf-8");
let indexHtml = readFileSync(commonDir + "template.index.html", "utf-8");
indexHtml = indexHtml.replace('<script src="${appName}.js"></script>', `<script>${indexJs}</script>`);
writeFileSync(buildDir + "index.html", templating(indexHtml));

// console.log("Copy", commonDir + "index.css", "to", buildDir + "index.css");
// copyFileSync(commonDir + "index.css", buildDir + "index.css");

console.log("Copy", commonDir + "icon.svg", "to", buildDir + "icon.svg");
copyFileSync(commonDir + "icon.svg", buildDir + "icon.svg");

console.log("Copy", commonDir + "screenshot.png", "to", buildDir + "screenshot.png");
copyFileSync(commonDir + "screenshot.png", buildDir + "screenshot.png");

console.log("Copy", commonDir + "favicon.ico", "to", buildDir + "favicon.ico");
copyFileSync(commonDir + "favicon.ico", buildDir + "favicon.ico");

console.log(" ");
console.log("Build completed successfully.");
const buildFiles = readdirSync(buildDir);
console.log(buildFiles.filter(f => f.endsWith(".js")).length, "JavaScript files.");
console.log(buildFiles.filter(f => f.endsWith(".css")).length, "CSS files.");
console.log(css.length, "css assets copied to", buildDir, "and referenced by", buildDir + "index.html");
console.log(" ");

if (deployDir) {
  console.log("Deploy", buildDir + "*", "to", deployDir + "*");
  if (!existsSync(deployDir)) mkdirSync(deployDir);
  readdirSync(buildDir).forEach(filename => copyFileSync(buildDir + filename, deployDir + filename));
}
