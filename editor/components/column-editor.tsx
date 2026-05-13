import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, foldKeymap, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState, Extension } from "@codemirror/state";
import { drawSelection, dropCursor, EditorView, highlightSpecialChars, KeyBinding, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { useEffect, useMemo } from "react";
import { System3Mirrorways } from "../language-plugin/dist/index";
import { saveProject } from "./services/project";
import { useProject } from "./services/useProject";

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
    saveFn();
    return true; // Returning true prevents the browser's default Save dialog
  },
};

const getExtensions = (room?: string, content?: string): Extension => [
  // System3Mirrorways language support
  System3Mirrorways(),
  // remote sync with mobile
  //mobileSync(room, content),
  // A gutter with code folding markers
  //foldGutter(),
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
];

export function newDocument(doc = "Let it begin.", room?: string) {
  const newState = EditorState.create({ doc, extensions: getExtensions(room || undefined, doc) });
  window.view.setState(newState);
}

const initialText = `Start documentlkj * Option 1 * Option 2 ** [plot sldkfj] 
Can you [copy]this?[/copy] Of \\* course! 
[cut for later]And cut this?[/cut]  #hello-world  [paste #something] Continuing...
[replace this that] in here [/replace]
`;

let saveFn = () => {};

export function CodeEditor() {
  const { project } = useProject();

  useEffect(() => {
    saveFn = () => project && saveProject(project);
  }, [project, saveProject]);

  useEffect(() => {
    window.view = new EditorView({
      doc: initialText,
      parent: document.getElementById("editor")!,
      extensions: getExtensions(undefined, initialText),
    });
  }, []);

  const ed = useMemo(() => <div id="editor"></div>, []);
  return <code-editor>{ed}</code-editor>;
}
