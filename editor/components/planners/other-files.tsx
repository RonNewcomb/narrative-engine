import { useMemo, useState } from "react";
import { useProject } from "../services/useProject";

export function OtherFiles() {
  const { project } = useProject();
  const [nodes, setNodes] = useState<FileTree[]>([]);

  const folder = project?.topFolder;
  useMemo(() => folder && walkFolders(folder).then(setNodes), [folder]);

  if (!folder || !nodes || nodes.length == 0) return <other-files></other-files>;
  return (
    <other-files>
      <details>
        <summary>Other Files</summary>
        <OtherFilesRecurse nodes={nodes} />
      </details>
    </other-files>
  );
}

export function OtherFilesRecurse({ nodes }: { nodes: FileTree[] }) {
  return nodes.map(node => <OneOtherFile key={node.key} node={node} />);
}

export function OneOtherFile({ node }: { node: FileTree }) {
  switch (node.type) {
    case "file":
      return (
        <div>
          <a onClick={() => openInTab(node.key)}>{node.key}</a>
        </div>
      );
    case "folder":
      return (
        <details>
          <summary> {node.key} </summary>
          <OtherFilesRecurse nodes={node.nodes || []} />
        </details>
      );
  }
}

interface FileTree {
  type: "folder" | "file";
  key: string;
  value: FileSystemDirectoryHandle | FileSystemFileHandle;
  nodes?: FileTree[];
}

async function walkFolders(folder: FileSystemDirectoryHandle): Promise<FileTree[]> {
  let nodes: FileTree[] = [];
  for await (const [key, value] of (folder as any).entries()) {
    if (key === "about.json") continue;
    // console.log({ key, value });

    switch (value.kind) {
      case "directory":
        nodes.push({ type: "folder", key, value, nodes: await walkFolders(value) });
        break;
      case "file":
        nodes.push({ type: "file", key, value });
        break;
    }
  }
  return nodes;
}

function openInTab(key: string) {
  window.open(`/editor/?file=${key}`, "_blank");
}
