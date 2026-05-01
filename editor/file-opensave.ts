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
        file-opensave .save {
          background-color: #497d7e;
          color: white;
          padding: 0.5em 1em;
          border: none;
          border-radius: 1em;
        }
      </style>
      <div style="display: ${filename ? "none" : "block"}">
        <input type="file" onchange="handleFileSelect(event)" />
      </div>
      <div style="display: ${filename ? "block" : "none"}">
        ${filename} <button class="save" onclick="saveFile()">Save</button> 
      </div>
    </div>`;
}

(window as any).handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement)?.files?.[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target?.result as string;
    render(file?.name);
    if (!content) return alert("No content gotten from file.");
    (window as any).view.dispatch({ changes: { from: 0, to: (window as any).view.state.doc.length, insert: content } });
  };
  if (file) reader.readAsText(file);
};

document.addEventListener("DOMContentLoaded", () => render());
