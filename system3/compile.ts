// run: npm run parser3
// or : node compile.ts [filename]
// or : import and call compileStory()
import { readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import { parse, SyntaxError } from "./parser.js";

if (import.meta.url === `file://${process.argv[1]}`) {
  const storyFilename = process.argv[2] || "FILE_NOT_SPECIFIED";
  compileStory(storyFilename);
}

export async function compileStory(storyFilename: string, outputPath?: string): Promise<string> {
  let json = "";
  const source = await readFile(storyFilename).then(x => x.toString().trim());

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

  // console.log(json);
  const outputFile = outputPath || dirname(storyFilename) + `/dist/story.json`;
  await writeFile(outputFile, json);
  return json;
}
