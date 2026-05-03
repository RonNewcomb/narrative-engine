import type { EditorView } from "@codemirror/view";
import type { Story } from "./runtime/interpreter";

declare global {
  interface Window {
    interpreter(story: Story): Promise<void>;
    loadStory(filename: string, pwa?: boolean): Promise<void>;
    view: EditorView;
    saveFile: () => Promise<void>;
    loadFile: () => Promise<void>;
    toggleDarkMode: () => void;
  }
}
