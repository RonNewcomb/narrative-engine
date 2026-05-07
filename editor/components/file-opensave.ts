import type { iFictionRecord } from "../../system3/iFictionRecord";
import { newDocument } from "./column-editor";
import { renderErrbar } from "./err-bar";
import { setIntficRecord } from "./intfic-record";
import { newProject } from "./new-project";

export const SaveFileEvent = "interpreter-save";
export const LoadFileEvent = "interpreter-load";

let filename = "";
let fileHandle: FileSystemFileHandle | undefined;
let folderHandle: FileSystemDirectoryHandle | undefined;

function closeProject() {
  folderHandle = undefined;
  fileHandle = undefined;
  filename = "";
  render();
  newDocument();
  location.reload();
}

async function newFile() {
  const x = await newProject();
  if (!x || !x.dirHandle || !x.sourceFile) return;

  folderHandle = x.dirHandle;
  fileHandle = x.sourceFile;
  filename = fileHandle.name;
  render(filename);
  newDocument(x.initialText, filename);
  dispatchEvent(new CustomEvent(LoadFileEvent, { detail: "", bubbles: true, cancelable: true }));
}

export async function loadFile() {
  const fh = await window.showDirectoryPicker().catch(() => undefined);
  if (!fh) return;
  const biblioHandle = await fh.getFileHandle("bibliographic.json").catch(() => undefined);
  if (!biblioHandle) return renderErrbar('I could not find a file named "bibliographic.json" in that folder.');
  const biblio = await biblioHandle
    .getFile()
    .then(x => x.text())
    .then(x => JSON.parse(x) as iFictionRecord);
  if (!biblio) return renderErrbar("I could not make sense of the contents of file bibliographic.json");
  if (!biblio.filename) return renderErrbar("No source filename listed in bibliographic info. Which file has your writing?");
  const sh = await fh.getFileHandle(biblio.filename).catch(() => undefined);
  if (!sh) return renderErrbar("I couldn't find or open file " + biblio.filename + " in that folder.");
  const content = await sh
    .getFile()
    .then(x => x.text())
    .then(x => x || "")
    .catch(() => undefined);
  if (!content) return renderErrbar("I couldn't load anything from the source file. Is it supposed to be empty?");

  // commit
  folderHandle = fh;
  fileHandle = sh;
  filename = fileHandle.name;
  setIntficRecord(biblio);
  render(filename);
  newDocument(content, biblio.filename);
  dispatchEvent(new CustomEvent(LoadFileEvent, { detail: content, bubbles: true, cancelable: true }));
}

export async function saveFile() {
  if (!fileHandle) return;
  const content = window.view.state.doc.toString();
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
  console.log("Saved");
  dispatchEvent(new CustomEvent(SaveFileEvent, { detail: content, bubbles: true, cancelable: true }));
}

export function getFilename() {
  return filename;
}

window.newFile = newFile;
window.saveFile = saveFile;
window.loadFile = loadFile;
window.closeProject = closeProject;

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
        <button class="save" onclick="newFile()" aria-label="new story">New</button> 
        <button class="save" onclick="loadFile()" aria-label="open story">Open</button> 
      </div>
      <div style="display: ${filename ? "flex" : "none"}; gap: 2em">
        <div class="save-header" onclick="saveFile()">
          ${filename} <button class="save" aria-label="save file">Save</button> 
        </div>
        <button class="save" onclick="closeProject()" aria-label="close file">Close</button> 
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => render());
