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
        <input type="file" onchange="loadFile(event)" />
      </div>
      <div style="display: ${filename ? "block" : "none"}" class="save-header" onclick="saveFile()">
        ${filename} <button class="save">Save</button> 
      </div>
    </div>`;
}

let filename = "";

(window as any).loadFile = (e: Event) => {
  const file = (e.target as HTMLInputElement)?.files?.[0];
  console.log(file);
  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target?.result as string;
    filename = file?.name || "";
    render(filename);
    if (!content) return alert("No content gotten from file.");
    (window as any).view.dispatch({ changes: { from: 0, to: (window as any).view.state.doc.length, insert: content } });
  };
  if (file) reader.readAsText(file);
};

(window as any).saveFile = function () {
  const content = (window as any).view.state.doc.toString();
  // Your custom save logic here (e.g., API call)
  console.log("Saving content:", content);
  showSaveFilePicker();
  fetch("/api/save", { method: "POST", body: content }).then(console.log);
  return true; // Prevents the browser's default save dialog
};

document.addEventListener("DOMContentLoaded", () => render());
