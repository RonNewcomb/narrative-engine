// run: npm run parser3
// or : node compile.ts [filename]
import { readFile, writeFile } from "fs/promises";
import { parse, SyntaxError } from "./parser.js";

const storyFilename = process.argv[2] || "FILE_NOT_SPECIFIED";

const source = await readFile(storyFilename).then(x => x.toString().trim());
try {
  const ast = parse(source);
  const json = JSON.stringify(ast, undefined, 4);
  console.log(json);
  await writeFile(`../system3/${storyFilename}.json`, json);
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
}
