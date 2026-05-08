import { renderErrbar } from "../components/err-bar";
import { getIntficRecord } from "../components/intfic-record";
import type { iFictionRecord } from "./iFictionRecord";
import { parse } from "./parser";

export async function selectPublishedFolder(appName: string, source: string) {
  try {
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

    function templating(contents: string): string {
      return substitutions.reduce((text, [key, value]) => (text = text.replaceAll(key, value.toString())), contents);
    }

    console.log("Compiling story");
    const json = await compileStory(source);
    writeFileSync("intfic.json", json);

    console.log("Reading", "about.json");
    const intfic: iFictionRecord = getIntficRecord();
    console.log({ intfic });
    const about = intfic.story.bibliographic;
    const substitutions = Object.entries({
      "${appName}": appName,
      "${ifid}": intfic.story.identification.ifid[0],
      "${title}": about.title,
      "${author}": about.author,
      "${headline}": about.headline,
      "${firstpublished}": about.firstpublished,
      "${language}": about.language || "en",
      "${description}": about.description || `${about.title} by ${about.author}`,
    } satisfies Record<string, string | number | boolean>);

    console.log("Creating index.html");
    const result = await fetch("runtime/index.html")
      .then(x => x.text())
      .then(templating)
      .then(indexHtml => writeFileSync("index.html", indexHtml));

    console.log("Creating system3.webmanifest");
    await fetch("runtime/system3.webmanifest")
      .then(x => x.text())
      .then(templating)
      .then(manifest => writeFileSync("system3.webmanifest", manifest));

    console.log("Writing ifiction record");
    writeFileSync("about.json", JSON.stringify(intfic, undefined, 2));

    console.log("Compiled successfully.");

    return true;
  } catch (e) {
    renderErrbar(JSON.stringify(e));
    return false;
  }
}

async function compileStory(source: string): Promise<string> {
  console.log("Compiling...");
  let json = "";

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

  return json;
}
