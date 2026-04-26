import { LRLanguage, LanguageSupport, foldInside, foldNodeProp } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import { parser } from "./syntax.grammar";

export const System3MirrorwaysLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      // indentNodeProp.add({
      //   Application: delimitedIndent({ closing: ")", align: false }),
      // }),
      foldNodeProp.add({
        Application: foldInside,
      }),
      styleTags({
        Code: t.variableName,
        response: t.bool,
        Text: t.string,
        prompt: t.lineComment,
        "[ ]": t.paren,
      }),
    ],
  }),
  languageData: {
    // commentTokens: { line: ";" },
  },
});

export function System3Mirrorways() {
  return new LanguageSupport(System3MirrorwaysLanguage);
}
