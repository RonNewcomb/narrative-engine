import { closeProject, loadProject, newProject, saveProject } from "./services/project";
import { Project, useProject } from "./services/useProject";

export function FileOpenSave({
  onSave,
  onNew,
  onLoad,
  onClose,
  onError,
}: {
  onSave?: (e?: { detail: string }) => void;
  onNew?: (project: Project) => void;
  onError?: (msg: string) => void;
  onLoad?: (project: Project) => void;
  onClose?: (e?: { detail: string }) => void;
}) {
  const { project, setProject } = useProject();
  const filename = project?.record.filename;

  const handleNew = async () => {
    const project = await newProject();
    if (!project) return;
    if (typeof project === "string") return onError?.(project);
    setProject(project);
    onNew?.(project);
  };

  const handleSave = async () => {
    const x = await saveProject(project!);
    if (!x) return;
    onSave?.(x);
  };

  const handleLoad = async () => {
    const project = await loadProject();
    if (!project) return;
    if (typeof project === "string") return onError?.(project);
    setProject(project);
    onLoad?.(project);
  };

  const handleClose = async () => {
    const x = await closeProject(project!);
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
      `}</style>
      <div style={{ display: filename ? "none" : "block" }}>
        <button className="actionbutton" onClick={handleNew} aria-label="new story">
          New
        </button>
        <button className="actionbutton" onClick={handleLoad} aria-label="open story">
          Open
        </button>
      </div>
      <div style={{ display: filename ? "flex" : "none", gap: "2em" }}>
        <div className="save-header" onClick={handleSave}>
          {filename}{" "}
          <button className="actionbutton" aria-label="save file">
            Save
          </button>
        </div>
        <button className="actionbutton close" onClick={handleClose} aria-label="close file">
          Close
        </button>
      </div>
    </file-opensave>
  );
}
