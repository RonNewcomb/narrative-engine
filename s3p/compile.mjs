// tsc compile.mts --module nodenext
import { readFile } from "fs/promises";
import { parse, SyntaxError } from "./parser.mjs";
const source = await readFile("./system3.sample.txt").then(x => x.toString().trim());
try {
    const ast = parse(source);
    console.log(JSON.stringify(ast, undefined, 4));
}
catch (e) {
    if (e instanceof SyntaxError) {
        const at = e.location;
        console.log("expected", e.expected, "found", e.found, "at", at);
        console.log(source.slice(at.start.offset, at.start.offset + 40));
    }
    else
        console.error("CAUGHT", e);
}
