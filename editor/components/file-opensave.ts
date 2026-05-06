import { mobileSync } from "./remote-sync";

export const SaveFileEvent = "interpreter-save";
export const LoadFileEvent = "interpreter-load";

let filename = "";
let fileHandle: any;

export async function loadFile() {
  // Destructure the one-element array.
  [fileHandle] = await (window as any).showOpenFilePicker();
  // Do something with the file handle.
  const file = await fileHandle.getFile();
  const content = (await file.text()) || "";
  filename = fileHandle.name;
  render(filename);
  window.view.dispatch({ changes: { from: 0, to: window.view.state.doc.length, insert: content } });
  mobileSync(filename, content);
  dispatchEvent(new CustomEvent("interpreter-load", { detail: content, bubbles: true, cancelable: true }));
}

export async function saveFile() {
  const content = window.view.state.doc.toString();
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(content);
  // Close the file and write the contents to disk.
  await writable.close();
  console.log("Saved");
  dispatchEvent(new CustomEvent("interpreter-save", { detail: content, bubbles: true, cancelable: true }));
}

export function getFilename() {
  return filename;
}

window.saveFile = saveFile;
window.loadFile = loadFile;

function render(filename?: string) {
  const el = document.getElementsByTagName("file-opensave")?.[0];
  if (!el) return;
  el.innerHTML = `
    <div>
      <style>
        file-opensave {
          font-weight: 300;
          font-family: sans-serif;
        }
        file-opensave .save-header {
          border: 1px solid #497d7e;
          border-radius: 1em;
          padding-left: 1em;
        }
        file-opensave .save {
          background-color: #497d7e;
          color: white;
          padding: 0.5em 1em;
          border: none;
          border-radius: 1em;
        }
      </style>
      <div style="display: ${filename ? "none" : "block"}">
        <button class="save" onclick="loadFile()" aria-label="load file">Load</button> 
      </div>
      <div style="display: ${filename ? "block" : "none"}" class="save-header" onclick="saveFile()">
        ${filename} <button class="save" aria-label="save file">Save</button> 
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => render());
