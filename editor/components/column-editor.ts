import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, foldGutter, foldKeymap, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import { drawSelection, dropCursor, EditorView, highlightSpecialChars, KeyBinding, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { System3Mirrorways } from "../language-plugin/dist/index";
import { mobileSync } from "./remote-sync";

const mirrorwaysStyle = HighlightStyle.define([
  { tag: tags.comment, color: "gold" },
  { tag: tags.name, color: "darkgreen", backgroundColor: "#e3f2ff" },
  { tag: tags.literal, color: "darkred" },
  { tag: tags.string, color: "darkred", backgroundColor: "#e3f2ff" },
  { tag: tags.escape, color: "lightgray" },
  { tag: tags.keyword, color: "darkblue", backgroundColor: "#e3f2ff" },
  { tag: tags.operator, color: "gold" },
  { tag: tags.punctuation, color: "gray" },
  { tag: tags.content, color: "black" },
  { tag: tags.invalid, backgroundColor: "lightred" },
  { tag: tags.meta, color: "purple", backgroundColor: "#e3f2ff" },
]);

const saveBinding: KeyBinding = {
  key: "Mod-s", // Captures Ctrl-S on Windows/Linux and Cmd-S on macOS
  run: view => {
    window.saveFile();
    return true; // Returning true prevents the browser's default Save dialog
  },
};

window.view = new EditorView({
  doc: `Start documentlkj * Option 1 * Option 2 ** [plot sldkfj] 
Can you [copy]this?[/copy] Of \\* course! 
[cut for later]And cut this?[/cut]  #hello-world  [paste #something] Continuing...
[replace this that] in here [/replace]
`,
  parent: document.getElementById("editor")!,
  extensions: [
    // System3Mirrorways language support
    System3Mirrorways(),
    // remote sync with mobile
    mobileSync(),
    // A gutter with code folding markers
    foldGutter(),
    // Replace non-printable characters with placeholders
    highlightSpecialChars(),
    // The undo history
    history(),
    // Replace native cursor/selection with our own
    drawSelection(),
    // Show a drop cursor when dragging over the editor
    dropCursor(),
    // Allow multiple cursors/selections
    EditorState.allowMultipleSelections.of(true),
    // Highlight syntax with a default style
    syntaxHighlighting(mirrorwaysStyle),
    // wordwrap
    EditorView.lineWrapping,
    // Highlight matching brackets near cursor
    bracketMatching(),
    // Automatically close brackets
    closeBrackets(),
    // Load the autocompletion system
    autocompletion(),
    // Highlight text that matches the selected text
    highlightSelectionMatches(),
    keymap.of([
      // ctrl+s save
      saveBinding,
      //openBinding,
      // Closed-brackets aware backspace
      ...closeBracketsKeymap,
      // A large set of basic bindings
      ...defaultKeymap,
      // Search-related keys
      ...searchKeymap,
      // Redo/undo keys
      ...historyKeymap,
      // Code folding bindings
      ...foldKeymap,
      // Autocompletion keys
      ...completionKeymap,
    ]),
  ],
});
