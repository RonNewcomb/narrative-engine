import type { EditorView } from "@codemirror/view";
import type { Story } from "../system3/assets/interpreter";

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker(): Promise<FileSystemFileHandle[]>;
    interpreter(story: Story): Promise<void>;
    loadStory(filename: string, pwa?: boolean): Promise<void>;
    view: EditorView;
  }
}
