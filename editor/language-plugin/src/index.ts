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
        Code: t.keyword,
        Plot: t.keyword,
        If: t.keyword,
        Unless: t.keyword,
        Did: t.keyword,
        Didnt: t.keyword,
        Menu: t.keyword,
        Goto: t.keyword,
        The: t.keyword,
        Cut: t.keyword,
        Copy: t.keyword,
        Paste: t.keyword,
        Replace: t.keyword,
        Word: t.meta,
        Hashtag: t.literal,
        HashtagText: t.literal,
        InnerHashtag: t.string,
        InnerHashtagText: t.string,
        Anymatching: t.name,
        NameText: t.name,
        InnerText: t.name,
        "[ ]": t.punctuation,
        Prompt: t.meta,
        Endprompt: t.meta,
        //"*": t.punctuation,
        Response: t.meta,
        Escaper: t.escape,
        EscapedChar: t.content,
        Text: t.content,
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
