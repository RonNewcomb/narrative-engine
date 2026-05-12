import { iFictionRecord } from "../publisher/iFictionRecord";
import { closeProject, loadFile, newFile, saveFile } from "./services/project";
import { useProject } from "./services/useProject";

export async function FileOpenSave({
  onSave,
  onNew,
  onLoad,
  onClose,
  onError,
}: {
  onSave?: (e?: { detail: string }) => void;
  onNew?: (about: {
    record: iFictionRecord;
    sourceFile: FileSystemFileHandle;
    dirHandle: FileSystemDirectoryHandle;
    initialText: string;
    detail: string;
  }) => void;
  onError?: (msg: string) => void;
  onLoad?: (e?: { detail: string }) => void;
  onClose?: (e?: { detail: string }) => void;
}) {
  const project = useProject();
  const filename = project?.project?.record.filename;

  const handleNew = async () => {
    const x = await newFile();
    if (!x) return;
    if (typeof x === "string") onError?.(x);
    else onNew?.(x);
  };

  const handleSave = async () => {
    const x = await saveFile();
    if (!x) return;
    onSave?.(x);
  };

  const handleLoad = async () => {
    const x = await loadFile();
    if (!x) return;
    if (typeof x === "string") onError?.(x);
    else onLoad?.(x);
  };

  const handleClose = async () => {
    const x = await closeProject();
    onClose?.();
  };

  return (
    <file-opensave>
      <style>{`
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
      `}</style>
      <div style={{ display: filename ? "none" : "block" }}>
        <button className="save" onClick={handleNew} aria-label="new story">
          New
        </button>
        <button className="save" onClick={handleLoad} aria-label="open story">
          Open
        </button>
      </div>
      <div style={{ display: filename ? "flex" : "none", gap: "2em" }}>
        <div className="save-header" onClick={handleSave}>
          {filename}{" "}
          <button className="save" aria-label="save file">
            Save
          </button>
        </div>
        <button className="save" onClick={handleClose} aria-label="close file">
          Close
        </button>
      </div>
    </file-opensave>
  );
}
