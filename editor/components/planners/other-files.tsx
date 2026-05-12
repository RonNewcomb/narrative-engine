let folder: FileSystemDirectoryHandle | undefined;

export function clear() {
  folder = undefined;
}

export async function render(folderHandle?: FileSystemDirectoryHandle) {
  folder = folderHandle || folder;
  const el = document.querySelector("#plannr > other-files");
  if (!el || !folder) return;
  return (el.innerHTML = await renderRecurse(folder));
}

async function renderRecurse(folder: FileSystemDirectoryHandle) {
  if (!folder) return "";

  const nodes: string[] = [];

  for await (const [key, value] of folder.entries()) {
    if (key !== "about.json") {
      console.log({ key, value });

      switch (value.kind) {
        case "directory":
          nodes.push(`<details><summary>${key}</summary>${await renderRecurse(value)}</details>`);
          break;
        case "file":
          nodes.push(`<div><a onclick="openInTab('${key}')">${key}</a></div>`);
          break;
      }
    }
  }

  return nodes.join("");
}

(window as any).openInTab = (key: string) => window.open(`/editor/?file=${key}`, "_blank");
