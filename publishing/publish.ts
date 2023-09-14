import type { iFictionRecord } from "../common/iFictionRecord";
import { readdirSync, rmSync } from "node:fs";

const appName = "story1";
const appDir = "../app/";
const buildDir = "../build/";
const commonDir = "../common/";

console.log("Bun v" + Bun.version);
readdirSync(buildDir).forEach(filename => rmSync(`${buildDir}/${filename}`));

const bibliographic: iFictionRecord["story"]["bibliographic"] = await Bun.file(appDir + "bibliographic.json").json();
const { title, author, headline, firstpublished, language, description } = bibliographic;
const ifid = new Date().toISOString();

// go

const buildResult = await Bun.build({
  entrypoints: [appDir + appName + ".ts"],
  outdir: buildDir,
  target: "browser",
});

const css = buildResult.outputs
  .filter(f => f.kind == "asset" && f.path.endsWith(".css"))
  .map(c => `    <link rel="stylesheet" type="text/css" href="${c.path.slice(1 + c.path.lastIndexOf("/"))}" />`);

const substitutions: Record<string, string | number | boolean> = {
  "${appName}": appName,
  "${ifid}": ifid,
  "${title}": title,
  "${author}": author,
  "${headline}": headline,
  "${firstpublished}": firstpublished,
  "${language}": language || "en",
  "${description}": description || `${title}: ${headline} by ${author}`,
  "</head>": css.join("\n") + "\n</head>",
};

function templating(file: string): string {
  for (const [key, value] of Object.entries(substitutions)) file = file.replaceAll(key, value.toString());
  return file;
}

let manifestJson = await Bun.file(commonDir + "template.manifest.json").text();
await Bun.write(buildDir + ".webmanifest", templating(manifestJson));

let indexHtml = await Bun.file(commonDir + "template.index.html").text();
await Bun.write(buildDir + "index.html", templating(indexHtml));

await Bun.write(buildDir + "index.css", Bun.file(commonDir + "index.css"));

console.log(buildResult);
