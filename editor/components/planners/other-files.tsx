import { JSX } from "react";

let folder: FileSystemDirectoryHandle | undefined;

export function clear() {
  folder = undefined;
}

export async function OtherFiles({ folder: folderHandle }: { folder?: FileSystemDirectoryHandle }) {
  folder = folderHandle || folder;
  return <other-files>{folderHandle && <OtherFilesRecurse folder={folderHandle} />}</other-files>;
}

export async function OtherFilesRecurse({ folder }: { folder: FileSystemDirectoryHandle }) {
  if (!folder) return "";

  const nodes: JSX.Element[] = [];

  for await (const [key, value] of (folder as any).entries()) {
    if (key !== "about.json") {
      console.log({ key, value });

      switch (value.kind) {
        case "directory":
          nodes.push(
            <details>
              <summary>${key}</summary>
              <OtherFilesRecurse folder={value as FileSystemDirectoryHandle} />
            </details>,
          );
          break;
        case "file":
          nodes.push(
            <div>
              <a onClick={() => openInTab(key)}>${key}</a>
            </div>,
          );
          break;
      }
    }
  }

  return <>{nodes}</>;
}

function openInTab(key: string) {
  window.open(`/editor/?file=${key}`, "_blank");
}
