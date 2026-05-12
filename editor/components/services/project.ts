import type { iFictionRecord } from "../../publisher/iFictionRecord";
import { newDocument } from "../column-editor";
import { newProject } from "../new-project";

let filename = "";
let fileHandle: FileSystemFileHandle | undefined;
let folderHandle: FileSystemDirectoryHandle | undefined;

export function closeProject() {
  folderHandle = undefined;
  fileHandle = undefined;
  filename = "";
  newDocument();
  location.reload();
}

export async function newFile() {
  const about = await newProject();
  if (typeof about === "string") return about;
  if (!about || !about.dirHandle || !about.sourceFile) return;

  folderHandle = about.dirHandle;
  fileHandle = about.sourceFile;
  filename = fileHandle.name;
  newDocument(about.initialText, filename);
  return { detail: about.initialText, ...about };
}

export async function loadFile() {
  const fh = await window.showDirectoryPicker().catch(() => undefined);
  if (!fh) return;
  const biblioHandle = await fh.getFileHandle("about.json").catch(() => undefined);
  if (!biblioHandle) return 'I could not find a file named "about.json" in that folder.';
  const biblio = await biblioHandle
    .getFile()
    .then(x => x.text())
    .then(x => JSON.parse(x) as iFictionRecord);
  if (!biblio) return "I could not make sense of the contents of file about.json";
  if (!biblio.filename) return "No source filename listed in bibliographic info. Which file has your writing?";
  const sh = await fh.getFileHandle(biblio.filename).catch(() => undefined);
  if (!sh) return "I couldn't find or open file " + biblio.filename + " in that folder.";
  const content = await sh
    .getFile()
    .then(x => x.text())
    .then(x => x || "")
    .catch(() => undefined);
  if (!content) return "I couldn't load anything from the source file. Is it supposed to be empty?";

  // commit
  folderHandle = fh;
  fileHandle = sh;
  filename = fileHandle.name;
  console.log({ biblio });
  newDocument(content, biblio.filename);
  return { detail: content };
}

export async function saveFile() {
  if (!fileHandle) return;
  const content = window.view.state.doc.toString();
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
  console.log("Saved");
  return { detail: content };
}

export function getFilename() {
  return filename;
}
