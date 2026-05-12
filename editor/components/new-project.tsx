import type { iFictionRecord } from "../publisher/iFictionRecord";
import { showNewProjectDialog } from "./modals/NewProjectModal";

export async function newProject(): Promise<
  | { record: iFictionRecord; sourceFile: FileSystemFileHandle; dirHandle: FileSystemDirectoryHandle; initialText: string }
  | undefined
  | string
> {
  const dirHandle = await window.showDirectoryPicker();
  const shouldntExist = await dirHandle.getFileHandle("about.json", { create: false }).catch(() => undefined);
  if (shouldntExist) return "Sorry, but this folder already has a project in it. Please choose a different, or new, folder.";

  async function writeFileSync(filename: string, contents: string) {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
    return fileHandle;
  }

  const record = await showNewProjectDialog();
  if (!record) return;
  const filename = makeFilesystemSafeName(record.story.bibliographic.title || "intfic");
  record.filename = filename + ".txt";
  record.story.identification.ifid = [crypto.randomUUID().toUpperCase()];
  const initialText = `    "Let me tell you about ${record.story.bibliographic.title}," said ${record.story.bibliographic.author}.`;
  await writeFileSync("about.json", JSON.stringify(record, undefined, 2));
  const sourceFile = await writeFileSync(record.filename, initialText);

  return { record, sourceFile, dirHandle, initialText };
}

export function makeFilesystemSafeName(
  str: string,
  options: { maxLength?: number; replaceWith?: string; allowSpaces?: boolean; preserveCase?: boolean } = {},
) {
  const { maxLength = 255, replaceWith = "", allowSpaces = true, preserveCase = true } = options;

  // Remove control characters
  let safe = str.replace(/[\x00-\x1F\x7F]/g, replaceWith);

  // Replace invalid filesystem characters
  safe = safe.replace(/[\/\\:*?"<>|]/g, replaceWith);

  // Handle spaces
  if (!allowSpaces) {
    safe = safe.replace(/\s+/g, replaceWith);
  }

  // Remove leading/trailing spaces and dots (hidden files on Unix)
  safe = safe.replace(/^[\s.]+|[\s.]+$/g, "");

  // Handle reserved names on Windows
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  if (reservedNames.test(safe)) {
    safe = replaceWith + safe;
  }

  // Case conversion
  if (!preserveCase) {
    safe = safe.toLowerCase();
  }

  // Truncate to max length
  if (safe.length > maxLength) {
    safe = safe.substring(0, maxLength);
  }

  // Return empty string if result is empty
  return safe || "intfic";
}
