import { fileTests } from "@lezer/generator/dist/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { System3MirrorwaysLanguage } from "../dist/index.js";

let caseDir = path.dirname(fileURLToPath(import.meta.url));

for (let file of fs.readdirSync(caseDir)) {
  if (!/\.txt$/.test(file)) continue;

  let name = /^[^\.]*/.exec(file)[0];
  describe(name, () => {
    for (let { name, run } of fileTests(fs.readFileSync(path.join(caseDir, file), "utf8"), file))
      it(name, () => run(System3MirrorwaysLanguage.parser));
  });
}
