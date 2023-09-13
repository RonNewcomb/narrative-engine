import type { iFictionRecord } from "../common/iFictionRecord";

const appDir = "../app";
const appName = "story1";
const buildDir = "../build";
const commonDir = "../common";

function templating(file: string, substitutions: Record<string, string | number | boolean>): string {
  for (const [key, value] of Object.entries(substitutions)) file = file.replaceAll("${" + key + "}", value.toString());
  return file;
}

console.log("Bun v" + Bun.version);

const ifid = new Date().toISOString();
const bibliographic: iFictionRecord["story"]["bibliographic"] = await Bun.file(appDir + "/bibliographic.json").json();

// go

const buildResult = await Bun.build({
  entrypoints: [appDir + "/" + appName + ".ts"],
  outdir: buildDir,
  target: "browser",
});

const css = buildResult.outputs
  .filter(f => f.kind == "asset" && f.path.endsWith(".css"))
  .map(c => `    <link rel="stylesheet" type="text/css" href="${c.path.slice(1 + c.path.lastIndexOf("/"))}" />`);

const substitutions: Record<string, string | number | boolean> = {
  title: bibliographic.title,
  author: bibliographic.author,
  language: bibliographic.language || "en",
  headline: bibliographic.headline,
  firstpublished: bibliographic.firstpublished,
  description: bibliographic.description,
  ifid,
  appName,
};

let manifestJson = await Bun.file(commonDir + "/template.manifest.json").text();
manifestJson = templating(manifestJson, substitutions);
const manifestResult = await Bun.write(buildDir + "/.webmanifest", manifestJson);

let indexHtml = await Bun.file(commonDir + "/template.index.html").text();
indexHtml = templating(indexHtml, substitutions);
indexHtml = indexHtml.replace("</head>", css.join("\n") + "\n</head>");
const indexResult = await Bun.write(buildDir + "/index.html", indexHtml);

console.log(buildResult, manifestResult, indexResult);
