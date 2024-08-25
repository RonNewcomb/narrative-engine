// tsc  --watch -m nodenext parser3.mts
// node parser3.mjs
import { readFile } from "fs/promises";
import { All, Any, Node, Optional, Parser, Star } from "./rd-parse.mjs";
function echo(x) {
    // console.log(JSON.stringify(x));
    return x;
}
const EOF = /^$/;
function TextToken(...rest) {
    return Node(/^\s*([^\[]+)/, ([text]) => echo({ type: "Text", text }))(...rest);
}
function OptionText(...rest) {
    return Node(/^\s*([^\[\]\*]*)/, ([x]) => echo(x))(...rest);
}
const WS = /\s+/;
function Hashtag(...rest) {
    return All(/^\s*#([a-zA-Z0-9_]+)\s*/)(...rest);
    //return Node(/^\s*#([a-zA-Z0-9_]+\s*)/, ([tag]) => ({ tag }))(...rest);
}
function Hashtags(...rest) {
    return Node(Star(Hashtag), tags => echo(tags))(...rest);
}
const OptionStart = /^\*/;
const OptionEnd = /^[\*\]]/;
const ExprStart = /^\s*\[\s*/;
const ExprEnd = /^\s*\]\s*/;
function Option(...rest) {
    return Node(All(OptionStart, All(OptionText, Optional(SimpleExpression))), ([optionText, ...otherOptionStuff]) => echo({
        type: "Option",
        optionText,
        otherOptionStuff,
    }))(...rest);
}
function Options(...rest) {
    return Node(Star(Option), options => echo(options))(...rest);
}
function SimpleExpression(...rest) {
    return Node(All(ExprStart, Hashtags, Options, ExprEnd), ([hashes, options]) => echo({
        type: "SimExpr",
        hashes,
        options,
    }))(...rest);
}
function Grammar(...rest) {
    return Node(Star(Any(TextToken, SimpleExpression)), args => echo(args))(...rest);
}
//const source = " teasdasdf [ #ggst_ky #ggst * Return home * Go shopping ]  End.";
const source = await readFile("./system3.sample.txt").then(x => x.toString().trim());
console.log("INPUT", source);
//const ast = Parser(Grammar2)(source);
const ast = Parser(Grammar)(source);
console.log(JSON.stringify(ast, null, 2));
