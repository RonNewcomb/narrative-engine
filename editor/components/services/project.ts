import type { iFictionRecord } from "../../publisher/iFictionRecord";
import { newDocument } from "../column-editor";
import { createProject } from "./new-project";
import { Project } from "./useProject";

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

export async function newProject(): Promise<Project | string> {
  const about = await createProject();
  if (typeof about === "string") return about;
  if (!about || !about.topFolder || !about.sourceFile) return "Failed to create new project";

  folderHandle = about.topFolder;
  fileHandle = about.sourceFile;
  filename = fileHandle.name;
  newDocument(about.initialText, filename);
  return about;
}

export async function loadProject(): Promise<Project | string> {
  const topFolder = await window.showDirectoryPicker().catch(() => undefined);
  if (!topFolder) return "Cancelled.";
  const biblioHandle = await topFolder.getFileHandle("about.json").catch(() => undefined);
  if (!biblioHandle) return 'I could not find a file named "about.json" in that folder.';
  const record = await biblioHandle
    .getFile()
    .then(x => x.text())
    .then(x => JSON.parse(x) as iFictionRecord);
  if (!record) return "I could not make sense of the contents of file about.json";
  if (!record.filename) return "No source filename listed in bibliographic info. Which file has your writing?";
  const sourceFile = await topFolder.getFileHandle(record.filename).catch(() => undefined);
  if (!sourceFile) return "I couldn't find or open file " + record.filename + " in that folder.";
  const initialText = await sourceFile
    .getFile()
    .then(x => x.text())
    .then(x => x || "")
    .catch(() => undefined);
  if (!initialText) return "I couldn't load anything from the source file. Is it supposed to be empty?";

  // commit
  folderHandle = topFolder;
  fileHandle = sourceFile;
  filename = fileHandle.name;
  console.log({ biblio: record });
  newDocument(initialText, record.filename);
  return { record, sourceFile, topFolder, initialText };
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
