import type { iFictionRecord } from "./iFictionRecord";
import { parse } from "./parser";

interface FileHandle {
  createWritable(): { write(text: string): void; close(): void };
}

export async function selectPublishedFolder(appName: string, source: string) {
  const dirHandle = await (window as any).showDirectoryPicker();

  async function writeFileSync(filename: string, contents: string) {
    const fileHandle: FileHandle = await dirHandle.getFileHandle(filename, { create: true });
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
  }

  // console.log("Clear distribution folder", buildDir);
  // if (existsSync(buildDir)) rmSync(buildDir, { recursive: true, force: true });
  // if (!existsSync(buildDir)) mkdirSync(buildDir);

  console.log("Compiling story");
  const json = await compileStory(source);
  writeFileSync("story.json", json);

  console.log("Reading", "bibliographic.json");
  if (true) {
    // !existsSync("bibliographic.json")) {
    console.log("bibliographic.json not found, creating template...");
    const biblio = await fetch("publisher/bibliographic.json").then(x => x.text());
    writeFileSync("bibliographic.json", biblio);
  }

  const about: iFictionRecord["story"]["bibliographic"] = await fetch("publisher/bibliographic.json").then(x => x.json());

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

  console.log("Copying assets");
  const assets = [
    "favicon.ico",
    "findLocalIP.ts",
    "icon.svg",
    // "index.html",
    "interpreter.ts",
    "layout.css",
    "layout.ts",
    // "manifest.json",
    "multimenu.css",
    "multimenu.ts",
    "prolog.ts",
  ];
  assets.forEach(a =>
    fetch("assets/" + a)
      .then(x => x.text())
      .then(text => writeFileSync(a, text)),
  );

  console.log("Creating index.html");
  const indexHtml = await fetch("assets/index.html")
    .then(x => x.text())
    .then(templating);
  writeFileSync("index.html", indexHtml);

  console.log("Creating manifest.json");
  const manifestJson = await fetch("assets/manifest.json")
    .then(x => x.text())
    .then(templating);
  writeFileSync("manifest.json", manifestJson);

  console.log(" ");
  console.log("Compiled successfully.");

  function templating(contents: string): string {
    return substitutions.reduce((text, [key, value]) => (text = text.replaceAll(key, value.toString())), contents);
  }

  dirHandle.close();

  return true;
}

async function compileStory(source: string): Promise<string> {
  console.log("Compiling...");
  let json = "";

  try {
    const ast = parse(source);
    json = JSON.stringify(ast, undefined, 4);
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

  return json;
}
