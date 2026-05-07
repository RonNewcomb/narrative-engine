import type { iFictionRecord } from "../publisher/iFictionRecord";
import { renderErrbar } from "./err-bar";
import { getFreshIntficRecord, getIntficRecord, render as renderIntficRecord, setIntficRecord } from "./intfic-record";

export async function newProject(): Promise<
  { sourceFile: FileSystemFileHandle; dirHandle: FileSystemDirectoryHandle; initialText: string } | void | undefined
> {
  const dirHandle = await window.showDirectoryPicker();
  const shouldntExist = await dirHandle.getFileHandle("about.json", { create: false }).catch(() => undefined);
  if (shouldntExist) return renderErrbar("Sorry, but this folder already has a project in it. Please choose a different, or new, folder.");

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
  await writeFileSync("about.json", JSON.stringify(record, undefined, 4));
  const sourceFile = await writeFileSync(record.filename, initialText);

  // commit
  setIntficRecord(record);
  return { sourceFile, dirHandle, initialText };
}

async function showNewProjectDialog(): Promise<0 | iFictionRecord> {
  const dialog = document.createElement("dialog");
  dialog.className = "new-project";
  dialog.innerHTML = `
<p>Only the title is really necessary. A working title is fine too, you can change these values later.</p>
<div>
    <intfic-record></intfic-record>
</div>
<div style="display:flex;justify-content:space-around;padding:1em">
    <button id="cancel"  class="savebutton" type="button">Nevermind</button>
    <button id="confirm" class="savebutton" type="button">Create</button>
</div>`;
  document.body.appendChild(dialog);
  const oldBib = getIntficRecord();
  const newBib = getFreshIntficRecord();
  renderIntficRecord(true, newBib.story.bibliographic);

  return new Promise<iFictionRecord | 0>(resolve => {
    dialog.showModal();

    const done = (value: boolean) => {
      dialog.close();
      dialog.remove(); // Cleanup DOM
      renderIntficRecord(false, oldBib.story.bibliographic);
      resolve(value ? newBib : 0);
    };

    dialog.onclose = () => done(false);
    dialog.querySelector<HTMLDialogElement>("#confirm")!.onclick = () => done(true);
    dialog.querySelector<HTMLDialogElement>("#cancel")!.onclick = () => done(false);
  });
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
