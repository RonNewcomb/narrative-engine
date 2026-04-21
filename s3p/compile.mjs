// npm run parser3
import { readFile, writeFile } from "fs/promises";
import { parse, SyntaxError } from "./parser.mjs";
const storyFilename = "system3.sample";
const source = await readFile(`./${storyFilename}.txt`).then(x => x.toString().trim());
try {
    const ast = parse(source);
    const json = JSON.stringify(ast, undefined, 4);
    console.log(json);
    await writeFile(`./${storyFilename}.json`, json);
}
catch (e) {
    if (e instanceof SyntaxError) {
        // @ts-ignore
        const at = e.location;
        // @ts-ignore
        console.log("expected", e.expected, "found", e.found, "at", at);
        console.log(source.slice(at.start.offset, at.start.offset + 40));
    }
    else {
        console.error("CAUGHT", e);
    }
}
