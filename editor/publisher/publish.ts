import type { iFictionRecord } from "../../system3/iFictionRecord";
import { getIntficRecord } from "../components/intfic-record";
import { parse } from "./parser";

export async function selectPublishedFolder(appName: string, source: string) {
  const dirHandle = await window.showDirectoryPicker();

  async function writeFileSync(filename: string, contents: string) {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
  }

  console.log("Compiling story");
  const json = await compileStory(source);
  writeFileSync("story.json", json);

  console.log("Reading", "intfic.json");
  const intfic: iFictionRecord = getIntficRecord() || (await fetch("publisher/intfic.json").then(x => x.json()));
  console.log({ intfic });
  const about = intfic.story.bibliographic;
  const substitutions = Object.entries({
    "${appName}": appName,
    "${ifid}": new Date().toISOString(),
    "${title}": about.title,
    "${author}": about.author,
    "${headline}": about.headline,
    "${firstpublished}": about.firstpublished,
    "${language}": about.language || "en",
    "${description}": about.description || `${about.title} by ${about.author}`,
    "</head>": "\n</head>",
  } satisfies Record<string, string | number | boolean>);

  console.log("Creating index.html");
  await fetch("runtime/index.html")
    .then(x => x.text())
    .then(templating)
    .then(indexHtml => writeFileSync("index.html", indexHtml));

  console.log("Creating manifest.json");
  await fetch("runtime/manifest.json")
    .then(x => x.text())
    .then(templating)
    .then(manifest => writeFileSync("manifest.json", manifest))
    .catch(() => console.warn("No manifest found"));

  console.log("Writing ifiction record");
  writeFileSync("bibliographic.json", JSON.stringify(intfic, undefined, 4));

  console.log(" ");
  console.log("Compiled successfully.");

  function templating(contents: string): string {
    return substitutions.reduce((text, [key, value]) => (text = text.replaceAll(key, value.toString())), contents);
  }

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
